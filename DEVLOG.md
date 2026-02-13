# Developer Log

## 2026-02-12

- **Pixel art redesign shipped** — Swapped Geist → Press Start 2P, sharp borders, hard shadows, Stardew Valley aesthetic. PR #1.
- **srcDoc vs src iframe security** — `srcDoc` iframes inherit parent origin, so `allow-same-origin` on the preview iframe gave game code access to kidhubb.com cookies/localStorage. Removed it. Production iframes use `src` pointing to `play.kidhubb.com` (separate origin) so `allow-same-origin` is safe there.
- **Preview still works without allow-same-origin** — Only blocks storage, cookies, and same-origin fetch. HTML/CSS/JS/Canvas all render fine.
- **Reverted atomic RPC increments** — Postgres `increment_play_count`/`increment_like_count` functions were overkill. Simple read-modify-write is fine at current scale.
- **CSP updated** — Added `form-action 'none'` (blocks form-based exfiltration) and `frame-ancestors *` (replaces non-standard `X-Frame-Options: ALLOWALL`).
- **play.kidhubb.com is live** — Subdomain is configured in Vercel, game rendering via iframe works in production. Confirmed with Meteor Dodge game.
- **Play page queries Supabase directly** — Removed self-fetch pattern (`fetch(baseUrl/api/games)`) that required constructing `VERCEL_URL`. Direct DB query is simpler and faster.
- **Safety scanner is heuristic only** — Regex patterns catch obvious bad intent but aren't a security boundary. Real security = iframe sandbox + CSP + subdomain isolation.
- **Removed localStorage/sessionStorage from blocked patterns** — AI-generated games commonly use these for scores/state. Sandbox already prevents cross-origin abuse. Was silently blocking publishes (error hidden below fold on iPad).
