import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildLibraryScriptTags } from "@/lib/libraries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch game and content
  const { data: game } = await supabase
    .from("games")
    .select("id, libraries, status, play_count")
    .eq("slug", slug)
    .single();

  if (!game || game.status !== "active") {
    return new NextResponse("Game not found", { status: 404 });
  }

  const { data: content } = await supabase
    .from("game_content")
    .select("html")
    .eq("game_id", game.id)
    .single();

  if (!content) {
    return new NextResponse("Game content not found", { status: 404 });
  }

  // Increment play count (fire and forget)
  supabase
    .from("games")
    .update({ play_count: (game.play_count || 0) + 1 })
    .eq("id", game.id)
    .then(() => {});

  const libraryScripts = buildLibraryScriptTags(game.libraries || []);
  const gameHtml = content.html;

  // Detect if game already has a full HTML document
  const hasDoctype = /<!DOCTYPE\s+html/i.test(gameHtml);
  const hasHtmlTag = /<html[\s>]/i.test(gameHtml);

  let fullHtml: string;

  if (hasDoctype || hasHtmlTag) {
    // Inject library scripts into existing <head>
    if (libraryScripts && /<head[\s>]/i.test(gameHtml)) {
      fullHtml = gameHtml.replace(
        /(<head[^>]*>)/i,
        `$1\n  ${libraryScripts}`
      );
    } else if (libraryScripts) {
      fullHtml = gameHtml.replace(
        /(<html[^>]*>)/i,
        `$1\n<head>\n  ${libraryScripts}\n</head>`
      );
    } else {
      fullHtml = gameHtml;
    }
  } else {
    // Wrap in a full HTML document
    fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
  </style>
  ${libraryScripts}
</head>
<body>
${gameHtml}
</body>
</html>`;
  }

  return new NextResponse(fullHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; img-src * data: blob:; media-src * data: blob:; connect-src 'none'; form-action 'none'; frame-ancestors *;",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
