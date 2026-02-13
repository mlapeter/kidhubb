# KidHubb.com — Project Specification

## Vision

A frictionless platform where kids can publish and play browser-based HTML/JS/CSS games. Think "GitHub Pages meets itch.io" but dead simple — designed so a kid working with Claude on an iPad can go from "I made a game" to "my friends can play it" in under a minute.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 14+ (App Router)** | Full-stack in one project; API routes, SSR, static pages |
| Hosting | **Vercel** | Free tier is generous; instant deploys from GitHub |
| Database | **Supabase (Postgres)** | Free tier; real-time optional later; good SDK |
| Game Storage | **Supabase Storage** (or Vercel Blob) | Store game HTML files as blobs |
| Game Serving | **Sandboxed iframes** | Origin-isolated for security |
| Styling | **Tailwind CSS** | Fast to build, kid-friendly aesthetic easy to achieve |
| Domain | **kidhubb.com** (already purchased) | Point to Vercel |

---

## Architecture Overview

```
kidhubb.com (Next.js on Vercel)
├── / .......................... Homepage — game gallery grid
├── /play/[slug] .............. Game player page (sandboxed iframe)
├── /publish .................. Web form to paste & publish a game
├── /creators/[name] .......... Creator profile — list of their games
├── /api-docs ................. Instructions page for Claude agents
├── /api/games (POST) ......... Publish a game via API
├── /api/games (GET) .......... List games (paginated)
├── /api/games/[id] (GET) ..... Get single game metadata
├── /api/games/[id] (DELETE) .. Delete game (creator auth required)
└── /api/auth/register (POST) . Create creator account, returns token
```

### Game Serving Architecture

Games are served in a sandboxed iframe. For maximum security, serve game content from a **separate origin**:

- Main site: `kidhubb.com`
- Game content: `play.kidhubb.com` (subdomain pointed to the same Vercel project but treated as a separate origin by browsers)

The game player page on `kidhubb.com/play/[slug]` renders an iframe pointing to `play.kidhubb.com/render/[slug]`, which returns the raw game HTML with strict headers.

If the subdomain approach adds too much initial complexity, start with `srcdoc` iframes and migrate later. Both approaches use the same sandbox attributes.

---

## Data Model

### Supabase Tables

```sql
-- Creators
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL UNIQUE,
  creator_code TEXT NOT NULL UNIQUE, -- e.g. "METEOR-FOX-BLAZE-42"
  api_token TEXT NOT NULL UNIQUE,    -- hashed, for API auth
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,          -- URL-friendly, auto-generated
  title TEXT NOT NULL,
  description TEXT,                    -- optional short description
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  libraries TEXT[] DEFAULT '{}',      -- e.g. ['three', 'gsap']
  thumbnail_url TEXT,                 -- auto-generated screenshot (v2)
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',       -- 'active', 'flagged', 'removed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game content stored separately to keep metadata queries fast
CREATE TABLE game_content (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  html TEXT NOT NULL,                 -- the raw HTML/JS/CSS
  content_hash TEXT NOT NULL          -- SHA-256 for dedup/integrity
);

-- Simple likes (one per session, no auth needed)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,           -- browser fingerprint or random ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, session_id)
);
```

### Indexes

```sql
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_games_created ON games(created_at DESC);
CREATE INDEX idx_games_play_count ON games(play_count DESC);
CREATE INDEX idx_games_slug ON games(slug);
```

---

## Identity System — Creator Codes

No email. No password. No OAuth. Just a memorable code.

### Registration Flow

1. Kid goes to `/publish` (or hits `POST /api/auth/register`)
2. Picks a **display name** (e.g. "CosmicCoder")
3. System generates a **Creator Code**: `WORD-WORD-WORD-NUMBER` format
   - Example: `ROCKET-WOLF-COMET-73`, `PIXEL-DRAGON-QUEST-19`
   - Word lists: ~200 fun, kid-friendly words (adjectives + nouns — animals, space, colors, etc.)
   - Number: 10–99
   - Check for uniqueness before issuing
