import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: game } = await supabase
    .from("games")
    .select("id, slug, title, description, creator_id, libraries, status")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name")
    .eq("id", game.creator_id)
    .single();

  return NextResponse.json({
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description,
    libraries: game.libraries,
    creator_id: game.creator_id,
    creator_name: creator?.display_name || "Unknown",
  });
}
