# KidHubb — Simplified Publish Flow

## Problem

The current publish form has too many steps and fields for kids. A 9-year-old on an iPad making games with Claude needs a flow that's basically: copy → paste → done.

## Core Idea: One Paste, One Click

Claude can embed metadata directly in the game HTML as a special comment header. The publish page parses it automatically. The kid pastes ONE block and everything is pre-filled.

### The "KidHubb Header" Format

When a kid is done making a game with Claude, Claude wraps the output like this:

```html
<!--KIDHUBB
title: Meteor Shooter
description: Dodge and shoot meteors in space!
libraries: phaser
-->
<!DOCTYPE html>
<html>
... game code ...
</html>
```

The publish page detects this header and auto-fills title, description, and library selections. If there's no header, the kid can still fill things in manually — but the header makes it zero-thought.

### How the Kid Teaches Claude This Format

Two options (both should work):

**Option A — Instructions page at `kidhubb.com/for-claude`**

A simple page the kid can share with Claude (paste the URL into their Claude chat). The page content says something like:

```
# For Claude: How to Format Games for KidHubb

When a kid asks you to make a game or wants to publish to KidHubb,
output the final game as a single complete HTML file with this
special comment at the very top:

<!--KIDHUBB
title: [Game Title]
description: [One sentence about the game]
libraries: [comma-separated list if needed: phaser, p5, three, gsap, tone, pixi, matter, d3, react]
-->

Then the full HTML follows immediately after.

Rules:
- The game MUST be a single, self-contained HTML file
- All JavaScript and CSS should be inline (in <script> and <style> tags)
- If using a library like Phaser or p5.js, just list it in the header — KidHubb will load it automatically. Do NOT include CDN script tags for supported libraries.
- Keep the game under 500KB total
- The game should work at any screen size (use viewport-relative sizing)

Supported libraries (KidHubb loads these automatically via CDN):
- phaser (2D game framework — great for most games)
- p5 (creative coding, drawing, art)
- three (3D graphics)
- gsap (smooth animations)
- tone (music and sound)
- pixi (fast 2D rendering)
- matter (physics engine)
- d3 (data visualization)
- react (UI components)

After outputting the code, tell the kid:
"Your game is ready! Copy all the code above, then go to kidhubb.com/publish and paste it in."
```

**Option B — The kid just tells Claude once**

The kid says something like "when I make games, format them for kidhubb.com" and Claude can visit the `/for-claude` page to learn the format. Or the kid can just explain it. Once Claude knows, it does it every time in that conversation.

---

## Redesigned Publish Page (`/publish`)

### Layout: One Giant Paste Zone

The entire above-the-fold area should be a big, inviting paste target. Think of it like a dropzone.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│           🎮 KidHubb                                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │                                                    │  │
│  │         📋 Paste your game code here               │  │
│  │                                                    │  │
│  │      (tap here, then paste from clipboard)         │  │
│  │                                                    │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ── OR if it didn't paste right: ──                      │
│  [Choose a file from your device]                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### What Happens When They Paste

1. **Paste detected** → page instantly parses the content
2. **If KidHubb header found** → auto-fill title, description, libraries. Show a confirmation:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ✅ Game detected!                                   │
│                                                      │
│  Title: Meteor Shooter                               │
│  Description: Dodge and shoot meteors in space!      │
│  Libraries: Phaser                                   │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │            [ LIVE PREVIEW ]                    │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│           [ 🚀 Publish My Game! ]                    │
│                                                      │
│  (edit title or description if you want)             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

3. **If no header found** → still show preview, but ask for title (required) and description (optional). Auto-detect libraries by scanning the code for known patterns (e.g., `new Phaser.Game`, `createCanvas` for p5, `new THREE.Scene`, etc.).

4. **Preview runs in a sandboxed iframe** so the kid can see their game working before publishing.

### Identity: Remember the Kid

- First time publishing → small inline section appears: "Pick a creator name!" with a text input. System generates Creator Code, saves it to localStorage.
- Returning → localStorage has their Creator Code, identity section is hidden, just shows "Publishing as CosmicCoder ✨" with a small "not you?" link.
- No separate registration step. Identity creation is folded into the first publish.

### After Publishing

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  🎉 YOUR GAME IS LIVE!                              │
│                                                      │
│  Meteor Shooter                                      │
│  by CosmicCoder                                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  https://kidhubb.com/play/meteor-shooter       │  │
│  │                                [📋 Copy Link]  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [▶️ Play It Now]    [📤 Share]    [🎮 Publish Another] │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Confetti or fun animation on successful publish.

---

## Parsing Logic

```javascript
function parseKidHubbHeader(code) {
  const headerMatch = code.match(/<!--KIDHUBB\s*\n([\s\S]*?)-->/);
  if (!headerMatch) return null;

  const headerText = headerMatch[1];
  const result = {};

  // Parse key: value pairs
  for (const line of headerText.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'libraries') {
        result.libraries = value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        result[key] = value.trim();
      }
    }
  }

  // Strip the header from the game code before storing
  result.gameHtml = code.replace(/<!--KIDHUBB\s*\n[\s\S]*?-->\s*/, '');

  return result;
}
```

### Auto-Detect Libraries (Fallback)

If no header, scan code for library usage patterns:

```javascript
const LIBRARY_DETECTORS = {
  phaser:  /new\s+Phaser\.(Game|Scene)|Phaser\.AUTO/i,
  p5:      /createCanvas\s*\(|function\s+setup\s*\(\s*\)|new\s+p5\(/i,
  three:   /new\s+THREE\.|THREE\.Scene|THREE\.WebGLRenderer/i,
  gsap:    /gsap\.|TweenMax|TweenLite|TimelineMax/i,
  tone:    /new\s+Tone\.|Tone\.Synth|Tone\.Transport/i,
  pixi:    /new\s+PIXI\.|PIXI\.Application/i,
  matter:  /Matter\.Engine|Matter\.Bodies|Matter\.World/i,
  d3:      /d3\.select|d3\.scale|d3\.axis/i,
  react:   /React\.createElement|ReactDOM\.render|createRoot/i,
};
```

---

## Summary: The Kid's Actual Experience

### First time (about 60 seconds):
1. Makes game with Claude on iPad
2. Claude outputs code with KidHubb header
3. Kid copies all the code
4. Opens Safari → kidhubb.com/publish
5. Taps the big paste zone, pastes
6. Sees their game running in preview, title auto-filled
7. Types a creator name (e.g., "CosmicCoder")
8. Taps "Publish My Game!"
9. Gets their link, shares it with friends

### Every time after (about 15 seconds):
1. Copies code from Claude
2. Opens Safari → kidhubb.com/publish (bookmarked on home screen)
3. Pastes
4. Sees preview, confirms title
5. Taps "Publish!" (already remembered as CosmicCoder)
6. Done

### The dream flow (future — Claude in Chrome on desktop):
1. Kid says "publish this to kidhubb.com"
2. Claude navigates to publish page, pastes, publishes
3. Kid gets the link
