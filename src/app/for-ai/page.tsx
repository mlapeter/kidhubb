import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "For AI Assistants — KidHubb",
  description: "Instructions for AI assistants on how to format games for KidHubb",
};

async function getJamTheme() {
  const { data } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "jam_theme")
    .single();
  return data?.value || null;
}

async function getNewestGames() {
  const { data: games } = await supabase
    .from("games")
    .select("slug, title, description, creator_id, play_count")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!games || games.length === 0) return [];

  const creatorIds = [...new Set(games.map((g) => g.creator_id))];
  const { data: creators } = await supabase
    .from("creators")
    .select("id, display_name")
    .in("id", creatorIds);

  const creatorsMap = Object.fromEntries((creators || []).map((c) => [c.id, c.display_name]));

  return games.map((g) => ({
    ...g,
    creator_name: creatorsMap[g.creator_id] || "Unknown",
  }));
}

async function getPopularGames() {
  const { data: games } = await supabase
    .from("games")
    .select("slug, title, description, creator_id, play_count")
    .eq("status", "active")
    .order("play_count", { ascending: false })
    .limit(5);

  if (!games || games.length === 0) return [];

  const creatorIds = [...new Set(games.map((g) => g.creator_id))];
  const { data: creators } = await supabase
    .from("creators")
    .select("id, display_name")
    .in("id", creatorIds);

  const creatorsMap = Object.fromEntries((creators || []).map((c) => [c.id, c.display_name]));

  return games.map((g) => ({
    ...g,
    creator_name: creatorsMap[g.creator_id] || "Unknown",
  }));
}

