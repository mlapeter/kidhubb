import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateCreator } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: game, error } = await supabase
    .from("games")
    .select("id, slug, title, description, creator_id, libraries, play_count, like_count, status, created_at")
    .eq("id", id)
    .single();

  if (error || !game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name")
    .eq("id", game.creator_id)
    .single();

  return NextResponse.json({
    ...game,
    creator_name: creator?.display_name || "Unknown",
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const creator = await authenticateCreator(
    request.headers.get("authorization")
  );

  if (!creator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: game } = await supabase
    .from("games")
    .select("creator_id")
    .eq("id", id)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.creator_id !== creator.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("games").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
