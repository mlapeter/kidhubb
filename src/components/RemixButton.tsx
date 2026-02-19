"use client";

import { useState } from "react";
import Link from "next/link";

interface RemixButtonProps {
  gameId: string;
  gameTitle: string;
  gameSlug: string;
}

export default function RemixButton({ gameId, gameTitle, gameSlug }: RemixButtonProps) {
  const [state, setState] = useState<"idle" | "copying" | "modal">("idle");

  async function handleRemix() {
    if (state !== "idle") return;
    setState("copying");

    try {
      const res = await fetch(`/api/games/${gameId}/source`);
      if (!res.ok) {
        setState("idle");
        return;
      }

      const { html } = await res.json();

      const header = `<!--KIDHUBB\ntitle: Remix of ${gameTitle}\nremix_of: ${gameSlug}\n-->\n\n`;
      await navigator.clipboard.writeText(header + html);
      setState("modal");
    } catch {
      setState("idle");
    }
  }

  function closeModal() {
    setState("idle");
  }

  return (
    <>
      <button
        onClick={handleRemix}
        disabled={state === "copying"}
        className="rpg-panel inline-flex items-center gap-2 px-4 py-2 text-[10px] text-wood-mid/70 hover:text-accent-purple transition-colors cursor-pointer"
      >
        {state === "copying" ? "⏳" : "🔀"} Remix
      </button>

      {state === "modal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={closeModal}>
          <div className="rpg-panel p-8 max-w-md mx-4 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">📋</div>
            <h2 className="text-sm text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
              Code Copied!
            </h2>
            <p className="text-[10px] text-wood-mid/70 normal-case">
              The game code is in your clipboard. Paste it into your AI chat, tell it what you want to change, then publish your remix!
            </p>
            <Link
              href={`/publish?remix_of=${gameSlug}`}
              className="rpg-btn rpg-btn-green block w-full px-4 py-3 text-[10px] text-center"
            >
              🚀 Publish Your Remix
            </Link>
            <button
              onClick={closeModal}
              className="text-[10px] text-wood-mid/50 hover:text-wood-dark"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
