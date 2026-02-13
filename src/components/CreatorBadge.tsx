export default function CreatorBadge({ name }: { name: string }) {
  return (
    <span
      className="text-[10px] text-parchment/70 drop-shadow-[1px_1px_0_rgba(0,0,0,0.3)]"
    >
      by {name}
    </span>
  );
}
