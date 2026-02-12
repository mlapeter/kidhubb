import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateCreatorCode } from "@/lib/creator-codes";
import { generateApiToken, hashToken } from "@/lib/auth";
import { generateDisplayName } from "@/lib/display-names";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isAuto = body.auto === true;

    let displayName: string;

    if (isAuto) {
      // Auto-create: generate a random display name
      // Try a few times to find a unique one
      let found = false;
      displayName = generateDisplayName();
      for (let i = 0; i < 10; i++) {
        const { data: existing } = await supabase
          .from("creators")
          .select("id")
          .eq("display_name", displayName)
          .single();
        if (!existing) {
          found = true;
          break;
        }
        displayName = generateDisplayName();
      }
      if (!found) {
        // Fallback: append extra random digits
        displayName = `${generateDisplayName()}${Math.floor(Math.random() * 900) + 100}`;
      }
    } else {
      displayName = body.display_name?.trim();

      if (!displayName || displayName.length < 2 || displayName.length > 30) {
        return NextResponse.json(
          { error: "Display name must be 2-30 characters" },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(displayName)) {
        return NextResponse.json(
          { error: "Display name can only contain letters, numbers, hyphens, and underscores" },
          { status: 400 }
        );
      }

      // Check if display name is taken
      const { data: existing } = await supabase
        .from("creators")
        .select("id")
        .eq("display_name", displayName)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "That name is already taken — try another!" },
          { status: 409 }
        );
      }
    }

    // Generate unique creator code
    let creatorCode: string;
    let isUnique = false;
    let attempts = 0;
    do {
      creatorCode = generateCreatorCode();
      const { data } = await supabase
        .from("creators")
        .select("id")
        .eq("creator_code", creatorCode)
        .single();
      isUnique = !data;
      attempts++;
    } while (!isUnique && attempts < 10);

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique code, please try again" },
        { status: 500 }
      );
    }

    const rawToken = generateApiToken();
    const hashedToken = hashToken(rawToken);

    const { data: creator, error } = await supabase
      .from("creators")
      .insert({
        display_name: displayName,
        creator_code: creatorCode,
        api_token: hashedToken,
      })
      .select("id, display_name, creator_code, created_at")
      .single();

    if (error) {
      console.error("Failed to create creator:", error);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ...creator,
        api_token: rawToken, // Return raw token only on creation
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
