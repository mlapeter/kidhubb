"use client";

interface GamePlayerProps {
  slug: string;
  title: string;
}

const GAME_RENDER_ORIGIN =
  process.env.NEXT_PUBLIC_GAME_RENDER_ORIGIN || "https://play.kidhubb.com";

export default function GamePlayer({ slug, title }: GamePlayerProps) {
  return (
    <div className="pixel-border bg-black"
      style={{ boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.5), 6px 6px 0 rgba(0,0,0,0.3)" }}
    >
      <iframe
        sandbox="allow-scripts allow-same-origin"
        src={`${GAME_RENDER_ORIGIN}/render/${slug}`}
        style={{ width: "100%", height: "70vh", border: "none" }}
        title={title}
        loading="lazy"
      />
    </div>
  );
}
