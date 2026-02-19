import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LIBRARY_MAP } from "@/lib/libraries";
import GamePlayer from "@/components/GamePlayer";
import CreatorBadge from "@/components/CreatorBadge";
import StarButton from "@/components/StarButton";
import RemixButton from "@/components/RemixButton";
import GameOwnerActions from "@/components/GameOwnerActions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getGame(slug: string) {
  const { data: game } = await supabase
    .from("games")
    .select("id, slug, title, description, creator_id, play_count, like_count, forked_from, libraries, status, created_at")
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

  // Check ownership
  let serverIsOwner = false;
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("kidhubb_identity")?.value;
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      serverIsOwner = parsed.creator_id === game.creator_id;
    }
  } catch {
    // cookie missing or malformed
  }

  // Fetch remix provenance if forked_from is set
  let remixSource: { slug: string; title: string; creator_name: string } | null = null;
  if (game.forked_from) {
    const { data: original } = await supabase
      .from("games")
      .select("slug, title, creator_id")
      .eq("id", game.forked_from)
      .single();

    if (original) {
      const { data: origCreator } = await supabase
        .from("creators")
        .select("display_name")
        .eq("id", original.creator_id)
        .single();

      remixSource = {
        slug: original.slug,
        title: original.title,
        creator_name: origCreator?.display_name || "Unknown",
      };
    }
  }

  // Count remixes of this game
  const { count: remixCount } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("forked_from", game.id)
    .eq("status", "active");

  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      {/* Remix provenance */}
      {game.forked_from && (
        <div className="mb-2 text-[10px] text-parchment/50">
          {remixSource ? (
            <span>
              🔀 Remixed from{" "}
              <Link href={`/play/${remixSource.slug}`} className="text-accent-purple hover:text-accent-gold transition-colors">
                {remixSource.title}
              </Link>{" "}
              by {remixSource.creator_name}
            </span>
          ) : (
            <span>🔀 Remixed from a game that&apos;s no longer available</span>
          )}
        </div>
      )}

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
        <StarButton gameId={game.id} initialCount={game.like_count} />
        <div className="rpg-panel inline-flex items-center gap-2 px-4 py-2 text-[10px] text-accent-green">
          <span>▶ {game.play_count} {game.play_count === 1 ? "play" : "plays"}</span>
        </div>
        <Link
          href={`/play/${game.slug}/source`}
          className="rpg-panel inline-flex px-4 py-2 text-[10px] text-wood-mid/70 hover:text-accent-purple transition-colors"
        >
          &lt;/&gt; Source
        </Link>
        <RemixButton gameId={game.id} gameTitle={game.title} gameSlug={game.slug} />
        <GameOwnerActions slug={game.slug} gameId={game.id} creatorId={game.creator_id} serverIsOwner={serverIsOwner} />
      </div>

      {/* Library badges */}
      {game.libraries?.length > 0 && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {game.libraries.map((lib: string) => (
            <span key={lib} className="rpg-panel inline-flex px-3 py-1 text-[10px] text-wood-mid/70">
              🛠️ {LIBRARY_MAP[lib]?.label || lib}
            </span>
          ))}
        </div>
      )}

      {/* Remix count */}
      {(remixCount ?? 0) > 0 && (
        <div className="mt-2 text-[10px] text-parchment/50">
          🔀 {remixCount} {remixCount === 1 ? "remix" : "remixes"}
        </div>
      )}
    </main>
  );
}
