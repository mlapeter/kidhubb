# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KidHubb (kidhubb.com) is a platform where kids publish and play browser-based HTML/JS/CSS games. Think "GitHub Pages meets itch.io" for kids. The full spec is in KIDHUBB_SPEC.md.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `supabase db diff --local -f <migration_name>` — create a new migration after schema changes
- `supabase migration up --local` — apply pending migrations locally
- `supabase db reset` — reset local database and replay all migrations

## Architecture

- **Framework:** Next.js 16 with App Router, TypeScript, Tailwind CSS v4
- **Database:** Supabase (Postgres) — migrations in `supabase/migrations/`
- **Hosting:** Vercel (auto-deploys from main)
- **Path aliases:** `@/*` maps to `./src/*`

### Key Architecture Decisions

- **Game serving:** Games render in sandboxed iframes via `play.kidhubb.com` subdomain (separate origin for security). Main site at `kidhubb.com` embeds `<iframe src="https://play.kidhubb.com/render/{slug}">` with `sandbox="allow-scripts"` only.
- **Identity:** No email/password/OAuth. Kids get a Creator Code (`WORD-WORD-NUMBER` format) and an API token. Low friction, low stakes.
- **Content safety:** Iframe sandbox + CSP headers (`connect-src 'none'`) are the real security. Regex-based content scanning is a first-line heuristic only.
- **Library injection:** Games can declare library dependencies (Three.js, Phaser, p5.js, etc.) which get injected as CDN script tags in `<head>` at render time.
- **Game content** is stored as raw HTML in a separate `game_content` table to keep metadata queries fast.

### Design Guidelines

- Kid-friendly: rounded corners (12-16px), playful colors, big readable fonts (16px+), dark mode default
- Casual encouraging tone: "Nice! Your game is live!" not "Game published successfully."
- Agent-friendly forms: standard HTML inputs with proper labels, linear flow, no modals/tabs
- Mobile-responsive (many kids use tablets)
