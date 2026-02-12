import { VALID_LIBRARY_KEYS } from "./libraries";

export interface ParsedGame {
  title?: string;
  description?: string;
  libraries: string[];
  gameHtml: string;
  hasHeader: boolean;
}

export function parseKidHubbHeader(code: string): ParsedGame {
  const headerMatch = code.match(/<!--KIDHUBB\s*\n([\s\S]*?)-->/);

  if (!headerMatch) {
    return {
      title: extractTitleFromHtml(code),
      libraries: autoDetectLibraries(code),
      gameHtml: code,
      hasHeader: false,
    };
  }

  const headerText = headerMatch[1];
  const result: ParsedGame = {
    libraries: [],
    gameHtml: code.replace(/<!--KIDHUBB\s*\n[\s\S]*?-->\s*/, ""),
    hasHeader: true,
  };

  for (const line of headerText.split("\n")) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === "libraries") {
        result.libraries = value
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter((s) => VALID_LIBRARY_KEYS.includes(s));
      } else if (key === "title") {
        result.title = value.trim();
      } else if (key === "description") {
        result.description = value.trim();
      }
    }
  }

  if (!result.title) {
    result.title = extractTitleFromHtml(result.gameHtml);
  }

  return result;
}

function extractTitleFromHtml(html: string): string | undefined {
  // Try <title> tag first
  const titleMatch = html.match(/<title[^>]*>\s*([^<]+?)\s*<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) return titleMatch[1].trim();

  // Try <h1> tag
  const h1Match = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i);
  if (h1Match && h1Match[1].trim()) return h1Match[1].trim();

  return undefined;
}

const LIBRARY_DETECTORS: Record<string, RegExp> = {
  phaser: /new\s+Phaser\.(Game|Scene)|Phaser\.AUTO/i,
  p5: /createCanvas\s*\(|function\s+setup\s*\(\s*\)|new\s+p5\(/i,
  three: /new\s+THREE\.|THREE\.Scene|THREE\.WebGLRenderer/i,
  gsap: /gsap\.|TweenMax|TweenLite|TimelineMax/i,
  tone: /new\s+Tone\.|Tone\.Synth|Tone\.Transport/i,
  pixi: /new\s+PIXI\.|PIXI\.Application/i,
  matter: /Matter\.Engine|Matter\.Bodies|Matter\.World/i,
  d3: /d3\.select|d3\.scale|d3\.axis/i,
  react: /React\.createElement|ReactDOM\.render|createRoot/i,
};

export function autoDetectLibraries(code: string): string[] {
  const detected: string[] = [];
  for (const [lib, pattern] of Object.entries(LIBRARY_DETECTORS)) {
    if (pattern.test(code)) {
      detected.push(lib);
    }
  }
  return detected;
}
