"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rpg-btn rpg-btn-purple px-4 py-2 text-[10px]"
    >
      {status === "copied" ? "✓ Copied!" : status === "failed" ? "Copy failed — try selecting manually" : "📋 Copy Code"}
    </button>
  );
}
