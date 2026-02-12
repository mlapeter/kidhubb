import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GamePlayer from "@/components/GamePlayer";
import CreatorBadge from "@/components/CreatorBadge";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getGame(slug: string) {
  const { data: game } = await supabase
    .from("games")
    .select("id, slug, title, description, creator_id, play_count, like_count, status, created_at")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!game) return null;

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name")
    .eq("id", game.creator_id)
    .single();

  return {
    ...game,
    creator_name: creator?.display_name || "Unknown",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) return { title: "Game Not Found — KidHubb" };

  return {
    title: `${game.title} — KidHubb`,
    description: game.description || `Play ${game.title} by ${game.creator_name} on KidHubb!`,
  };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {/* Game header */}
      <div className="mb-4">
        <h1 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          {game.title}
        </h1>
        <CreatorBadge name={game.creator_name} />
        {game.description && (
          <p className="mt-1 text-[10px] text-parchment/60">
            {game.description}
          </p>
        )}
      </div>

      {/* Game iframe */}
      <GamePlayer slug={game.slug} title={game.title} />

      {/* Stats bar */}
      <div className="mt-4 rpg-panel inline-flex px-4 py-2 gap-4 text-[10px] text-wood-mid/70">
        <span>♥ {game.like_count} likes</span>
        <span>▶ {game.play_count} plays</span>
      </div>
    </main>
  );
}
