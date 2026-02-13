# KidHubb — AI Visibility Audit & Improvements

## What an AI sees when visiting kidhubb.com

### Homepage (kidhubb.com)

Here is the COMPLETE text an AI receives when fetching the homepage. This is everything — there is nothing else:

```
KidHubb — Publish & Play Games

[🎮KidHubb](/) [Play](/play) [Create Game](/publish)

☁️
☁️
☁️
🎮

# KidHubb

Make games. Share games. Play games.

[🚀Create Game](/publish) [👾Play Games](/play)

⭐

A place where kids publish & play browser games

🌟🏆💎🔥🌈

🌿🌱🌿🌱🌾
```

### What an AI understands from this:

- There's a site called KidHubb
- It has something to do with games
- There are links to /play and /publish
- There's a tagline: "Make games. Share games. Play games."
- It's "a place where kids publish & play browser games"
- A lot of decorative emojis (clouds, stars, plants) that are meaningless to an AI

### What an AI does NOT understand from this:

- How publishing works (paste HTML? upload a file? write code in-browser?)
- What format games should be in (HTML? ZIP? something else?)
- Whether there's an API
- How identity/accounts work
- What libraries are supported
- How to help a kid who says "I made a game, put it on KidHubb"
- What the KidHubb header format is
- Whether games need to be single-file HTML

### Publish page (kidhubb.com/publish)

Complete text received:

```
Publish a Game — KidHubb

[🎮KidHubb](/) [Play](/play) [Create Game](/publish)

# 🚀 Create a Game

📋
Paste your game code
Tap here to paste from clipboard

Have a secret code?
```

### What an AI understands:

- You paste game code to publish
- There's something about a "secret code"

### What an AI does NOT understand:

- What "game code" means (full HTML file? just JavaScript? a URL?)
- The KidHubb header format for embedding metadata
- What libraries are available and how they get injected
- How the creator code / identity system works
- Size limits or other constraints
- What happens after pasting

---

## Suggested Improvements

### Goal

Any AI assistant (Claude, ChatGPT, Gemini, etc.) that a kid is chatting with should be able to visit kidhubb.com and immediately understand:

1. What KidHubb is
2. How to format a game for publishing
3. How to guide the kid through publishing

The AI doesn't need to see it visually — it just needs clear text content in the HTML that survives text extraction.

### Implementation: Add a hidden-from-humans, visible-to-AI info block

Add a section to the homepage that is visually hidden (screen-reader style, not `display:none` which gets stripped) but present in the HTML text content. This is the same technique used for accessibility — the content exists in the DOM and is extractable by any tool that reads page text.

Use a CSS class like:

```css
.ai-info {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

Do NOT use `display: none` or `visibility: hidden` — many text extraction tools skip those. The `position: absolute; left: -9999px` approach ensures the text is in the DOM and readable by any AI or screen reader, but invisible to sighted users.

### What to add to the homepage

Add this block somewhere in the homepage HTML body (near the bottom is fine). The content should be in a `<section>` with the `.ai-info` class:

```html
<section class="ai-info" aria-label="KidHubb platform information for AI assistants">

KidHubb is a platform where kids publish and play browser-based games.
Games are single-file HTML documents with inline JavaScript and CSS.

HOW TO PUBLISH A GAME:
1. The game must be a single, complete HTML file with all JS and CSS inline.
2. Go to kidhubb.com/publish and paste the full HTML code.
3. The system auto-detects the game title and any supported libraries.

KIDHUBB HEADER FORMAT (OPTIONAL):
To pre-fill the title and description, add this comment to the very top of the HTML:
<!--KIDHUBB
title: Game Title Here
description: A short description of the game
libraries: phaser, p5
-->
The header is stripped before the game is stored. If no header is present,
the title is extracted from the HTML <title> tag, and libraries are auto-detected.

