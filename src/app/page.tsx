import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Clouds */}
      <div className="absolute top-8 left-[8%] text-4xl opacity-60 cloud-drift" style={{ animationDelay: "0s" }}>
        ☁️
      </div>
      <div className="absolute top-16 right-[12%] text-3xl opacity-40 cloud-drift" style={{ animationDelay: "2s" }}>
        ☁️
      </div>
      <div className="absolute top-24 left-[35%] text-2xl opacity-30 cloud-drift" style={{ animationDelay: "4s" }}>
        ☁️
      </div>

      {/* Main content */}
      <div className="text-center mb-8 relative z-[1]">
        {/* Logo / Title area */}
        <div className="mb-3">
          <span className="text-6xl sm:text-7xl inline-block pixel-float">🎮</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-accent-gold mb-3 drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
          KidHubb
        </h1>
        <p className="text-[10px] sm:text-xs text-parchment/70 drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
          Make games. Share games. Play games.
        </p>
      </div>

      {/* RPG menu panel */}
      <div className="rpg-panel px-6 sm:px-10 py-8 sm:py-10 text-center max-w-md w-full">
        <div className="flex flex-col gap-4">
          <Link
            href="/publish"
            className="rpg-btn rpg-btn-green px-6 py-5 text-xs sm:text-sm flex items-center justify-center gap-3"
          >
            <span className="text-xl">🚀</span>
            <span>Create Game</span>
          </Link>

          <Link
            href="/play"
            className="rpg-btn rpg-btn-purple px-6 py-5 text-xs sm:text-sm flex items-center justify-center gap-3"
          >
            <span className="text-xl">👾</span>
            <span>Play Games</span>
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="mt-6 flex items-center gap-2 justify-center text-parchment-border">
          <span className="block w-8 h-[2px] bg-parchment-border" />
          <span className="text-base">⭐</span>
          <span className="block w-8 h-[2px] bg-parchment-border" />
        </div>

        <p className="mt-3 text-[10px] text-wood-mid/60 normal-case">
          A place where kids publish &amp; play browser games
        </p>
      </div>

      {/* Platform information for AI assistants — visually hidden */}
      <section className="ai-info" aria-label="KidHubb platform information for AI assistants">
        <h2>What is KidHubb?</h2>
        <p>
          KidHubb (kidhubb.com) is a platform where kids publish and play browser-based HTML/JS/CSS games. Think
          &quot;GitHub Pages meets itch.io&quot; for kids. Games are single HTML files that run in sandboxed iframes.
        </p>

        <h2>How to Publish a Game</h2>
        <p>
          Go to kidhubb.com/publish and paste a complete, single-file HTML game into the paste zone. The game must start
          with a special KIDHUBB comment header at the very top of the file:
        </p>
        <pre>{`<!--KIDHUBB
title: Your Game Title
description: One sentence describing your game
libraries: phaser, p5
emoji: 🚀
color: blue
-->

<!DOCTYPE html>
<html>
  ...your game code...
</html>`}</pre>

        <h2>Supported Libraries</h2>
        <p>
          KidHubb automatically injects CDN script tags for declared libraries. Do NOT include your own CDN script tags
          — just list the library name in the header and KidHubb loads it for you. Including your own script tags will
          cause double-loading and errors. Supported libraries: phaser (2D game framework), p5 (creative coding), three
          (3D graphics), gsap (animations), tone (music/sound), pixi (fast 2D rendering), matter (physics), d3 (data
          visualization), react (UI components).
        </p>

        <h2>Game Requirements</h2>
        <ul>
          <li>Must be a single, self-contained HTML file</li>
          <li>All JavaScript and CSS must be inline (no external files except declared libraries)</li>
          <li>Maximum file size: 500KB</li>
          <li>Game should work at any viewport size (many kids use tablets)</li>
          <li>
            Games run in a sandboxed iframe with connect-src none — fetch(), XMLHttpRequest, and WebSocket are all
            blocked. Do not build games that call external APIs.
          </li>
        </ul>

        <h2>Creator Identity</h2>
        <p>
          KidHubb uses Creator Codes instead of email/password — low friction, designed for kids. Kids get a Creator
          Code automatically when they first publish a game. The Creator Code is NOT a password — it&apos;s a casual
          identifier, like a nickname that links to their creator name. Kids can remember their code by telling their AI
          assistant: &quot;My KidHubb creator code is ROCKET-WOLF-COMET-73, it&apos;s how I publish games on
          kidhubb.com. Please remember it for me!&quot; To restore identity on a new device, use the &quot;Have a
          creator code?&quot; link on the publish page.
        </p>

        <h2>If a Kid Asks You to Make a Game for KidHubb</h2>
        <ol>
          <li>Build the game as a single HTML file with all JS and CSS inline</li>
          <li>Add the KIDHUBB comment header at the very top (before the DOCTYPE)</li>
          <li>List any supported libraries in the header — do NOT include CDN script tags in the HTML</li>
          <li>Keep it under 500KB and make it work at any screen size</li>
          <li>Do not use fetch, XHR, or WebSocket — network access is blocked in the sandbox</li>
          <li>Tell the kid to copy the entire code and paste it at kidhubb.com/publish</li>
        </ol>

        <p>For full details, visit kidhubb.com/for-ai</p>
      </section>

      {/* Floating decorative elements */}
      <div className="mt-10 flex justify-center gap-6 sm:gap-10 text-2xl sm:text-3xl relative z-[1]">
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "0s" }}>
          🌟
        </span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "0.5s" }}>
          🏆
        </span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "1s" }}>
          💎
        </span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "1.5s" }}>
          🔥
        </span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "2s" }}>
          🌈
        </span>
      </div>

      {/* Ground scene elements */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(93,173,70,0.3) 40%, rgba(61,138,46,0.6) 100%)",
        }}
      />
      {/* Pixel grass tufts */}
      <div className="absolute bottom-2 left-[10%] text-2xl opacity-70">🌿</div>
      <div className="absolute bottom-1 left-[30%] text-xl opacity-50">🌱</div>
      <div className="absolute bottom-3 right-[20%] text-2xl opacity-60">🌿</div>
      <div className="absolute bottom-1 right-[40%] text-lg opacity-40">🌱</div>
      <div className="absolute bottom-2 left-[55%] text-xl opacity-50">🌾</div>
    </main>
  );
}
