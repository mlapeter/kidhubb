import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm sm:text-base">
          <span className="text-2xl">🎮</span>
          <span className="text-accent-yellow">
            KidHubb
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/publish"
            className="pixel-btn bg-accent-purple px-4 py-2 text-[10px] sm:text-xs text-white"
          >
            Create Game
          </Link>
        </nav>
      </div>
    </header>
  );
}