SUPPORTED LIBRARIES (automatically injected via CDN — do NOT include script tags for these):
- phaser (2D game framework, great for most games)
- p5 (creative coding and drawing)
- three (3D graphics)
- gsap (animations)
- tone (music and sound)
- pixi (fast 2D rendering)
- matter (physics engine)
- d3 (data visualization)
- react (UI components)

GAME REQUIREMENTS:
- Must be a single HTML file (no external files or imports)
- All JavaScript must be inline in script tags
- All CSS must be inline in style tags
- Maximum size: 500KB
- Should work at any screen size (use viewport-relative sizing)
- Games run in a sandboxed iframe with no network access (fetch, XHR, WebSocket are blocked)
- Do NOT include CDN script tags for supported libraries — KidHubb injects them automatically

CREATOR IDENTITY:
- First-time publishers get an auto-generated creator code (format: WORD-WORD-00)
- The creator code is NOT a password — it's a casual identifier for linking games to a creator name
- Kids can store their creator code by telling their AI assistant:
  "My KidHubb creator code is WORD-WORD-00, it's how I publish games on kidhubb.com. Please remember it for me!"
- To restore identity on a new device, use the "Have a secret code?" link on the publish page

IF A KID ASKS YOU TO MAKE A GAME FOR KIDHUBB:
1. Create a single, complete HTML file
2. Add a KIDHUBB header comment at the top with the title
3. Use inline JS and CSS only
4. If using a supported library (like Phaser or p5.js), list it in the header but do NOT add a CDN script tag
5. Output the complete code
6. Tell the kid: "Copy all the code above, then go to kidhubb.com/publish and paste it in!"

</section>
```

### Why this approach works

1. **Every AI can read it.** Whether it's Claude fetching the URL, ChatGPT browsing, Gemini, or any future AI — they all extract text from HTML. This content will be in that extraction.

2. **Invisible to kids.** The CSS positioning moves it completely off-screen. Kids see the fun visual homepage, not a wall of technical text.

3. **Accessible.** Screen readers can also read this content, which is fine — it's useful information, not spam.

4. **No separate page needed.** While a `/for-claude` page is still a nice idea, the homepage itself should be self-sufficient. If a kid just says "check out kidhubb.com" to their AI, the AI gets everything it needs in one fetch.

5. **Works today.** No API needed, no special headers, no agent detection. Just good old HTML with useful text content.

### Also add to the publish page

Add a similar but shorter block on the publish page:

```html
<section class="ai-info" aria-label="Publishing instructions for AI assistants">
  This is the KidHubb game publishing page. To publish a game, paste the complete HTML code into the paste zone on this
  page. The game should be a single HTML file with all JavaScript and CSS inline. Optionally, include a KIDHUBB header
  at the top of the HTML for metadata:
  <!--KIDHUBB
title: Game Title
description: Short description
libraries: phaser, p5
-->

  Supported libraries (auto-injected, do NOT include CDN script tags): phaser, p5, three, gsap, tone, pixi, matter, d3,
  react Maximum file size: 500KB. Games run in a sandboxed iframe with no network access. After pasting, the user will
  see a preview of their game, can edit the title, and click "Publish" to make it live. First-time users are
  auto-assigned a creator name and creator code.
</section>
```

### Also: Updates to kidhubb.com/for-claude

What's missing that would help:

No mention of the creator code system — if a kid says "my code is COSMIC-BEAR-50," I wouldn't know what that means from this page alone
No mention that connect-src: 'none' means games can't make network requests (fetch, XHR, WebSocket). If I build a game that tries to call an API, it'll silently break
No mention that games shouldn't include CDN <script> tags for supported libraries (I might double-include them)
The page title says "For Claude" but this works for any AI — maybe "For AI Assistants" would be better so ChatGPT/Gemini users don't skip it

The bigger issue is discoverability. This page is great content, but as we just proved — I couldn't find it from the homepage. A kid has to know to share this specific URL. Lets change the url and page name to /for-ai and include a link at the top next to other two links. Also inlclude a link in the hidden info block.
