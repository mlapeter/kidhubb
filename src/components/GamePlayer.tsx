"use client";

interface GamePlayerProps {
  slug: string;
  title: string;
}

const GAME_RENDER_ORIGIN =
  process.env.NEXT_PUBLIC_GAME_RENDER_ORIGIN || "https://play.kidhubb.com";

export default function GamePlayer({ slug, title }: GamePlayerProps) {
  return (
    <div className="pixel-border bg-black">
      <iframe
        sandbox="allow-scripts"
        src={`${GAME_RENDER_ORIGIN}/render/${slug}`}
        style={{ width: "100%", height: "70vh", border: "none" }}
        title={title}
        loading="lazy"
      />
    </div>
  );
}
