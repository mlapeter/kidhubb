import GameBrowser from "@/components/GameBrowser";

async function getGames() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/games?limit=40&sort=newest`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.games || [];
}

export const metadata = {
  title: "Play Games — KidHubb",
  description: "Browse and play games made by kids on KidHubb!",
};

export default async function PlayPage() {
  const initialGames = await getGames();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-base sm:text-lg text-accent-yellow mb-6 text-center">
        👾 All Games
      </h1>
      <GameBrowser initialGames={initialGames} />
    </main>
  );
}
