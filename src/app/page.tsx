import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-center">
      {/* Title */}
      <div className="mb-4">
        <span className="text-5xl pixel-float inline-block">🎮</span>
      </div>
      <h1 className="text-xl sm:text-2xl text-accent-yellow mb-2">
        KidHubb
      </h1>
      <p className="text-[10px] sm:text-xs text-foreground/60 mb-12">
        Make games. Share games. Play games.
      </p>

      {/* Two big buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link
          href="/publish"
          className="pixel-btn bg-accent-purple px-8 py-6 text-sm sm:text-base text-white w-full sm:w-auto text-center"
        >
          <span className="block text-2xl mb-2">🚀</span>
          Create Game
        </Link>

        <Link
          href="/play"
          className="pixel-btn bg-accent-green px-8 py-6 text-sm sm:text-base text-background w-full sm:w-auto text-center"
        >
          <span className="block text-2xl mb-2">👾</span>
          Play Games
        </Link>
      </div>

      {/* Decorations */}
      <div className="mt-16 flex justify-center gap-8 text-3xl">
        <span className="pixel-float" style={{ animationDelay: "0s" }}>⭐</span>
        <span className="pixel-float" style={{ animationDelay: "0.3s" }}>🏆</span>
        <span className="pixel-float" style={{ animationDelay: "0.6s" }}>💎</span>
        <span className="pixel-float" style={{ animationDelay: "0.9s" }}>🔥</span>
      </div>
    </main>
  );
}
