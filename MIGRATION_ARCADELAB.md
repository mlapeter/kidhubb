# Migration Plan: KidHubb → ArcadeLab

**kidhubb.com → arcadelab.ai**

---

## Overview

Rename the entire platform from "KidHubb" to "ArcadeLab" and migrate from `kidhubb.com` to `arcadelab.ai`. All existing `kidhubb.com` URLs must continue to work via 301 redirects. The old `<!--KIDHUBB` game header format must remain supported forever. Existing user identities will need a migration path.

---

## 1. What Needs to Change

### 1.1 Critical (breaks functionality if missed)

| File | What | Notes |
|------|------|-------|
| `next.config.ts` | Rewrite rule matches `host: "play.kidhubb.com"` | Game rendering breaks if only new domain is configured |
| `src/components/GamePlayer.tsx` | Fallback defaults to `https://play.kidhubb.com` | Iframes point to wrong origin if env var not set |
| `src/app/api/games/route.ts` | Returns `url: "https://kidhubb.com/play/${slug}"` | Published game URLs point to old domain |
| `src/app/api/games/[id]/route.ts` | Returns `url: "https://kidhubb.com/play/${slug}"` | Same |
| `src/lib/identity.ts` | Cookie + localStorage key `kidhubb_identity` | Users lose identity if key changes without migration |
| `src/app/api/auth/register/route.ts` | Sets cookie `kidhubb_identity` | Server-side cookie writer |
| `src/app/api/auth/verify/route.ts` | Sets cookie `kidhubb_identity` | Server-side cookie writer |
| `src/app/play/[slug]/page.tsx` | Reads `kidhubb_identity` cookie server-side | Owner detection (edit/delete buttons) |

### 1.2 Game Header Format

| File | What |
|------|------|
| `src/lib/parse-game.ts` | `parseKidHubbHeader()` — regex matches `<!--KIDHUBB` |
| `src/components/RemixButton.tsx` | Generates `<!--KIDHUBB\n` header for remix clipboard |
| `src/components/PublishForm.tsx` | Imports and calls `parseKidHubbHeader` |

### 1.3 Branding (user-facing text)

| File | What |
|------|------|
| `src/app/layout.tsx` | `title: "KidHubb — Publish & Play Games"` |
| `src/components/Header.tsx` | `KidHubb` logo text |
| `src/app/page.tsx` | `<h1>KidHubb</h1>` + AI-info sections with `kidhubb.com` URLs |
| `src/app/for-ai/page.tsx` | Dozens of references — the entire page is KidHubb-branded |
| `src/app/publish/page.tsx` | Title, AI-info section |
| `src/app/play/page.tsx` | Title metadata |
| `src/app/play/[slug]/page.tsx` | Title metadata |
| `src/app/play/[slug]/source/page.tsx` | Title metadata, AI-info section |
| `src/app/creators/[name]/page.tsx` | Title metadata |
| `src/components/PublishForm.tsx` | Creator code copy text mentions `kidhubb.com` |

### 1.4 Configuration & Docs

| File | What |
|------|------|
| `package.json` | `"name": "kidhubb"` |
| `supabase/config.toml` | `project_id = "kidhubb"` (cosmetic, local only) |
| `src/lib/safety.ts` | Comment referencing `play.kidhubb.com` |
| `CLAUDE.md` | Multiple domain and brand references |
| `README.md` | Project name, domain |
| `LICENSE` | `Copyright (c) 2026 KidHubb` |
| `DEVLOG.md` | Historical — leave as-is |
| `KIDHUBB_SPEC.md`, `KIDHUBB_PHASE2.md`, etc. | Historical docs — annotate or rename |

### 1.5 New File Needed

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Redirect `kidhubb.com/*` → `arcadelab.ai/*` (301) |

---

## 2. Key Decisions

### 2.1 Game Header: Support Both Formats Forever

Existing games in the database have `<!--KIDHUBB` headers. AI assistants with cached knowledge will keep generating them. Kids may have the old format saved in notes.

**Decision:** Update the parser regex to accept both `<!--KIDHUBB` and `<!--ARCADELAB`. New content (remix button, `/for-ai` docs) uses the new format. The old format works forever. No database migration needed.

```typescript
// parse-game.ts — accept both
const headerMatch = code.match(/<!--(?:KIDHUBB|ARCADELAB)\s*\n([\s\S]*?)-->/);
```

### 2.2 Cookie/localStorage Identity Migration

This is the trickiest part. There are two problems:

**Problem 1: Key name change.** If we just rename `kidhubb_identity` → `arcadelab_identity`, users on the same domain lose their identity.