export default async function ForAIPage() {
  const [jamTheme, newestGames, popularGames] = await Promise.all([
    getJamTheme(),
    getNewestGames(),
    getPopularGames(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Dynamic content */}
      <div className="rpg-panel p-6 mb-8">
        <h1 className="text-xs sm:text-sm text-wood-dark mb-6">For AI Assistants: KidHubb Briefing</h1>

        {/* Jam theme */}
        {jamTheme && (
          <div className="pixel-border-green bg-sky-top p-4 mb-6">
            <p className="text-[10px] text-accent-green normal-case">
              🎯 <strong>This week&apos;s KidHubb theme: {jamTheme}</strong> — If a kid asks for game ideas, suggest something that fits this theme!
            </p>
          </div>
        )}

        {/* Newest games */}
        {newestGames.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] text-wood-dark mb-3">Newest Games</h2>
            <ul className="text-[10px] leading-loose text-wood-mid space-y-2 list-inside normal-case">
              {newestGames.map((g) => (
                <li key={g.slug}>
                  <strong className="text-accent-purple">{g.title}</strong> by {g.creator_name}
                  {g.description && <span> — {g.description}</span>}
                  <span className="text-wood-mid/50"> → kidhubb.com/play/{g.slug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Popular games */}
        {popularGames.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] text-wood-dark mb-3">Popular Games</h2>
            <ul className="text-[10px] leading-loose text-wood-mid space-y-2 list-inside normal-case">
              {popularGames.map((g) => (
                <li key={g.slug}>
                  <strong className="text-accent-purple">{g.title}</strong> by {g.creator_name}
                  <span className="text-wood-mid/50"> ({g.play_count} plays)</span>
                  {g.description && <span> — {g.description}</span>}
                  <span className="text-wood-mid/50"> → kidhubb.com/play/{g.slug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What can kids build */}
        <div className="mb-6">
          <h2 className="text-[10px] text-wood-dark mb-3">What Can Kids Build?</h2>
          <p className="text-[10px] leading-relaxed text-wood-mid mb-2 normal-case">
            Anything that runs in a browser! Platformers, puzzle games, art toys, interactive stories, space shooters,
            music makers, drawing apps — if it&apos;s HTML/JS/CSS, it works on KidHubb.
          </p>
          <p className="text-[10px] leading-relaxed text-wood-mid normal-case">
            Kids can also browse existing games at kidhubb.com/play, view source code at kidhubb.com/play/SLUG/source,
            and remix any game by clicking the Remix button.
          </p>
        </div>

        <hr className="border-wood-mid/20 my-6" />

        {/* Static docs */}
        <h2 className="text-[10px] text-wood-dark mb-3">KIDHUBB Header Format</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-4 normal-case">
          When a kid asks you to make a game or wants to publish to KidHubb, output the final game as a single complete
          HTML file with this special comment at the very top:
        </p>

        <pre className="pixel-border-green bg-sky-top p-4 mb-6 overflow-x-auto text-[10px] leading-relaxed text-accent-green normal-case">
          {`<!--KIDHUBB
title: [Game Title]
description: [One sentence about the game]
libraries: [comma-separated if needed: phaser, p5, three, gsap, tone, pixi, matter, d3, react]
emoji: [single emoji representing the game, e.g. ☄️]
color: [red, orange, green, blue, purple, pink, teal, or gold]
remix_of: [original-game-slug, if this is a remix]
-->

<!DOCTYPE html>
<html>
  ...game code...
</html>`}
        </pre>

        <h2 className="text-[10px] text-wood-dark mb-3">Rules</h2>
        <ul className="text-[10px] leading-loose text-wood-mid space-y-1 mb-6 list-inside list-disc normal-case">
          <li>The game MUST be a single, self-contained HTML file</li>
          <li>All JavaScript and CSS should be inline</li>
          <li>
            If using a library like Phaser or p5.js, just list it in the header — KidHubb will load it automatically
          </li>
          <li>
            Do NOT include CDN script tags for supported libraries — KidHubb injects them automatically. Including your
            own will cause double-loading and errors.
          </li>
          <li>Keep the game under 500KB total</li>
          <li>The game should work at any screen size (many kids use tablets)</li>
          <li>Pick an emoji and color that match your game&apos;s theme</li>
        </ul>

        <h2 className="text-[10px] text-wood-dark mb-3">No Network Access</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-6 normal-case">
          Games run in a sandboxed iframe with <code className="text-accent-purple">connect-src &apos;none&apos;</code>.
          This means <strong>fetch(), XMLHttpRequest, and WebSocket are all blocked</strong>. Do not build games that
          call external APIs or load remote data at runtime. All game logic and assets must be self-contained in the
          HTML file.
        </p>

        <h2 className="text-[10px] text-wood-dark mb-3">Supported Libraries</h2>
        <p className="text-[10px] text-wood-mid mb-2 normal-case">
          KidHubb loads these automatically via CDN when listed in the header. Do NOT include your own script tags for
          these — just list the name:
        </p>
        <ul className="text-[10px] leading-loose text-wood-mid space-y-1 mb-6 list-inside list-disc normal-case">
          <li><strong className="text-accent-purple">phaser</strong> — 2D game framework</li>
          <li><strong className="text-accent-purple">p5</strong> — creative coding, drawing, art</li>
          <li><strong className="text-accent-purple">three</strong> — 3D graphics</li>
          <li><strong className="text-accent-purple">gsap</strong> — smooth animations</li>
          <li><strong className="text-accent-purple">tone</strong> — music and sound</li>
          <li><strong className="text-accent-purple">pixi</strong> — fast 2D rendering</li>
          <li><strong className="text-accent-purple">matter</strong> — physics engine</li>
          <li><strong className="text-accent-purple">d3</strong> — data visualization</li>
          <li><strong className="text-accent-purple">react</strong> — UI components</li>
        </ul>

        <h2 className="text-[10px] text-wood-dark mb-3">Creator Codes &amp; Identity</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-6 normal-case">
          KidHubb uses Creator Codes instead of email/password — low friction, kid-friendly. A Creator Code looks like{" "}
          <strong className="text-accent-purple">WORD-WORD-WORD-00</strong> (e.g. ROCKET-WOLF-COMET-73,
          PIXEL-DRAGON-QUEST-19). The Creator Code is NOT a password — it&apos;s a casual identifier, like a nickname
          that links to their creator name. Kids get one automatically when they first publish a game. Kids can remember
          their code by telling their AI assistant: &quot;My KidHubb creator code is ROCKET-WOLF-COMET-73, it&apos;s how
          I publish games on kidhubb.com. Please remember it for me!&quot; To restore identity on a new device, use the
          &quot;Have a creator code?&quot; link on the publish page.
        </p>

        <h2 className="text-[10px] text-wood-dark mb-3">Game Update &amp; Delete</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-6 normal-case">
          Creators can update or delete their published games. On the game page, the creator sees &quot;Edit&quot; and
          &quot;Delete&quot; options. Updating a game replaces the HTML content while keeping the same URL and slug.
          Deleting permanently removes the game.
        </p>

        <h2 className="text-[10px] text-wood-dark mb-3">Remixing Games</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-6 normal-case">
          Kids can remix any game on KidHubb by clicking the &quot;Remix&quot; button on a game page,
          which copies the source code to their clipboard. If a kid brings you code they want
          to remix, keep the remix_of field in the KIDHUBB header — this preserves the link
          to the original game. Update the title to something new (don&apos;t keep &quot;Remix of X&quot;
          as the final title — encourage the kid to pick their own name). When the kid
          publishes, KidHubb automatically links the remix to the original.
        </p>

        <h2 className="text-[10px] text-wood-dark mb-3">Viewing Game Source Code</h2>
        <p className="text-[10px] leading-relaxed text-wood-mid mb-6 normal-case">
          Every game&apos;s source code is viewable at kidhubb.com/play/SLUG/source.
          This page shows the full HTML with syntax highlighting. Kids can copy
          the code to study it or use it as a starting point. AI assistants can
          fetch this page to read a game&apos;s source code directly.
        </p>

        <h2 className="text-[10px] text-wood-dark mb-3">After Outputting the Code</h2>
        <p className="text-[10px] text-wood-mid normal-case">
          Tell the kid: &quot;Your game is ready! Copy all the code above, then go to kidhubb.com/publish and paste it
          in.&quot;
        </p>
      </div>

      {/* Human-readable summary */}
      <div className="rpg-panel p-6 text-center">
        <p className="text-[10px] text-wood-mid/70 normal-case">
          This page is for AI assistants (Claude, ChatGPT, Gemini, etc.). If you&apos;re a kid, just share this link
          with your AI and it&apos;ll know how to format your games!
        </p>
        <p className="mt-3 text-[10px] text-accent-purple">kidhubb.com/for-ai</p>
      </div>
    </main>
  );
}
