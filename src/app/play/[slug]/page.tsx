import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GamePlayer from "@/components/GamePlayer";
import CreatorBadge from "@/components/CreatorBadge";
import LikeButton from "@/components/LikeButton";
import GameOwnerActions from "@/components/GameOwnerActions";
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
    .select("display_name, creator_code")
    .eq("id", game.creator_id)
    .single();

  return {
    ...game,
    creator_name: creator?.display_name || "Unknown",
    creator_code: creator?.creator_code || null,
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
    <main className="mx-auto max-w-5xl px-4 py-4">
      {/* Game header — title + creator on one line */}
      <div className="mb-2 flex items-baseline gap-3 flex-wrap">
        <h1 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          {game.title}
        </h1>
        <CreatorBadge name={game.creator_name} />
      </div>

      {/* Game iframe */}
      <GamePlayer slug={game.slug} title={game.title} />

      {/* Stats bar */}
      <div className="mt-2 flex items-center gap-3 flex-wrap">
        <LikeButton gameId={game.id} initialCount={game.like_count} />
        <div className="rpg-panel inline-flex px-4 py-2 text-[10px] text-wood-mid/70">
          <span>▶ {game.play_count} plays</span>
        </div>
        <GameOwnerActions slug={game.slug} gameId={game.id} creatorCode={game.creator_code} />
      </div>
    </main>
  );
}