**Solution:** Read from both keys (new first, then legacy). Write only to new key. Auto-migrate on first read.

```typescript
// identity.ts — migration logic
export function getCreatorIdentity(): CreatorIdentity | null {
  for (const key of ["arcadelab_identity", "kidhubb_identity"]) {
    const saved = localStorage.getItem(key);
    if (saved) {
      const identity = JSON.parse(saved);
      if (key === "kidhubb_identity") {
        saveCreatorIdentity(identity); // writes to new key
        localStorage.removeItem("kidhubb_identity");
      }
      return identity;
    }
  }
  // ...same for cookies
}
```

**Problem 2: Cross-domain cookie loss.** Cookies and localStorage are scoped to the domain. When a user visits `arcadelab.ai` for the first time, their `kidhubb.com` cookies simply don't exist. This is a browser security feature — there's no code-level fix.

**Accepted trade-off:** Users arriving from the old domain will need to re-enter their creator code. This is a one-time friction event. The recovery flow ("Have a creator code?") already exists. Creator codes don't change — only the domain does.

**Optional enhancement:** Add a friendly banner on the publish page for the first month: *"Moved from KidHubb? Enter your creator code to reconnect your games!"*

### 2.3 Redirect Strategy

**Use Next.js middleware** for host-based 301 redirects. This gives us full control and works at the edge (no latency penalty).

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host === "kidhubb.com" || host === "www.kidhubb.com") {
    const url = new URL(request.url);
    url.host = "arcadelab.ai";
    return NextResponse.redirect(url, 301);
  }

  if (host === "play.kidhubb.com") {
    const url = new URL(request.url);
    url.host = "play.arcadelab.ai";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}
```

Keep `kidhubb.com` pointing to the same Vercel project indefinitely. The domain costs ~$12/year and the middleware logic is a string comparison — zero operational burden.

**Iframe edge case:** Games embedded elsewhere with `play.kidhubb.com/render/SLUG` iframe src will follow the 301 redirect to `play.arcadelab.ai/render/SLUG`. This works in all modern browsers. Adds a small latency penalty during transition that disappears as caches expire.

### 2.4 Subdomain Routing — Support Both During Transition

```typescript
// next.config.ts — match both hosts
rewrites() {
  return {
    beforeFiles: [
      {
        source: "/render/:slug",
        has: [{ type: "host", value: "play.arcadelab.ai" }],
        destination: "/api/render/:slug",
      },
      {
        source: "/render/:slug",
        has: [{ type: "host", value: "play.kidhubb.com" }],
        destination: "/api/render/:slug",
      },
    ],
  };
}
```

---

## 3. Execution Order

The guiding principle: **at every intermediate step, the site works for users.** No step creates a broken state.

### Phase 1: Infrastructure (before any code changes)

- [ ] DNS for `arcadelab.ai` pointing to Vercel (already done — purchased on Vercel)
- [ ] Add `play.arcadelab.ai` subdomain to the Vercel project
- [ ] Verify both domains serve the current site: `curl -I https://arcadelab.ai`, `curl -I https://play.arcadelab.ai`
- [ ] Update Vercel env var: `NEXT_PUBLIC_GAME_RENDER_ORIGIN=https://play.arcadelab.ai`
- [ ] **Do NOT remove `kidhubb.com` or `play.kidhubb.com` from Vercel** — keep them forever

### Phase 2: Code Changes (single feature branch)

All changes in one branch, one deploy. Order within the branch doesn't matter since it ships as one unit, but here's a logical grouping:

**Backwards-compat first (safe even if deployed to old domain):**
1. Update `parse-game.ts` — accept both header formats
2. Update `identity.ts` — dual-key read/write with auto-migration
3. Update server-side cookie readers — check both names
4. Update server-side cookie writers — use new name
5. Update `next.config.ts` — add second host match for rewrite

**New functionality:**
6. Create `middleware.ts` — domain redirect logic
7. Update `GamePlayer.tsx` — fallback origin to `play.arcadelab.ai`
8. Update API response URLs — `arcadelab.ai/play/${slug}`

**Branding (all text/string changes):**
9. Update `RemixButton.tsx` — generate `<!--ARCADELAB` headers
10. Update `Header.tsx` — logo text
11. Update `layout.tsx` — site title
12. Update all page metadata — every `— KidHubb` becomes `— ArcadeLab`
13. Update all `.ai-info` hidden sections
14. Update entire `/for-ai` page
15. Update `PublishForm.tsx` — creator code copy text

**Config & docs:**
16. Update `package.json` name
17. Update `supabase/config.toml` project_id
18. Update `CLAUDE.md`, `README.md`, `LICENSE`
19. Annotate historical docs

