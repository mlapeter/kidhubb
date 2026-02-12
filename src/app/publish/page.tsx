import { Suspense } from "react";
import PublishForm from "@/components/PublishForm";

export const metadata = {
  title: "Publish a Game — KidHubb",
  description: "Share your game with the world!",
};

export default function PublishPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-sm sm:text-base text-accent-yellow text-center mb-6">
        🚀 Create a Game
      </h1>
      <Suspense fallback={null}>
        <PublishForm />
      </Suspense>
    </main>
  );
}
