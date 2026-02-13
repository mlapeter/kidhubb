export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import GameBrowser from "@/components/GameBrowser";

async function getGames() {
  const { data: games } = await supabase
    .from("games")
    .select("id, slug, title, creator_id, play_count, like_count, emoji, color")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(40);

  if (!games || games.length === 0) return [];

  // Fetch creator names
  const creatorIds = [...new Set(games.map((g) => g.creator_id).filter(Boolean))];
  let creatorsMap: Record<string, string> = {};

  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("creators")
      .select("id, display_name")
      .in("id", creatorIds);

    if (creators) {
      creatorsMap = Object.fromEntries(creators.map((c) => [c.id, c.display_name]));
    }
  }

  return games.map((game) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    creator_name: creatorsMap[game.creator_id] || "Unknown",
    play_count: game.play_count,
    like_count: game.like_count,
    emoji: game.emoji,
    color: game.color,
  }));
}

export const metadata = {
  title: "Play Games — KidHubb",
  description: "Browse and play games made by kids on KidHubb!",
};

export default async function PlayPage() {
  const initialGames = await getGames();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-sm sm:text-base text-accent-gold text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        👾 All Games
      </h1>
      <div className="flex flex-col items-center">
        <GameBrowser initialGames={initialGames} />
      </div>
    </main>
  );
}
