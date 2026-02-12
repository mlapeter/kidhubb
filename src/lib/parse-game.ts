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

  return result;
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
