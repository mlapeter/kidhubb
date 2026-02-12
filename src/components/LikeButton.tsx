"use client";

import { useState } from "react";

interface LikeButtonProps {
  gameId: string;
  initialCount: number;
}

export default function LikeButton({ gameId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (liked || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/like`, { method: "POST" });

      if (res.status === 201) {
        setCount((c) => c + 1);
        setLiked(true);
      } else if (res.status === 409) {
        // Already liked
        setLiked(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`rpg-panel inline-flex items-center gap-2 px-4 py-2 text-[10px] transition-colors ${
        liked
          ? "text-accent-red cursor-default"
          : "text-wood-mid/70 hover:text-accent-red cursor-pointer"
      }`}
    >
      <span className={liked ? "pixel-pulse" : ""}>{liked ? "♥" : "♡"}</span>
      <span>{count} {count === 1 ? "like" : "likes"}</span>
    </button>
  );
}
