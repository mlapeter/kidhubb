import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect kidhubb.com -> arcadelab.ai (preserve path and query)
  if (host === "kidhubb.com" || host === "www.kidhubb.com") {
    const url = new URL(request.url);
    url.host = "arcadelab.ai";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  // Redirect play.kidhubb.com -> play.arcadelab.ai (preserve path)
  if (host === "play.kidhubb.com") {
    const url = new URL(request.url);
    url.host = "play.arcadelab.ai";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
