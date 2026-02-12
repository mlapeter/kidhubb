import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const creatorCode = body.creator_code?.trim()?.toUpperCase();

    if (!creatorCode) {
      return NextResponse.json(
        { error: "Creator code is required" },
        { status: 400 }
      );
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("creator_code, display_name")
      .eq("creator_code", creatorCode)
      .single();

    if (!creator) {
      return NextResponse.json(
        { error: "Code not found — check for typos!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      creator_code: creator.creator_code,
      display_name: creator.display_name,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
