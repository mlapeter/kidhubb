import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Clouds */}
      <div className="absolute top-8 left-[8%] text-4xl opacity-60 cloud-drift" style={{ animationDelay: "0s" }}>☁️</div>
      <div className="absolute top-16 right-[12%] text-3xl opacity-40 cloud-drift" style={{ animationDelay: "2s" }}>☁️</div>
      <div className="absolute top-24 left-[35%] text-2xl opacity-30 cloud-drift" style={{ animationDelay: "4s" }}>☁️</div>

      {/* Main content */}
      <div className="text-center mb-8 relative z-[1]">
        {/* Logo / Title area */}
        <div className="mb-3">
          <span className="text-6xl sm:text-7xl inline-block pixel-float">🎮</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-accent-gold mb-3 drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
          KidHubb
        </h1>
        <p className="text-[10px] sm:text-xs text-parchment/70 drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
          Make games. Share games. Play games.
        </p>
      </div>

      {/* RPG menu panel */}
      <div className="rpg-panel px-6 sm:px-10 py-8 sm:py-10 text-center max-w-md w-full">
        <div className="flex flex-col gap-4">
          <Link
            href="/publish"
            className="rpg-btn rpg-btn-purple px-6 py-5 text-xs sm:text-sm flex items-center justify-center gap-3"
          >
            <span className="text-xl">🚀</span>
            <span>Create Game</span>
          </Link>

          <Link
            href="/play"
            className="rpg-btn rpg-btn-green px-6 py-5 text-xs sm:text-sm flex items-center justify-center gap-3"
          >
            <span className="text-xl">👾</span>
            <span>Play Games</span>
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="mt-6 flex items-center gap-2 justify-center text-parchment-border">
          <span className="block w-8 h-[2px] bg-parchment-border" />
          <span className="text-base">⭐</span>
          <span className="block w-8 h-[2px] bg-parchment-border" />
        </div>

        <p className="mt-3 text-[8px] text-wood-mid/60 normal-case">
          A place where kids publish &amp; play browser games
        </p>
      </div>

      {/* Floating decorative elements */}
      <div className="mt-10 flex justify-center gap-6 sm:gap-10 text-2xl sm:text-3xl relative z-[1]">
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "0s" }}>🌟</span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "0.5s" }}>🏆</span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "1s" }}>💎</span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "1.5s" }}>🔥</span>
        <span className="pixel-float drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{ animationDelay: "2s" }}>🌈</span>
      </div>

      {/* Ground scene elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(93,173,70,0.3) 40%, rgba(61,138,46,0.6) 100%)",
        }}
      />
      {/* Pixel grass tufts */}
      <div className="absolute bottom-2 left-[10%] text-2xl opacity-70">🌿</div>
      <div className="absolute bottom-1 left-[30%] text-xl opacity-50">🌱</div>
      <div className="absolute bottom-3 right-[20%] text-2xl opacity-60">🌿</div>
      <div className="absolute bottom-1 right-[40%] text-lg opacity-40">🌱</div>
      <div className="absolute bottom-2 left-[55%] text-xl opacity-50">🌾</div>
    </main>
  );
}
