import Link from "next/link";

export default function CreatorBadge({ name }: { name: string }) {
  return (
    <Link
      href={`/creators/${encodeURIComponent(name)}`}
      className="text-[10px] text-accent-purple hover:text-accent-pink transition-colors"
    >
      by {name}
    </Link>
  );
}
