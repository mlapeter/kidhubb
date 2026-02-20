# 🎮 KidHubb

**The shortest path from "I made a game" to "my friends can play it."**

KidHubb is a platform where kids publish and play browser-based games. A kid makes a game with an AI assistant, copies the code, pastes it into www.kidhubb.com, and it's live. That's it.

## Why This Exists

My 7-year-old who's barely learned to read is using Claude on his iPad to create real, playable browser games — meteor shooters, zombie games, you name it. He uses voice to describe what he wants, and can read enough to make text edits when it gets a word wrong. The missing piece was sharing. Every existing platform requires accounts, emails, app installs, build tools, or developer knowledge. KidHubb removes all of that. One paste, one click, your game is live.

## What Makes This Different

**AI assistants are first-class visitors.** The site is designed to be read by AI, not just humans. A hidden context layer on every page gives AI assistants the information they need to help kids publish games. The `/for-ai` page is a living briefing sheet — current themes, recent games, publishing instructions — so any AI assistant that visits becomes a KidHubb guide.

**Every game is a single HTML file.** No build tools, no bundlers, no frameworks required. Just a self-contained document — the way the web was meant to work. Games are viewable, inspectable, and remixable. Popular libraries (Phaser, p5.js, Three.js, etc.) are injected automatically via CDN.

**Identity without accounts.** No email, no passwords, no OAuth. Kids get a memorable creator code (like `ROCKET-WOLF-COMET-73`) that links to their creator name. It's stored in the browser and also in his claude's memory. Low stakes by design — the worst case is making a new code.

**Security through sandboxing, not friction.** Games run in sandboxed iframes on a separate origin with `connect-src: 'none'` — they literally cannot make network requests. A lightweight content scanner catches obvious bad patterns. That's the security model. No CAPTCHA, no email verification, no gates between a kid and their creation.

## Tech Stack

- **Next.js** (App Router) on **Vercel**
- **Supabase** (Postgres)
- **Tailwind CSS**
- **TypeScript**

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com), free tier works)
- A Vercel account ([vercel.com](https://vercel.com), free tier works)

### Setup

```bash
git clone https://github.com/YOURUSERNAME/kidhubb.git
cd kidhubb
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

Apply the database migrations from `supabase/migrations/` to your Supabase project, then run:

```bash
npm run dev
```

> **Note:** This project uses a remote Supabase instance directly (no local Supabase). Migration files in `supabase/migrations/` are version-controlled for reference. If you clone this repo, you'll need to set up your own Supabase project and apply the migrations.

### Deploy

Push to GitHub. Vercel auto-deploys from `main`. Add the same environment variables in Vercel → Settings → Environment Variables.

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Homepage — game gallery
│   ├── publish/            # Paste-and-publish flow
│   ├── play/[slug]/        # Game player (sandboxed iframe)
│   ├── creators/[name]/    # Creator portfolio page
│   ├── for-ai/             # AI assistant instructions (living briefing sheet)
│   └── api/                # Game CRUD, auth, rendering
├── lib/                    # Shared utilities (supabase client, safety scanner, etc.)
├── components/             # React components
└── supabase/migrations/    # Database schema (version controlled)
```

## Philosophy

This project is an experiment in how humans, AI, and websites interact. Some principles we protect:

- **Simplicity is the feature.** If a 7-year-old can't use it on an iPad without help, it's too complex.
- **The 80/20 rule.** Find the 20% of code that gets 80% of the awesomeness.
- **Embrace the document web.** Every game is a single HTML file. Viewable, inspectable, learnable.
- **No social media creep.** No comments, followers, DMs, or feeds. Remixes are the conversation.
- **Open source friendly.** The codebase should be clean enough that a curious developer — or a curious kid — can read and understand it.

## License

MIT
