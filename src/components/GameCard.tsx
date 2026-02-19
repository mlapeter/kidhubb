import Link from "next/link";

interface GameCardProps {
  slug: string;
  title: string;
  creatorName: string;
  playCount: number;
  likeCount: number;
  emoji?: string | null;
  color?: string | null;
}

const THUMB_STYLES = [
  { bg: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", emoji: "🎮" },
  { bg: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)", emoji: "🌊" },
  { bg: "linear-gradient(135deg, #16a34a 0%, #84cc16 100%)", emoji: "🌲" },
  { bg: "linear-gradient(135deg, #ea580c 0%, #facc15 100%)", emoji: "🔥" },
  { bg: "linear-gradient(135deg, #db2777 0%, #f97316 100%)", emoji: "🚀" },
  { bg: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", emoji: "⚡" },
  { bg: "linear-gradient(135deg, #0d9488 0%, #22d3ee 100%)", emoji: "💎" },
  { bg: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)", emoji: "🐉" },
  { bg: "linear-gradient(135deg, #9333ea 0%, #6366f1 100%)", emoji: "🌙" },
  { bg: "linear-gradient(135deg, #ca8a04 0%, #f59e0b 100%)", emoji: "⭐" },
];

function pickStyle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return THUMB_STYLES[Math.abs(hash) % THUMB_STYLES.length];
}

const COLOR_GRADIENTS: Record<string, string> = {
  red: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
  orange: "linear-gradient(135deg, #ea580c 0%, #facc15 100%)",
  green: "linear-gradient(135deg, #16a34a 0%, #84cc16 100%)",
  blue: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
  purple: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
  pink: "linear-gradient(135deg, #db2777 0%, #f97316 100%)",
  teal: "linear-gradient(135deg, #0d9488 0%, #22d3ee 100%)",
  gold: "linear-gradient(135deg, #ca8a04 0%, #f59e0b 100%)",
};

export default function GameCard({
  slug,
  title,
  creatorName,
  playCount,
  likeCount,
  emoji,
  color,
}: GameCardProps) {
  const fallback = pickStyle(title);
  const displayEmoji = emoji || fallback.emoji;
  const displayBg = (color && COLOR_GRADIENTS[color]) || fallback.bg;

  return (
    <Link href={`/play/${slug}`} className="group">
      <div className="rpg-panel transition-transform hover:-translate-y-1 hover:shadow-[inset_0_0_0_2px_var(--parchment-dark),inset_0_0_0_4px_var(--wood-mid),8px_8px_0_rgba(0,0,0,0.3)]">
        {/* Thumbnail with gradient + pattern overlay */}
        <div
          className="aspect-video flex items-center justify-center relative overflow-hidden"
          style={{ background: displayBg }}
        >
          {/* Subtle pixel grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px), repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
            }}
          />
          <span className="text-4xl relative z-[1] transition-transform group-hover:scale-125 drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
            {displayEmoji}
          </span>
        </div>

        {/* Info area on parchment */}
        <div className="p-3">
          <h3 className="truncate text-[10px] text-wood-dark leading-relaxed">{title}</h3>
          <p className="mt-1 text-[10px] text-wood-mid/70 normal-case">
            by {creatorName}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-wood-mid/50">
            <span>⭐ {likeCount}</span>
            <span>▶ {playCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
