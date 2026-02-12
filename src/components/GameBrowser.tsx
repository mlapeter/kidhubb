"use client";

import { useState } from "react";
import GameGrid from "@/components/GameGrid";

type SortOption = "newest" | "popular" | "liked";

interface Game {
  id: string;
  slug: string;
  title: string;
  creator_name: string;
  play_count: number;
  like_count: number;
}

export default function GameBrowser({ initialGames }: { initialGames: Game[] }) {
  const [sort, setSort] = useState<SortOption>("newest");
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false);

  function handleSort(key: SortOption) {
    if (key === sort) return;
    setSort(key);
    setLoading(true);

    fetch(`/api/games?limit=40&sort=${key}`)
      .then((res) => res.json())
      .then((data) => {
        setGames(data.games || []);
      })
      .catch(() => {
        setGames([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const tabs: { key: SortOption; label: string; icon: string }[] = [
    { key: "newest", label: "New", icon: "✨" },
    { key: "popular", label: "Popular", icon: "🔥" },
    { key: "liked", label: "Liked", icon: "♥" },
  ];

  return (
    <>
      {/* Sort tabs in RPG panel */}
      <div className="rpg-panel inline-flex mx-auto mb-8 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSort(tab.key)}
            className={`px-4 py-2 text-[10px] transition-colors ${
              sort === tab.key
                ? "bg-wood-mid text-accent-gold"
                : "text-wood-dark/50 hover:text-wood-dark"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="text-4xl pixel-blink">⏳</span>
          <p className="mt-4 text-xs text-parchment/50">Loading...</p>
        </div>
      ) : (
        <GameGrid games={games} />
      )}
    </>
  );
}
