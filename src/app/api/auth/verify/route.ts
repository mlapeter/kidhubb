import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!rateLimit(getClientIp(request), { maxRequests: 10 })) {
    return NextResponse.json({ error: "Too many requests — slow down!" }, { status: 429 });
  }

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
      .select("id, creator_code, display_name")
      .eq("creator_code", creatorCode)
      .single();

    if (!creator) {
      return NextResponse.json(
        { error: "Code not found — check for typos!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: creator.id,
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
