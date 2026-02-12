import GameCard from "./GameCard";

interface Game {
  id: string;
  slug: string;
  title: string;
  creator_name: string;
  play_count: number;
  like_count: number;
}

export default function GameGrid({ games }: { games: Game[] }) {
  if (games.length === 0) {
    return (
      <div className="rpg-panel flex flex-col items-center justify-center py-16 px-8 text-center mx-auto max-w-md">
        <span className="text-5xl pixel-float">👾</span>
        <h2 className="mt-4 text-xs text-wood-dark">
          No games yet!
        </h2>
        <p className="mt-2 text-[8px] text-wood-mid/60 normal-case">
          Be the first to publish a game and see it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          slug={game.slug}
          title={game.title}
          creatorName={game.creator_name}
          playCount={game.play_count}
          likeCount={game.like_count}
        />
      ))}
    </div>
  );
}
