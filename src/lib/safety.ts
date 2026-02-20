// Only block patterns that are clearly malicious.
// The real security comes from iframe sandbox="allow-scripts" (no allow-same-origin
// for preview) and a separate subdomain (play.kidhubb.com) for production renders.
// CSP headers (connect-src 'none', form-action 'none') add another layer. These
// patterns are a lightweight first pass to catch obviously bad intent — not a
// security boundary.
const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  // Crypto mining
  { pattern: /CoinHive/i, reason: "Crypto mining" },
  { pattern: /crypto-?mine/i, reason: "Crypto mining" },

  // Parent frame escape attempts
  { pattern: /window\.parent/i, reason: "Parent window access" },
  { pattern: /window\.top\b/i, reason: "Top window access" },
  { pattern: /window\.opener/i, reason: "Opener window access" },
  { pattern: /parent\.postMessage/i, reason: "Parent frame messaging" },

  // Cookie theft (localStorage/sessionStorage are fine — sandbox blocks access anyway)
  { pattern: /document\.cookie/i, reason: "Cookie access" },

  // Redirect/exfiltration
  { pattern: /<meta[^>]+http-equiv\s*=\s*["']?refresh/i, reason: "Meta redirect" },
  { pattern: /<form[^>]+action\s*=\s*["']?https?:/i, reason: "External form action" },
];

export interface ScanResult {
  safe: boolean;
  warnings: string[];
}

export function scanGameContent(html: string): ScanResult {
  const warnings: string[] = [];

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(html)) {
      warnings.push(reason);
    }
  }

  warnings.push(...detectInfiniteLoops(html));

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

// --- Infinite loop detection ---

/** Extract text content from all <script> tags in the HTML. */
function extractScriptContent(html: string): string[] {
  const scripts: string[] = [];
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    scripts.push(m[1]);
  }
  return scripts;
}

/**
 * Starting from an opening brace at `start`, walk brace depth to extract
 * the full body (including nested braces). Returns the content between the
 * outer braces, or null if unbalanced.
 */
function extractBracedBody(code: string, start: number): string | null {
  if (code[start] !== "{") return null;
  let depth = 1;
  let i = start + 1;
  while (i < code.length && depth > 0) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") depth--;
    i++;
  }
  if (depth !== 0) return null;
  return code.slice(start + 1, i - 1);
}

const ESCAPE_PATTERNS = [
  /\bbreak\b/,
  /\breturn\b/,
  /\bawait\b/,
  /\byield\b/,
  /\brequestAnimationFrame\b/,
  /\bsetTimeout\b/,
  /\bsetInterval\b/,
  /\bthrow\b/,
];

/** Check whether a loop body contains any mechanism that could exit or yield. */
function hasEscapeInBody(body: string): boolean {
  return ESCAPE_PATTERNS.some((p) => p.test(body));
}

/**
 * Scan HTML for likely infinite loops. Returns an array of warning strings
 * (empty if nothing suspicious found).
 *
 * Detects:
 * 1. Always-true loops (while(true), for(;;)) with no escape mechanism
 * 2. for-loops where the counter moves the wrong direction relative to
 *    the condition (e.g. `i > 3; i++` or `i < 10; i--`)
 */
export function detectInfiniteLoops(html: string): string[] {
  const warnings: string[] = [];
  const scripts = extractScriptContent(html);

  for (const script of scripts) {
    // 1. Always-true loops: while(true), while(1), for(;;), for(;true;), for(;1;)
    const alwaysTrue =
      /\b(?:while\s*\(\s*(?:true|1)\s*\)|for\s*\(\s*;?\s*(?:true|1)?\s*;\s*\))\s*\{/g;
    let m;
    while ((m = alwaysTrue.exec(script)) !== null) {
      const braceIdx = script.indexOf("{", m.index);
      const body = extractBracedBody(script, braceIdx);
      if (body !== null && !hasEscapeInBody(body)) {
        warnings.push("Potential infinite loop (always-true loop with no exit)");
        break;
      }
    }

    // 2. for-loops where counter goes wrong direction
    // Capture the full update expression to parse direction from it
    const forLoop =
      /\bfor\s*\(\s*(?:var|let|const)?\s*(\w+)\s*=\s*[\w.]+\s*;\s*(\w+)\s*([<>]=?)\s*[\w.]+\s*;\s*([^)]+)\)\s*\{/g;
    while ((m = forLoop.exec(script)) !== null) {
      const [, initVar, condVar, operator, rawUpdate] = m;
      const update = rawUpdate.trim();

      // Extract the variable being updated
      const updateVarMatch = update.match(/^(\w+)/);
      if (!updateVarMatch) continue;
      const updateVar = updateVarMatch[1];

      // All three parts must reference the same variable
      if (initVar !== condVar || initVar !== updateVar) continue;

      const braceIdx = script.indexOf("{", m.index);
      const body = extractBracedBody(script, braceIdx);
      if (body !== null && hasEscapeInBody(body)) continue;

      // Determine update direction from various patterns:
      // i++, i--, i += N, i -= N, i = i + N, i = i - N
      let direction: "up" | "down" | null = null;
      if (/\+\+$/.test(update) || /\+=\s*\d/.test(update)) {
        direction = "up";
      } else if (/--$/.test(update) || /-=\s*\d/.test(update)) {
        direction = "down";
      } else {
        // Match: IDENT = IDENT + EXPR or IDENT = IDENT - EXPR
        const assignMatch = update.match(
          /^\w+\s*=\s*\w+\s*([+-])\s*/
        );
        if (assignMatch) {
          direction = assignMatch[1] === "+" ? "up" : "down";
        }
      }

      if (direction === null) continue;

      // Check for mismatch: counting up but condition needs smaller, or vice versa
      const condNeedsSmaller = operator === "<" || operator === "<=";
      const condNeedsLarger = operator === ">" || operator === ">=";

      if (
        (direction === "up" && condNeedsLarger) ||
        (direction === "down" && condNeedsSmaller)
      ) {
        warnings.push(
          "Potential infinite loop (counter moves away from exit condition)"
        );
        break;
      }
    }
  }

  return warnings;
}

export const MAX_HTML_SIZE = 500 * 1024; // 500 KB
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 280;
