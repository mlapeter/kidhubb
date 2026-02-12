import Link from "next/link";

interface GameCardProps {
  slug: string;
  title: string;
  creatorName: string;
  playCount: number;
  likeCount: number;
}

const BG_COLORS = [
  "bg-purple-700",
  "bg-blue-700",
  "bg-green-700",
  "bg-orange-700",
  "bg-pink-700",
  "bg-indigo-700",
  "bg-teal-700",
  "bg-red-700",
  "bg-yellow-700",
  "bg-cyan-700",
];

function pickColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

export default function GameCard({
  slug,
  title,
  creatorName,
  playCount,
  likeCount,
}: GameCardProps) {
  const bgColor = pickColor(title);

  return (
    <Link href={`/play/${slug}`} className="group">
      <div className="pixel-border bg-card-bg transition-transform hover:-translate-y-1">
        {/* Thumbnail */}
        <div
          className={`aspect-video ${bgColor} flex items-center justify-center`}
        >
          <span className="text-4xl transition-transform group-hover:scale-110">
            🎮
          </span>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="truncate text-xs text-foreground">{title}</h3>
          <p className="mt-1 text-[10px] text-accent-purple">
            by {creatorName}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-foreground/50">
            <span>♥ {likeCount}</span>
            <span>▶ {playCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
