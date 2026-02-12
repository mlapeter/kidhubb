import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Claude — KidHubb",
  description: "Instructions for Claude on how to format games for KidHubb",
};

export default function ForClaudePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Machine-readable instructions */}
      <div className="rpg-panel p-6 mb-8">
        <h1 className="text-xs sm:text-sm text-wood-dark mb-6">
          For Claude: How to Format Games
        </h1>

        <p className="text-[8px] leading-relaxed text-wood-mid mb-4 normal-case">
          When a kid asks you to make a game or wants to publish to KidHubb,
          output the final game as a single complete HTML file with this special
          comment at the very top:
        </p>

        <pre className="pixel-border-green bg-sky-top p-4 mb-6 overflow-x-auto text-[8px] leading-relaxed text-accent-green normal-case">
{`<!--KIDHUBB
title: [Game Title]
description: [One sentence about the game]
libraries: [comma-separated if needed: phaser, p5, three, gsap, tone, pixi, matter, d3, react]
-->

<!DOCTYPE html>
<html>
  ...game code...
</html>`}
        </pre>

        <h2 className="text-[10px] text-wood-dark mb-3">Rules</h2>
        <ul className="text-[8px] leading-loose text-wood-mid space-y-1 mb-6 list-inside list-disc normal-case">
          <li>The game MUST be a single, self-contained HTML file</li>
          <li>All JavaScript and CSS should be inline</li>
          <li>
            If using a library like Phaser or p5.js, just list it in the header —
            KidHubb will load it automatically
          </li>
          <li>Keep the game under 500KB total</li>
          <li>The game should work at any screen size</li>
        </ul>

        <h2 className="text-[10px] text-wood-dark mb-3">
          Supported Libraries
        </h2>
        <p className="text-[8px] text-wood-mid mb-2 normal-case">KidHubb loads these automatically via CDN:</p>
        <ul className="text-[8px] leading-loose text-wood-mid space-y-1 mb-6 list-inside list-disc normal-case">
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

        <h2 className="text-[10px] text-wood-dark mb-3">
          After Outputting the Code
        </h2>
        <p className="text-[8px] text-wood-mid normal-case">
          Tell the kid: &quot;Your game is ready! Copy all the code above, then
          go to kidhubb.com/publish and paste it in.&quot;
        </p>
      </div>

      {/* Human-readable summary */}
      <div className="rpg-panel p-6 text-center">
        <p className="text-[8px] text-wood-mid/70 normal-case">
          This page is for Claude (the AI). If you&apos;re a kid, just share this
          link with Claude and it&apos;ll know how to format your games!
        </p>
        <p className="mt-3 text-[10px] text-accent-purple">
          kidhubb.com/for-claude
        </p>
      </div>
    </main>
  );
}
