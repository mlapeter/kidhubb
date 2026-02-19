"use client";

import { useState } from "react";

interface StarButtonProps {
  gameId: string;
  initialCount: number;
}

export default function StarButton({ gameId, initialCount }: StarButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [starred, setStarred] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStar() {
    if (starred || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/like`, { method: "POST" });

      if (res.status === 201) {
        setCount((c) => c + 1);
        setStarred(true);
      } else if (res.status === 409) {
        setStarred(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleStar}
      disabled={starred || loading}
      className={`rpg-panel inline-flex items-center gap-2 px-4 py-2 text-[10px] transition-colors ${
        starred
          ? "text-accent-gold cursor-default"
          : "text-wood-mid/70 hover:text-accent-gold cursor-pointer"
      }`}
    >
      <span className={starred ? "pixel-pulse" : ""}>{starred ? "⭐" : "☆"}</span>
      <span>{count} {count === 1 ? "star" : "stars"}</span>
    </button>
  );
}
