// Only block patterns that are clearly malicious.
// The real security comes from iframe sandbox="allow-scripts" (no allow-same-origin)
// and CSP headers (connect-src 'none'). These patterns are a lightweight first pass
// to catch obviously bad intent — not a security boundary.
const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  // Crypto mining
  { pattern: /CoinHive/i, reason: "Crypto mining" },
  { pattern: /crypto-?mine/i, reason: "Crypto mining" },

  // Parent frame escape attempts
  { pattern: /window\.parent/i, reason: "Parent window access" },
  { pattern: /window\.top\b/i, reason: "Top window access" },
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

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

export const MAX_HTML_SIZE = 500 * 1024; // 500 KB
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 280;
