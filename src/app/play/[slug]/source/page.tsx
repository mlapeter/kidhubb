import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LIBRARY_MAP } from "@/lib/libraries";
import CopyCodeButton from "@/components/CopyCodeButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getGameWithSource(slug: string) {
  const { data: game } = await supabase
    .from("games")
    .select("id, slug, title, creator_id, libraries, status")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!game) return null;

  const { data: content } = await supabase
    .from("game_content")
    .select("html")
    .eq("game_id", game.id)
    .single();

  const { data: creator } = await supabase
    .from("creators")
    .select("display_name")
    .eq("id", game.creator_id)
    .single();

  return {
    ...game,
    html: content?.html || "",
    creator_name: creator?.display_name || "Unknown",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameWithSource(slug);

  if (!game) return { title: "Source Not Found — KidHubb" };

  return {
    title: `Source: ${game.title} — KidHubb`,
    description: `View the source code of ${game.title} by ${game.creator_name}`,
  };
}

export default async function SourcePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGameWithSource(slug);

  if (!game) notFound();

  const lineCount = game.html.split("\n").length;
  const fileSize = new TextEncoder().encode(game.html).length;
  const fileSizeLabel = fileSize > 1024
    ? `${(fileSize / 1024).toFixed(1)} KB`
    : `${fileSize} bytes`;

  const complexityEstimate = lineCount < 50 ? "simple" : lineCount < 200 ? "moderate" : "complex";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex items-baseline gap-3 flex-wrap">
        <h1 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          {game.title}
        </h1>
        <span className="text-[10px] text-parchment/70">by {game.creator_name}</span>
      </div>

      <div className="mb-4 flex items-center gap-4 flex-wrap text-[10px] text-parchment/50">
        <span>{lineCount} lines</span>
        <span>{fileSizeLabel}</span>
        {game.libraries?.length > 0 && game.libraries.map((lib: string) => (
          <span key={lib} className="rpg-panel inline-flex px-2 py-1 text-wood-mid/70">
            🛠️ {LIBRARY_MAP[lib]?.label || lib}
          </span>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        <CopyCodeButton code={game.html} />
        <Link
          href={`/play/${game.slug}`}
          className="rpg-btn px-4 py-2 text-[10px]"
        >
          ▶ Play
        </Link>
      </div>

      <div className="rpg-panel-dark p-4 overflow-x-auto">
        <pre className="text-[10px] leading-relaxed text-parchment/80 normal-case whitespace-pre-wrap break-words">
          {game.html}
        </pre>
      </div>

      {/* AI-readable context */}
      <section className="ai-info" aria-label="Source code information for AI assistants">
        <h2>Game Source: {game.title}</h2>
        <p>Creator: {game.creator_name}</p>
        <p>Libraries: {game.libraries?.length ? game.libraries.join(", ") : "none"}</p>
        <p>Complexity: {complexityEstimate} ({lineCount} lines, {fileSizeLabel})</p>
        <h3>Full Source Code</h3>
        <pre>{game.html}</pre>
        <h3>Remix Instructions</h3>
        <p>
          To remix this game, copy the source code above and modify it. Add a KIDHUBB header at the top
          with &quot;remix_of: {game.slug}&quot; to link back to the original. Then publish at kidhubb.com/publish.
        </p>
      </section>
    </main>
  );
}
