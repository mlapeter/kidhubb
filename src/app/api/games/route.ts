import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateCreator } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";
import { scanGameContent, MAX_HTML_SIZE, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from "@/lib/safety";
import { VALID_LIBRARY_KEYS } from "@/lib/libraries";
import { VALID_COLORS, type GameColor } from "@/lib/parse-game";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const sort = searchParams.get("sort") || "newest";
  const offset = (page - 1) * limit;

  let orderColumn = "created_at";
  if (sort === "popular") orderColumn = "play_count";
  if (sort === "liked") orderColumn = "like_count";

  const { data: games, error, count } = await supabase
    .from("games")
    .select("id, slug, title, description, creator_id, libraries, play_count, like_count, emoji, color, created_at", { count: "exact" })
    .eq("status", "active")
    .order(orderColumn, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }

  // Fetch creator names for all games
  const creatorIds = [...new Set((games || []).map((g) => g.creator_id).filter(Boolean))];
  let creatorsMap: Record<string, string> = {};

  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("creators")
      .select("id, display_name")
      .in("id", creatorIds);

    if (creators) {
      creatorsMap = Object.fromEntries(creators.map((c) => [c.id, c.display_name]));
    }
  }

  const gamesWithCreators = (games || []).map((game) => ({
    ...game,
    creator_name: creatorsMap[game.creator_id] || "Unknown",
  }));

  return NextResponse.json({
    games: gamesWithCreators,
    total: count || 0,
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  if (!rateLimit(getClientIp(request))) {
    return NextResponse.json({ error: "Too many requests — slow down!" }, { status: 429 });
  }

  try {
    const creator = await authenticateCreator(
      request.headers.get("authorization")
    );

    // Also support creator_code auth for web form
    const body = await request.json();
    let creatorId = creator?.id;
    let creatorName = creator?.display_name;

    if (!creatorId && body.creator_code) {
      const { data } = await supabase
        .from("creators")
        .select("id, display_name")
        .eq("creator_code", body.creator_code)
        .single();

      if (data) {
        creatorId = data.id;
        creatorName = data.display_name;
      }
    }

    if (!creatorId || !creatorName) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const title = body.title?.trim() || "Untitled Game";
    const description = body.description?.trim() || null;
    const html = body.html;
    const libraries = (body.libraries || []).filter((l: string) =>
      VALID_LIBRARY_KEYS.includes(l)
    );
    const emoji = body.emoji?.trim() || null;
    const color = VALID_COLORS.includes(body.color as GameColor) ? body.color : null;

    // Resolve remix_of slug to forked_from UUID
    const remixOfSlug = body.remix_of || null;
    let forkedFrom: string | null = null;
    if (remixOfSlug) {
      const { data: original } = await supabase
        .from("games")
        .select("id")
        .eq("slug", remixOfSlug)
        .eq("status", "active")
        .single();
      if (original) forkedFrom = original.id;
    }

    // Validate
    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be under ${MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!html || typeof html !== "string") {
      return NextResponse.json(
        { error: "Game HTML is required" },
        { status: 400 }
      );
    }

    if (new TextEncoder().encode(html).length > MAX_HTML_SIZE) {
      return NextResponse.json(
        { error: "Game code is too large (max 500KB)" },
        { status: 400 }
      );
    }

    // Safety scan
    const scanResult = scanGameContent(html);
    if (!scanResult.safe) {
      return NextResponse.json(
        {
          error: "Game code contains blocked patterns",
          warnings: scanResult.warnings,
        },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(title, creatorName);
    const { data: existingSlug } = await supabase
      .from("games")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const contentHash = crypto
      .createHash("sha256")
      .update(html)
      .digest("hex");

    // Insert game
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        slug,
        title,
        description,
        creator_id: creatorId,
        libraries,
        emoji,
        color,
        forked_from: forkedFrom,
      })
      .select("id, slug, title, description, created_at")
      .single();

    if (gameError) {
      console.error("Failed to create game:", gameError);
      return NextResponse.json(
        { error: "Failed to publish game" },
        { status: 500 }
      );
    }

    // Insert game content
    const { error: contentError } = await supabase
      .from("game_content")
      .insert({
        game_id: game.id,
        html,
        content_hash: contentHash,
      });

    if (contentError) {
      // Rollback game creation
      await supabase.from("games").delete().eq("id", game.id);
      console.error("Failed to save game content:", contentError);
      return NextResponse.json(
        { error: "Failed to save game content" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: game.id,
        slug: game.slug,
        url: `https://kidhubb.com/play/${game.slug}`,
        title: game.title,
        creator: creatorName,
        created_at: game.created_at,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
