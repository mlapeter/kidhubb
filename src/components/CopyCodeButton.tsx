"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rpg-btn rpg-btn-purple px-4 py-2 text-[10px]"
    >
      {copied ? "✓ Copied!" : "📋 Copy Code"}
    </button>
  );
}