4. System also generates an **API token** (UUID v4, stored hashed)
5. Returns both the Creator Code and API token to the kid
6. Kid saves their Creator Code somewhere (it's shown prominently with a "save this!" message)

### Authentication

- **Web form**: Enter Creator Code to link a new game to your profile
- **API**: Send API token in `Authorization: Bearer <token>` header
- **Lost code?** Just make a new account. Low stakes. Old games stay up under old name.

### Security Notes

- API tokens are hashed (SHA-256) before storage — never stored in plain text
- Creator Codes are not secret (they're like usernames) but API tokens are
- Rate limit account creation: max 5 per IP per hour

---

## Publish Flow (Web Form — Day One)

### Page: `/publish`

**Step 1 — Identity**
- "First time? Pick a name:" [text input] → [Create Account] → shows Creator Code + API token with big "SAVE THIS" prompt
- "Returning? Enter your Creator Code:" [text input]

**Step 2 — Game Details**
- Title (required, max 60 chars)
- Description (optional, max 280 chars)
- Library picker (checkboxes):
  - ☐ React
  - ☐ Three.js (3D graphics)
  - ☐ D3.js (data visualization)
  - ☐ GSAP (animations)
  - ☐ Tone.js (audio/music)
  - ☐ p5.js (creative coding — great for kids)
  - ☐ Phaser (2D game framework)
  - ☐ matter.js (physics engine)
  - ☐ Pixi.js (2D rendering)

**Step 3 — Code**
- Large textarea (or basic code editor like CodeMirror/Monaco for syntax highlighting)
- Paste full HTML/JS/CSS
- OR paste just the JS/CSS and system wraps it in a standard HTML boilerplate

**Step 4 — Preview**
- Live preview in a sandboxed iframe right on the page
- Kid can see their game running before publishing

**Step 5 — Publish**
- [Publish Game] button
- Shows the game URL: `kidhubb.com/play/meteor-shooter-cosmic-coder`
- Copy link button
- Confetti animation 🎉 (because it's for kids!)

---

## Agent-Friendly Design & Frictionless Shortcuts

### Claude in Chrome Flow (Desktop)

Claude in Chrome is a browser extension (available on all paid plans) that can read, click, and navigate websites. It works on desktop Chrome only (not iPad/mobile). The kid says "go to kidhubb.com and publish my game" and Claude in Chrome:

1. Navigates to `kidhubb.com/publish`
2. Reads the form fields
3. Fills in the Creator Code (kid tells Claude theirs), title, description
4. Pastes the game HTML into the code textarea
5. Clicks "Preview" to verify it works
6. Clicks "Publish"
7. Reads back the game URL to the kid

**No special agent detection needed.** The same form works for humans and agents. The key is making the form simple, well-labeled, and with clear HTML semantics (proper `<label>` elements, `name` attributes, `aria-label` on the textarea, etc.) so Claude in Chrome can easily parse it.

**Form design tips for agent compatibility:**
- Use standard `<input>` and `<textarea>` elements (not custom rich editors for v1)
- Every field gets a clear `<label>` with `htmlFor`
- Use descriptive `placeholder` text: "Paste your full HTML/JS/CSS game code here"
- Keep the flow linear (no tabs, modals, or multi-page wizards that confuse agents)
- Success state should have the game URL in a selectable `<input>` or `<code>` block that Claude can read

### iPad / Mobile Flow (Day One)

Claude in Chrome doesn't work on iPad. The realistic flow is:

1. Kid makes game with Claude on iPad
2. Claude outputs the final HTML
3. Kid copies the HTML (long-press → Select All → Copy in the Claude app)
4. Kid opens Safari → goes to `kidhubb.com/publish`
5. Pastes into the code field, fills in title, publishes

To make step 3-5 smoother, build two shortcuts:

**Option A — URL with clipboard pre-load (simplest):**
The publish page checks for a `?paste=1` query param. If present, it auto-focuses the code textarea and shows a prominent "Tap here and paste your code" message. The kid bookmarks `kidhubb.com/publish?paste=1` on their iPad home screen. One tap to get there, one paste, done.

**Option B — iOS Shortcut (fancier, Phase 2):**
An iOS Shortcut that:
1. Grabs the clipboard contents
2. Opens `kidhubb.com/publish?code={base64-encoded-clipboard}`
3. The publish page detects the `code` query param and pre-fills the textarea

The URL-encoded approach has a size limit (~2KB for URL length) so for larger games, Option A (manual paste) is more reliable. But for typical kid games (under 2KB), this is nearly zero-friction.

**Option C — "Publish from Claude" instructions page:**
Create a page at `kidhubb.com/from-claude` that kids can show to Claude (or paste the URL in chat). The page contains clear instructions like:

```
When a kid asks you to publish their game to KidHubb, please:
1. Format their game as a single, complete HTML file
2. Output the complete HTML code
3. Tell them: "Copy all the code above, then tap your KidHubb bookmark to publish!"
```

This teaches Claude (in any interface) to format games consistently for easy copy-paste.

---

## Publish Flow (API — Future Claude Agent Support)

```
POST /api/games
Authorization: Bearer <api_token>
Content-Type: application/json

{
  "title": "Meteor Shooter",
  "description": "Dodge and shoot meteors in space!",
  "html": "<!DOCTYPE html><html>...",
  "libraries": ["phaser"]
}
```

**Response (201):**
```json
{
  "id": "abc-123",
  "slug": "meteor-shooter-cosmiccoder",
  "url": "https://kidhubb.com/play/meteor-shooter-cosmiccoder",
  "title": "Meteor Shooter",
  "creator": "CosmicCoder",
  "created_at": "2026-02-12T..."
}
```

**Error responses:**
- `401` — invalid or missing token
- `400` — missing title or html, content too large, failed safety scan
- `429` — rate limited (max 10 publishes per hour per creator)

---

## API Docs Page (`/api-docs`)

This page serves double duty:
1. Human-readable docs for developers
2. **Claude-readable instructions** — if a kid pastes this URL into a Claude conversation, Claude should understand how to use the API

Include at the top of the page (in a visible but formatted block):

```
<!-- CLAUDE AGENT INSTRUCTIONS
To publish a game to KidHubb:
1. If the user doesn't have a Creator Code yet, POST to /api/auth/register with {"display_name": "their chosen name"}
2. POST the game HTML to /api/games with the API token
3. Share the returned URL with the user
See full API docs below.
-->
```

---

## Game Player Page (`/play/[slug]`)

### Layout
```
┌─────────────────────────────────────────────┐
│  🎮 Meteor Shooter          by CosmicCoder  │
│  "Dodge and shoot meteors in space!"         │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│           [ GAME IFRAME ]                   │
│           (fills available                  │
│            viewport height)                 │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  ❤️ 12 likes    👁️ 47 plays    [🔗 Share]   │
│  🚩 Report                                  │
└─────────────────────────────────────────────┘
```

### Iframe Configuration

```html
<iframe
  sandbox="allow-scripts"
  src="https://play.kidhubb.com/render/{slug}"
  style="width: 100%; height: 70vh; border: none; border-radius: 12px;"
  title="{game title}"
  loading="lazy"
></iframe>
```

**Sandbox attributes explained:**
- `allow-scripts` — game JS can run
- NO `allow-same-origin` — game cannot access parent page cookies/storage
- NO `allow-forms` — game cannot submit forms
- NO `allow-popups` — game cannot open new windows
- NO `allow-top-navigation` — game cannot redirect parent page

### Game Render Endpoint (`play.kidhubb.com/render/[slug]`)

This is a Next.js API route or page that:
1. Fetches game content from database
2. Injects selected library `<script>` tags from trusted CDN (cdnjs.cloudflare.com)
3. Returns the complete HTML with security headers:

```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; img-src * data: blob:; media-src * data: blob:; connect-src 'none';
X-Frame-Options: ALLOWALL
X-Content-Type-Options: nosniff
```

Key CSP details:
- `connect-src 'none'` — **games cannot make network requests** (no fetch, no XHR, no WebSocket). This is the most important security measure.
- `img-src * data: blob:` — games can display images (data URIs, generated blobs)
- `unsafe-inline` and `unsafe-eval` — necessary for game JS to work
- Only cdnjs.cloudflare.com for external scripts (the library CDN)

---

## Library Injection

When a game specifies libraries, the render endpoint injects script tags before the game's HTML:

```javascript
const LIBRARY_MAP = {
  react: [
    'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js'
  ],
  three: [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
  ],
  d3: [
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
  ],
  gsap: [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
  ],
  tone: [
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js'
  ],
  p5: [
    'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js'
  ],
  phaser: [
    'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js'
  ],
  matter: [
    'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js'
  ],
  pixi: [
    'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js'
  ]
};
```

Injection approach: wrap game HTML in a full document with library scripts in `<head>`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
  </style>
  <!-- Injected libraries -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js"></script>
</head>
<body>
  <!-- BEGIN USER GAME CODE -->
  {game_html_here}
  <!-- END USER GAME CODE -->
</body>
</html>
```

If the game already includes `<!DOCTYPE html>` or `<html>` tags, the system should detect this and inject libraries into the existing `<head>` rather than double-wrapping.

---

## Homepage (`/`)

### Design Direction
- Fun, colorful, kid-friendly aesthetic
- Grid of game cards with hover effects
- No ads, no clutter

### Game Card
```
┌──────────────────┐
│  ┌────────────┐  │
│  │  THUMBNAIL  │  │
│  │  (or color  │  │
│  │  gradient)  │  │
│  └────────────┘  │
│  Meteor Shooter  │
│  by CosmicCoder   │
│  ❤️ 12  👁️ 47     │
└──────────────────┘
```

### Sorting/Filtering
- Tabs: **Newest** | **Most Played** | **Most Liked**
- (v2: tag/category filtering)

### Thumbnails
- V1: Auto-generated colorful gradient based on game title hash (no screenshots needed)
- V2: Automated screenshot via Puppeteer/Playwright on publish (Vercel serverless function)

---

## Content Safety

### Automated Scanning (on publish)

Run the submitted HTML through these checks before saving:

```javascript
const BLOCKED_PATTERNS = [
  // Network access attempts (belt + suspenders with CSP)
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /\.ajax\s*\(/i,
  /new\s+WebSocket/i,
  /navigator\.sendBeacon/i,
  /new\s+EventSource/i,

  // Cookie/storage theft
  /document\.cookie/i,
  /localStorage/i,
  /sessionStorage/i,
  /indexedDB/i,

  // Parent frame escape attempts
  /parent\./i,
  /top\./i,
  /window\.parent/i,
  /window\.top/i,
  /postMessage/i,

  // Crypto mining
  /CoinHive/i,
  /coinhive/i,
  /crypto-?mine/i,

  // Redirects
  /window\.location/i,
  /document\.location/i,
  /location\.href/i,
  /location\.replace/i,
];
```

**Important caveats:**
- These are heuristic checks, not foolproof — they're a first line of defense
- The real security comes from iframe sandboxing + CSP headers
- Some patterns (like `parent.`) could have false positives in legitimate game code
- Consider a `WARNING` vs `BLOCK` tier: warn on ambiguous patterns, block on clearly malicious ones
- `connect-src: 'none'` in CSP is the real enforcement for network access

### Manual Reporting

- Each game page has a 🚩 Report button
- Reports go into a `reports` table for manual review
- Games with 3+ reports are auto-flagged (`status = 'flagged'`) and hidden from homepage pending review

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Content Size Limits

- Max game HTML size: **500 KB** (generous for HTML/JS/CSS; absurdly large games probably aren't kid-made)
- Max title: 60 chars
- Max description: 280 chars

---

## Rate Limiting

Use Vercel's built-in rate limiting or a simple in-memory/Redis approach:

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/register` | 5 per IP per hour |
| `POST /api/games` | 10 per creator per hour |
| `GET /api/games` | 60 per IP per minute |
| `POST /api/games/[id]/like` | 10 per session per minute |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx          # server-side only, never exposed

# Optional: game content subdomain
GAME_RENDER_ORIGIN=https://play.kidhubb.com

# Rate limiting secret (for signed tokens, if needed)
RATE_LIMIT_SECRET=xxx
```

---

## File Structure

```
kidhubb/
├── app/
│   ├── layout.tsx                  # Root layout with kid-friendly theme
│   ├── page.tsx                    # Homepage — game gallery
│   ├── publish/
│   │   └── page.tsx                # Publish form
│   ├── play/
│   │   └── [slug]/
│   │       └── page.tsx            # Game player page
│   ├── creators/
│   │   └── [name]/
│   │       └── page.tsx            # Creator profile
│   ├── api-docs/
│   │   └── page.tsx                # API documentation
│   └── api/
│       ├── auth/
│       │   └── register/
│       │       └── route.ts        # POST: create creator account
│       ├── games/
│       │   ├── route.ts            # GET: list games, POST: publish
│       │   └── [id]/
│       │       ├── route.ts        # GET: game meta, DELETE: remove
│       │       └── like/
│       │           └── route.ts    # POST: like a game
│       └── render/
│           └── [slug]/
│               └── route.ts        # GET: serve game HTML (for iframe)
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   ├── libraries.ts                # LIBRARY_MAP constant
│   ├── safety.ts                   # Content scanning logic
│   ├── creator-codes.ts            # Word list + code generation
│   ├── slug.ts                     # Slug generation from title + creator
│   └── auth.ts                     # Token hashing + verification
├── components/
│   ├── GameCard.tsx                # Game card for gallery grid
│   ├── GameGrid.tsx                # Responsive grid of GameCards
│   ├── GamePlayer.tsx              # Sandboxed iframe wrapper
│   ├── PublishForm.tsx             # Multi-step publish form
│   ├── LibraryPicker.tsx           # Checkbox grid for libraries
│   ├── CodeEditor.tsx              # Textarea or CodeMirror wrapper
│   ├── CreatorBadge.tsx            # Creator name display
│   └── Header.tsx                  # Site header/nav
├── public/
│   └── og-image.png                # Social media preview image
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env.local
```

---

## Implementation Phases

### Phase 1 — MVP (Build This First)

The minimum to get your boys publishing and sharing games:

- [x] Next.js project with Tailwind on Vercel
- [x] Supabase tables: `creators`, `games`, `game_content`
- [x] Creator Code registration (web form)
- [x] Publish form (paste HTML, pick title, select libraries, preview, publish)
- [x] Agent-friendly form design (proper labels, linear flow, semantic HTML)
- [x] `?paste=1` query param support (auto-focus code field for iPad bookmarks)
- [x] Homepage with game grid (newest first)
- [x] Game player page with sandboxed iframe (`srcdoc` approach is fine for v1)
- [x] Basic content scanning on publish
- [x] Game render endpoint with library injection
- [x] Colorful auto-generated gradient thumbnails

### Phase 2 — Polish

- [ ] Creator profile pages
- [ ] Like system
- [ ] Play count tracking
- [ ] Sort by newest / most played / most liked
- [ ] Report button + flagging system
- [ ] Rate limiting on all endpoints
- [ ] API endpoint for publishing (`POST /api/games`)
- [ ] API docs page with Claude agent instructions
- [ ] `/from-claude` instructions page for copy-paste workflow
- [ ] iOS Shortcut for clipboard → publish (base64 URL approach)
- [ ] Confetti animation on successful publish

### Phase 3 — Advanced

- [ ] Separate `play.kidhubb.com` subdomain for game rendering
- [ ] Auto-generated screenshots as thumbnails (Puppeteer)
- [ ] Game versioning (update your game, keep history)
- [ ] Simple comments (creator code required)
- [ ] "Remix" button (fork someone's game to edit your own version)
- [ ] Categories/tags
- [ ] Claude API safety review (run submissions through Claude for content check)
- [ ] Search

---

## Design Notes

### Kid-Friendly Aesthetic
- Rounded corners everywhere (border-radius: 12-16px)
- Playful color palette: bright but not neon. Think Nintendo-esque.
- Suggested palette: deep purple/blue background, colorful accent cards
- Big, readable fonts (16px+ base)
- Fun micro-interactions (hover wobble on cards, bounce on buttons)
- Dark mode by default (games look better on dark backgrounds)
- Mobile-responsive (many kids use tablets/phones)

### Tone of Voice
- Casual and encouraging: "Nice! Your game is live!" not "Game published successfully."
- Kid-level language: "Pick a cool name" not "Enter your display name"
- Celebrate everything: publish a game → confetti. Get a like → little animation.

---

## Key Technical Decisions & Tradeoffs

### Why Supabase over Vercel Postgres/KV?
Supabase gives you a full Postgres database with a generous free tier (500MB), built-in auth if you ever want it, and storage for larger game files. Vercel KV is great for caching but limited for relational data. That said, if you want to keep everything in Vercel ecosystem, Vercel Postgres works fine too — the schema above is standard Postgres either way.

### Why `srcdoc` iframes for v1 instead of subdomain?
Subdomain requires DNS config, separate routing logic, and CORS handling. `srcdoc` works immediately with the same security sandbox attributes. The tradeoff is that `srcdoc` shares the parent origin's storage (mitigated by `sandbox` attribute removing `allow-same-origin`). Migrate to subdomain in Phase 3 when you've validated the concept.

### Why no Babel/JSX transform?
Kids using Claude to generate games will get vanilla HTML/JS, which runs natively. React via CDN uses `React.createElement()` not JSX. If JSX support becomes important later, you could add a client-side Babel transform in the render endpoint, but it adds complexity and load time. Skip for now.

### Why not a proper code editor (Monaco/CodeMirror)?
V1 can start with a `<textarea>` — it works fine for paste-and-publish. Add CodeMirror in Phase 2 if kids want to make edits in-browser. Monaco is overkill for this use case.

### Game size limit rationale
500KB of text is a LOT of HTML/JS/CSS (roughly 500 pages of code). A typical kid-made game will be 5-50KB. The limit is mainly to prevent abuse (someone dumping huge files). If games with embedded base64 images become common, consider raising to 1-2MB or adding image upload support.

---

## Getting Started — Step by Step

### Step 1: Create the project directory and Git repo

```bash
# In your terminal, wherever you keep projects
mkdir kidhubb
cd kidhubb
git init
```

This is where you'll scope Claude Code to (`cd kidhubb && claude`).

### Step 2: Create the Next.js app

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --use-npm
```

Say yes to the defaults. The `.` means "create in current directory" since you already made the folder. This gives you the App Router, TypeScript, and Tailwind out of the box.

### Step 3: Create a GitHub repo and push

```bash
# On github.com: create a new repo called "kidhubb" (private is fine)
git add .
git commit -m "Initial Next.js setup"
git remote add origin https://github.com/YOUR_USERNAME/kidhubb.git
git branch -M main
git push -u origin main
```

### Step 4: Connect to Vercel

1. Go to vercel.com → "Add New Project"
2. Import your `kidhubb` GitHub repo
3. Vercel auto-detects Next.js — accept defaults and deploy
4. You'll get a `.vercel.app` URL immediately (the site is live, just empty)

### Step 5: Point your domain

1. In Vercel project → Settings → Domains
2. Add `kidhubb.com`
3. Vercel will give you DNS records (usually an A record or CNAME)
4. Go to your domain registrar and update DNS to point to Vercel
5. Vercel handles SSL automatically

### Step 6: Create Supabase project

1. Go to supabase.com → "New Project"
2. Pick a name (e.g. "kidhubb"), set a database password, choose a region close to you
3. Once created, go to Settings → API
4. Copy the **Project URL** and the **service_role key** (the secret one, not the anon key)

### Step 7: Set up environment variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key-here
```

Also add these same variables in Vercel:
- Project → Settings → Environment Variables → add both

Add `.env.local` to `.gitignore` (Next.js does this by default).

### Step 8: Run the database SQL

In Supabase → SQL Editor → New Query, paste and run the SQL from the "Data Model" section of this spec (the CREATE TABLE statements and indexes).

### Step 9: Copy this spec into the project

```bash
cp /path/to/KIDHUBB_SPEC.md ./KIDHUBB_SPEC.md
```

### Step 10: Hand off to Claude Code

```bash
cd kidhubb
claude
```

Then tell Claude Code:

> "Read KIDHUBB_SPEC.md. Build Phase 1 of KidHubb. The Next.js project is already scaffolded with TypeScript, Tailwind, and App Router. Supabase is set up with credentials in .env.local and the database tables have been created. Build the pages and API routes described in Phase 1. Focus on getting the core publish → play loop working end to end. Use the file structure from the spec. Install @supabase/supabase-js as a dependency."

### What Claude Code will build (Phase 1 scope):

1. Supabase client setup (`lib/supabase.ts`)
2. Creator Code registration system
3. Publish page with paste-and-publish form (agent-friendly, with `?paste=1` support)
4. Game render API route with library injection
5. Game player page with sandboxed iframe
6. Homepage with game gallery grid
7. Basic content safety scanning
8. Auto-generated gradient thumbnails

### After Claude Code finishes:

```bash
npm run dev          # Test locally at localhost:3000
git add .
git commit -m "Phase 1: core publish and play loop"
git push             # Vercel auto-deploys from main branch
```

Visit kidhubb.com and publish your first game! 🎉
