import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-wood-dark"
      style={{
        background: "linear-gradient(180deg, #5c3a1e 0%, #4a2e18 60%, #3d2b1f 100%)",
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.08), 0 4px 0 rgba(0,0,0,0.3)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 relative z-[1]">
        <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-xl">🎮</span>
          <span className="text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
            KidHubb
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/for-ai"
            className="hidden sm:block px-3 py-2 text-[10px] text-parchment/70 hover:text-accent-gold transition-colors"
          >
            For AI
          </Link>
          <Link
            href="/play"
            className="rpg-btn rpg-btn-purple px-3 sm:px-4 py-2 text-[10px]"
          >
            Play Games
          </Link>
          <Link
            href="/publish"
            className="rpg-btn rpg-btn-green px-3 sm:px-4 py-2 text-[10px]"
          >
            Create Game
          </Link>
        </nav>
      </div>
    </header>
  );
}
