import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For AI Assistants — KidHubb",
  description: "Instructions for AI assistants on how to format games for KidHubb",
};

export default function ForAIPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Machine-readable instructions */}
      <div className="rpg-panel p-6 mb-8">
        <h1 className="text-xs sm:text-sm text-wood-dark mb-6">For AI Assistants: How to Format Games</h1>

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
          <li>
            <strong className="text-accent-purple">phaser</strong> — 2D game framework
          </li>
          <li>
            <strong className="text-accent-purple">p5</strong> — creative coding, drawing, art
          </li>
          <li>
            <strong className="text-accent-purple">three</strong> — 3D graphics
          </li>
          <li>
            <strong className="text-accent-purple">gsap</strong> — smooth animations
          </li>
          <li>
            <strong className="text-accent-purple">tone</strong> — music and sound
          </li>
          <li>
            <strong className="text-accent-purple">pixi</strong> — fast 2D rendering
          </li>
          <li>
            <strong className="text-accent-purple">matter</strong> — physics engine
          </li>
          <li>
            <strong className="text-accent-purple">d3</strong> — data visualization
          </li>
          <li>
            <strong className="text-accent-purple">react</strong> — UI components
          </li>
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
