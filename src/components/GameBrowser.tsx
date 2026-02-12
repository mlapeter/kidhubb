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

  const tabs: { key: SortOption; label: string }[] = [
    { key: "newest", label: "New" },
    { key: "popular", label: "Popular" },
    { key: "liked", label: "Liked" },
  ];

  return (
    <>
      {/* Sort tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSort(tab.key)}
            className={`px-4 py-2 text-[10px] sm:text-xs border-b-4 transition-colors ${
              sort === tab.key
                ? "border-accent-yellow text-accent-yellow"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="text-4xl pixel-blink">▶</span>
          <p className="mt-4 text-xs text-foreground/50">Loading...</p>
        </div>
      ) : (
        <GameGrid games={games} />
      )}
    </>
  );
}
