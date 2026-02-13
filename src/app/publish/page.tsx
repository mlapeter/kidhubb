import PublishForm from "@/components/PublishForm";

export const metadata = {
  title: "Publish a Game — KidHubb",
  description: "Share your game with the world!",
};

interface Props {
  searchParams: Promise<{ update?: string }>;
}

export default async function PublishPage({ searchParams }: Props) {
  const { update } = await searchParams;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-sm sm:text-base text-accent-gold text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        {update ? "✏️ Update Your Game" : "🚀 Create a Game"}
      </h1>
      <PublishForm updateSlug={update} />
    </main>
  );
}
