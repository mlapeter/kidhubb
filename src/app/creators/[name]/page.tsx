import { cache } from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GameCard from "@/components/GameCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ name: string }>;
}

const getCreatorAndGames = cache(async function getCreatorAndGames(name: string) {
  const decodedName = decodeURIComponent(name);

  // Escape ilike wildcards so % and _ in names are treated as literals
  const escapedName = decodedName.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const { data: creator } = await supabase
    .from("creators")
    .select("id, display_name")
    .ilike("display_name", escapedName)
    .single();

  if (!creator) return null;

  const { data: games } = await supabase
    .from("games")
    .select("id, slug, title, description, play_count, like_count, emoji, color, created_at")
    .eq("creator_id", creator.id)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  return {
    creator,
    games: games || [],
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const data = await getCreatorAndGames(name);

  if (!data) return { title: "Creator Not Found — KidHubb" };

  return {
    title: `${data.creator.display_name} — KidHubb`,
    description: `Games by ${data.creator.display_name} on KidHubb`,
  };
}

export default async function CreatorPage({ params }: Props) {
  const { name } = await params;
  const data = await getCreatorAndGames(name);

  if (!data) notFound();

  const { creator, games } = data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          {creator.display_name}
        </h1>
        <p className="mt-2 text-[10px] text-parchment/50">
          {games.length} {games.length === 1 ? "game" : "games"} published
        </p>
      </div>

      {games.length === 0 ? (
        <div className="rpg-panel flex flex-col items-center justify-center py-16 px-8 text-center mx-auto max-w-md">
          <span className="text-5xl pixel-float">👾</span>
          <h2 className="mt-4 text-xs text-wood-dark">No games yet!</h2>
          <p className="mt-2 text-[10px] text-wood-mid/60 normal-case">
            This creator hasn&apos;t published any games yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {games.map((game, index) => (
            <div key={game.id}>
              <p className="text-[10px] text-parchment/30 mb-1">Game #{index + 1}</p>
              <GameCard
                slug={game.slug}
                title={game.title}
                creatorName={creator.display_name}
                playCount={game.play_count}
                likeCount={game.like_count}
                emoji={game.emoji}
                color={game.color}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
