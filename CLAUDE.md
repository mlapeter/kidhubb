# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KidHubb (kidhubb.com) is a platform where kids publish and play browser-based HTML/JS/CSS games. Think "GitHub Pages meets itch.io" for kids.

## The Soul of KidHubb

KidHubb exists to give kids the shortest possible path from "I made something" to "other people can play it." A 7-year-old who can barely read is using AI to create real, playable browser games — and this site lets him share them with the world by copying code and pasting it into a big text box. That's the entire product. If a feature makes that path longer, more confusing, or more intimidating, it doesn't belong here.

## Security vs. Simplicity

This is not a banking app. No money changes hands, no personal data is collected, no emails are stored. The worst-case scenario for a security breach is that someone publishes a game under another kid's name — that's it. Games run in sandboxed iframes with no network access, which handles the real security concern (malicious code). Everything else should lean toward simplicity. Do not add email verification, OAuth, password requirements, CAPTCHA, or any other friction to the identity system. Creator codes are casual identifiers, not credentials — treat them like nicknames, not passwords. When you feel the urge to add a security measure, ask: "Would a 7-year-old on an iPad be able to get through this without help?" If the answer is no, don't add it.

## What This Project Is Really About

KidHubb is an experiment in how humans, AI, and websites interact. It's one of the first sites designed with AI assistants as a first-class audience — the /for-ai page, the hidden AI-context blocks, the KidHubb header format, the source code pages. We're inventing how AI agents discover, understand, and help users interact with a publishing platform. The codebase should reflect this: clean, simple, readable, and open-source friendly. No unnecessary abstractions, no over-engineered patterns. If you can do something in 20 lines, don't do it in 100. The goal is a codebase that a curious developer (or a curious kid, someday) can read and understand.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Database / Supabase

There is no local Supabase instance. The `.env.local` points directly at the production Supabase project. Migration SQL files live in `supabase/migrations/` for version control, but the owner applies them manually to production — never run `supabase db push`, `supabase db reset`, or `supabase migration up` yourself.

**Supabase may also be used by the user in other important projects.** Never run any destructive Supabase commands (DROP TABLE, DELETE FROM without WHERE, TRUNCATE, db reset, etc.). There should be no reason to do so for KidHubb work. If a migration needs to be written, create the SQL file and stop — the owner will review and apply it.

## Architecture

- **Framework:** Next.js 16 with App Router, TypeScript, Tailwind CSS v4
- **Database:** Supabase (Postgres) — migrations in `supabase/migrations/`
- **Hosting:** Vercel (auto-deploys from main)
- **Path aliases:** `@/*` maps to `./src/*`

### Key Architecture Decisions

- **Game serving:** Games render in sandboxed iframes via `play.kidhubb.com` subdomain (separate origin for security). Main site at `kidhubb.com` embeds `<iframe src="https://play.kidhubb.com/render/{slug}">` with `sandbox="allow-scripts"` only.
- **Identity:** No email/password/OAuth. Kids get a Creator Code (`WORD-WORD-WORD-NUMBER` format, e.g. `ROCKET-WOLF-COMET-73`) and an API token. Low friction, low stakes.
- **Content safety:** Iframe sandbox + CSP headers (`connect-src 'none'`) are the real security. Regex-based content scanning is a first-line heuristic only.
- **Library injection:** Games can declare library dependencies (Three.js, Phaser, p5.js, etc.) which get injected as CDN script tags in `<head>` at render time.
- **Game content** is stored as raw HTML in a separate `game_content` table to keep metadata queries fast.

### Design Guidelines

- Kid-friendly: rounded corners (12-16px), playful colors, big readable fonts (16px+), dark mode default
- Casual encouraging tone: "Nice! Your game is live!" not "Game published successfully."
- Agent-friendly forms: standard HTML inputs with proper labels, linear flow, no modals/tabs
- Mobile-responsive (many kids use tablets)
