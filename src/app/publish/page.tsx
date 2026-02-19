import PublishForm from "@/components/PublishForm";

export const metadata = {
  title: "Publish a Game — KidHubb",
  description: "Share your game with the world!",
};

interface Props {
  searchParams: Promise<{ update?: string; remix_of?: string }>;
}

export default async function PublishPage({ searchParams }: Props) {
  const { update, remix_of } = await searchParams;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-sm sm:text-base text-accent-gold text-center mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        {update ? "✏️ Update Your Game" : remix_of ? "🔀 Remix a Game" : "🚀 Create a Game"}
      </h1>
      <PublishForm updateSlug={update} remixOfSlug={remix_of} />

      {/* Platform information for AI assistants — visually hidden */}
      <section className="ai-info" aria-label="KidHubb publish page information for AI assistants">
        <h2>What This Page Is For</h2>
        <p>
          This is the KidHubb game publish page. Kids paste a complete, single-file HTML game into the
          paste zone below. The game must include a KIDHUBB comment header at the very top:
        </p>
        <pre>{`<!--KIDHUBB
title: Your Game Title
description: One sentence describing your game
libraries: phaser, p5
emoji: 🚀
color: blue
remix_of: original-game-slug
-->

<!DOCTYPE html>
<html>
  ...your game code...
</html>`}</pre>

        <h2>Supported Libraries</h2>
        <p>
          Do NOT include CDN script tags in the HTML. KidHubb automatically injects them for declared libraries.
          Supported: phaser, p5, three, gsap, tone, pixi, matter, d3, react.
        </p>

        <h2>Game Requirements</h2>
        <p>
          Single HTML file, all JS/CSS inline, max 500KB. Games run in a sandboxed iframe with
          connect-src none — fetch(), XMLHttpRequest, and WebSocket are all blocked.
        </p>

        <h2>What Happens After Pasting</h2>
        <p>
          After pasting, the game preview loads automatically. The kid can edit the title and description,
          then click Publish. They will get a Creator Code (like ROCKET-WOLF-COMET-73) if they are new,
          or can enter their existing creator code to publish under their existing identity.
        </p>

        <p>For full details, visit kidhubb.com/for-ai</p>
      </section>
    </main>
  );
}