### Phase 3: Deploy & Verify

- [ ] Merge to main → Vercel auto-deploys
- [ ] Run through testing checklist (see Section 5)

### Phase 4: Post-Deploy

- [ ] Rename GitHub repo (`kidhubb` → `arcadelab`) — GitHub creates automatic redirect
- [ ] Optionally rename local directory
- [ ] Update Google Search Console if applicable
- [ ] Update any external links (social profiles, etc.)

---

## 4. What Could Go Wrong

### DNS not propagated when code deploys
**Symptom:** `arcadelab.ai` returns DNS error; `kidhubb.com` redirects to broken URL.
**Prevention:** Verify DNS before merging. Already purchased on Vercel so this should be fine.
**Rollback:** Revert middleware.ts (remove redirect). Old domain works with all other changes.

### Game iframes break
**Symptom:** Games show blank or "not found."
**Cause:** `NEXT_PUBLIC_GAME_RENDER_ORIGIN` points to new domain but rewrite rule doesn't match, or Vercel hasn't assigned `play.arcadelab.ai`.
**Rollback:** Revert `NEXT_PUBLIC_GAME_RENDER_ORIGIN` env var in Vercel to `https://play.kidhubb.com`. Old rewrite rule is still in the code.

### Middleware redirect loop
**Symptom:** "Too many redirects" error.
**Cause:** Middleware incorrectly redirecting `arcadelab.ai` → `arcadelab.ai`.
**Prevention:** Middleware only fires when host includes "kidhubb".
**Rollback:** Delete `middleware.ts`.

### Users lose identity
**Symptom:** Returning users see no identity, no edit/delete buttons.
**Cause:** Cross-domain cookie loss (expected) or migration logic bug (unexpected).
**Mitigation:** "Have a creator code?" recovery works. Creator codes are unchanged.
**Rollback:** Revert `identity.ts` to use old key names.

### General Rollback
The safety net: all code changes support BOTH old and new domain/format/keys simultaneously. You can:
1. Revert the Vercel env var to old domain
2. Remove middleware redirect
3. Site works exactly as before on `kidhubb.com`

---

## 5. Testing Checklist

### After Phase 1 (infrastructure):
- [ ] `curl -I https://arcadelab.ai` → 200
- [ ] `curl -I https://play.arcadelab.ai` → 200
- [ ] `kidhubb.com` still works normally (no changes yet)

### After Phase 3 (code deployed):

**Core functionality:**
- [ ] `https://arcadelab.ai` loads with "ArcadeLab" branding
- [ ] `https://arcadelab.ai/play` shows game browser
- [ ] Click a game — loads in iframe (check Network tab: `play.arcadelab.ai/render/SLUG`)
- [ ] `https://arcadelab.ai/publish` shows updated publish form
- [ ] `https://arcadelab.ai/for-ai` shows updated AI briefing

**Redirects:**
- [ ] `https://kidhubb.com` → 301 → `https://arcadelab.ai`
- [ ] `https://kidhubb.com/play/some-game` → 301 → `https://arcadelab.ai/play/some-game`
- [ ] `https://play.kidhubb.com/render/some-game` → 301 → `https://play.arcadelab.ai/render/some-game`

**Game headers:**
- [ ] Paste game with `<!--KIDHUBB` header → publishes successfully
- [ ] Paste game with `<!--ARCADELAB` header → publishes successfully
- [ ] Paste game with no header → publishes successfully

**Identity:**
- [ ] New user: paste code → auto-account created → cookie set as `arcadelab_identity`
- [ ] Creator code copy button text mentions `arcadelab.ai`
- [ ] "Have a creator code?" recovery flow works
- [ ] Game owner sees edit/delete buttons on their games

**Metadata:**
- [ ] All page `<title>` tags say "ArcadeLab" not "KidHubb"
- [ ] View page source → `.ai-info` sections reference `arcadelab.ai`
- [ ] Remix button clipboard text uses `<!--ARCADELAB` header
- [ ] Creator pages load correctly with updated metadata

---

## 6. What We're NOT Doing

- **No database migration.** Game HTML in `game_content` table stays as-is. The parser handles both header formats.
- **No Supabase project rename.** The Supabase project URL and credentials are unchanged. The `config.toml` project_id is local-only.
- **No cross-domain identity bridge.** Users on the new domain re-enter their creator code once. The recovery flow handles it. Building a redirect-chain identity transfer is overengineered for this use case.
- **No email/notification.** There's no email system. Kids will discover the new name when they visit.
- **No rush to remove old domain.** Keep `kidhubb.com` on Vercel indefinitely. It costs nothing.
