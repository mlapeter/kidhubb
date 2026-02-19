import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: game } = await supabase
    .from("games")
    .select("id, status")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const { data: content } = await supabase
    .from("game_content")
    .select("html")
    .eq("game_id", game.id)
    .single();

  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json({ html: content.html });
}
