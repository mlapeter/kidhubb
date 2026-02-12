import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get or create a session ID from cookies
  const sessionId =
    request.cookies.get("kh_session")?.value ||
    crypto.randomUUID();

  // Check if game exists
  const { data: game } = await supabase
    .from("games")
    .select("id, like_count")
    .eq("id", id)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  // Try to insert like (unique constraint will prevent duplicates)
  const { error } = await supabase.from("likes").insert({
    game_id: id,
    session_id: sessionId,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already liked" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }

  // Increment like count
  await supabase
    .from("games")
    .update({ like_count: (game.like_count || 0) + 1 })
    .eq("id", id);

  // Set session cookie if not present
  const response = NextResponse.json({ success: true }, { status: 201 });
  if (!request.cookies.get("kh_session")) {
    response.cookies.set("kh_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}
