"use client";

import { useState, useEffect, useRef } from "react";
import { parseKidHubbHeader, type ParsedGame } from "@/lib/parse-game";

type Phase = "paste" | "welcome" | "confirm" | "success";

interface PublishResult {
  url: string;
  slug: string;
  title: string;
}

interface SavedIdentity {
  creator_code: string;
  display_name: string;
}

function getSavedIdentity(): SavedIdentity | null {
  try {
    const saved = localStorage.getItem("kidhubb_identity");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

function saveIdentity(identity: SavedIdentity) {
  localStorage.setItem("kidhubb_identity", JSON.stringify(identity));
}

export default function PublishForm() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Identity
  const [identity, setIdentity] = useState<SavedIdentity | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recovering, setRecovering] = useState(false);

  // Game
  const [rawCode, setRawCode] = useState("");
  const [parsed, setParsed] = useState<ParsedGame | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // UI
  const [phase, setPhase] = useState<Phase>("paste");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Load saved identity on mount
  useEffect(() => {
    setIdentity(getSavedIdentity());
  }, []);

  // Auto-focus textarea on mount
  useEffect(() => {
    if (phase === "paste") {
      textareaRef.current?.focus();
    }
  }, [phase]);

  function handlePaste(code: string) {
    setRawCode(code);
    if (!code.trim()) {
      setParsed(null);
      return;
    }

    const result = parseKidHubbHeader(code);
    setParsed(result);
    setTitle(result.title || "");
    setDescription(result.description || "");
    setError("");

    if (identity) {
      setPhase("confirm");
    } else {
      autoCreateAccount(result);
    }
  }

  async function autoCreateAccount(parsedGame: ParsedGame) {
    setCreatingAccount(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: null, auto: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong creating your account");
        setCreatingAccount(false);
        return;
      }

      const newIdentity: SavedIdentity = {
        creator_code: data.creator_code,
        display_name: data.display_name,
      };
      saveIdentity(newIdentity);
      setIdentity(newIdentity);
      setParsed(parsedGame);
      setPhase("welcome");
    } catch {
      setError("Couldn't connect — try again");
    } finally {
      setCreatingAccount(false);
    }
  }

  function copySecretCode() {
    if (!identity) return;
    const text = `My KidHubb creator code is ${identity.creator_code} — it's how I publish games on kidhubb.com. Please remember it for me! (It's not a password, just a fun code that links to my creator name.)`;
    navigator.clipboard.writeText(text);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 3000);
  }

  function proceedToConfirm() {
    setPhase("confirm");
  }

  async function handleRecovery() {
    if (!recoveryCode.trim()) return;

    setRecovering(true);
    setRecoveryError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_code: recoveryCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRecoveryError(data.error || "Code not found");
        return;
      }

      const recoveredIdentity: SavedIdentity = {
        creator_code: data.creator_code,
        display_name: data.display_name,
      };
      saveIdentity(recoveredIdentity);
      setIdentity(recoveredIdentity);
      setShowRecovery(false);
      setRecoveryCode("");
    } catch {
      setRecoveryError("Couldn't connect — try again");
    } finally {
      setRecovering(false);
    }
  }

  async function handlePublish() {
    if (!identity || !parsed) return;

    const finalTitle = title.trim() || "Untitled Game";
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_code: identity.creator_code,
          title: finalTitle,
          description: description.trim() || undefined,
          html: parsed.gameHtml,
          libraries: parsed.libraries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.warnings
          ? `${data.error}: ${data.warnings.join(", ")}`
          : data.error || "Failed to publish";
        setError(msg);
        return;
      }

      setPublishResult({
        url: data.url,
        slug: data.slug,
        title: data.title,
      });
      setPhase("success");
    } catch {
      setError("Couldn't connect — try again");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    if (publishResult) {
      navigator.clipboard.writeText(publishResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function reset() {
    setRawCode("");
    setParsed(null);
    setTitle("");
    setDescription("");
    setPublishResult(null);
    setError("");
    setPhase("paste");
  }

  // ── PASTE PHASE ──
  if (phase === "paste") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Identity banner for returning users */}
        {identity && (
          <div className="rpg-panel p-3 text-center">
            <p className="text-[10px] text-wood-mid/70">
              Publishing as{" "}
              <span className="text-accent-purple">{identity.display_name}</span>
            </p>
          </div>
        )}

        <div
          className="rpg-panel-dark relative cursor-pointer p-4"
          onClick={async () => {
            if (rawCode) {
              textareaRef.current?.focus();
              return;
            }
            try {
              const text = await navigator.clipboard.readText();
              if (text && text.trim().length > 50) {
                handlePaste(text);
              } else if (text && text.trim()) {
                setRawCode(text);
              } else {
                textareaRef.current?.focus();
              }
            } catch {
              // Clipboard access denied — fall back to focusing textarea
              textareaRef.current?.focus();
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={rawCode}
            onChange={(e) => {
              const val = e.target.value;
              setRawCode(val);
              if (val.trim().length > 50) {
                handlePaste(val);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text");
              handlePaste(pasted);
            }}
            aria-label="Paste your game code here"
            className={`w-full resize-none bg-transparent text-[10px] text-parchment focus:outline-none ${rawCode ? "min-h-[40vh]" : "min-h-0 h-0 absolute opacity-0"}`}
            spellCheck={false}
          />
          {!rawCode && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-7xl">📋</span>
              <p className="text-sm text-parchment/70">
                Paste your game code
              </p>
              <p className="text-[10px] text-parchment/30">
                Tap here to paste from clipboard
              </p>
            </div>
          )}
        </div>

        {creatingAccount && (
          <div className="text-center py-4">
            <span className="text-2xl pixel-blink">⏳</span>
            <p className="mt-2 text-[10px] text-parchment/50">Setting up your account...</p>
          </div>
        )}

        {error && (
          <div className="rpg-panel p-3">
            <p className="text-[10px] text-accent-red">{error}</p>
          </div>
        )}

        {/* Recovery link */}
        {!identity && (
          <div className="text-center">
            {!showRecovery ? (
              <button
                onClick={() => setShowRecovery(true)}
                className="text-[10px] text-parchment/30 hover:text-parchment/60"
              >
                Have a secret code?
              </button>
            ) : (
              <div className="rpg-panel p-4 space-y-3 text-left">
                <p className="text-[10px] text-wood-dark/70 text-center">
                  Enter your secret code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="WORD-WORD-00"
                    className="flex-1 border-4 border-wood-mid bg-parchment-dark px-3 py-2 text-[10px] text-wood-dark placeholder:text-wood-mid/40 focus:outline-none focus:border-accent-purple"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRecovery();
                    }}
                  />
                  <button
                    onClick={handleRecovery}
                    disabled={recovering || !recoveryCode.trim()}
                    className="rpg-btn rpg-btn-purple px-4 py-2 text-[10px] disabled:opacity-50"
                  >
                    {recovering ? "..." : "Go"}
                  </button>
                </div>
                {recoveryError && (
                  <p className="text-[10px] text-accent-red">{recoveryError}</p>
                )}
                <button
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryCode("");
                    setRecoveryError("");
                  }}
                  className="text-[10px] text-wood-mid/50 hover:text-wood-dark block mx-auto"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── WELCOME PHASE (new account created) ──
  if (phase === "welcome" && identity) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="text-5xl pixel-float">🎉</div>

        <h2 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          You are {identity.display_name}!
        </h2>

        <div className="rpg-panel p-5 space-y-3">
          <p className="text-[10px] text-wood-mid/70">
            Your secret code is
          </p>
          <p className="text-sm sm:text-base text-accent-purple pixel-pulse">
            {identity.creator_code}
          </p>
          <p className="text-[8px] text-wood-mid/50 normal-case">
            Save this! You need it to publish from other devices
          </p>
        </div>

        <button
          onClick={copySecretCode}
          className="rpg-btn w-full px-6 py-4 text-[10px]"
        >
          {codeCopied ? "✓ Copied!" : "📋 Copy Secret Code"}
        </button>

        <p className="text-[10px] text-parchment/40">
          Tip: Paste it in your AI chat so it remembers for you
        </p>

        <button
          onClick={proceedToConfirm}
          className="rpg-btn rpg-btn-purple w-full px-6 py-4 text-[10px]"
        >
          ▶ Continue to publish
        </button>
      </div>
    );
  }

  // ── CONFIRM PHASE ──
  if (phase === "confirm" && parsed) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 pb-16">
        {/* Preview */}
        <div className="pixel-border-green bg-black"
          style={{ boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.5), 6px 6px 0 rgba(0,0,0,0.3)" }}
        >
          <iframe
            sandbox="allow-scripts allow-same-origin"
            srcDoc={parsed.gameHtml}
            style={{ width: "100%", height: "45vh", border: "none" }}
            title="Game preview"
          />
        </div>

        {/* Title */}
        {!parsed.title ? (
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your game called?"
            maxLength={60}
            autoFocus
            className="w-full border-4 border-wood-mid bg-parchment px-4 py-3 text-center text-xs text-wood-dark placeholder:text-wood-mid/40 focus:outline-none focus:border-accent-purple"
          />
        ) : (
          <h2 className="text-center text-sm text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">{title}</h2>
        )}

        {/* Identity */}
        {identity && (
          <p className="text-center text-[10px] text-parchment/50">
            by <span className="text-accent-purple">{identity.display_name}</span>
          </p>
        )}

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={loading || !identity}
          className="rpg-btn rpg-btn-green w-full px-6 py-5 text-xs disabled:opacity-50"
        >
          {loading ? "Publishing..." : "🚀 Publish My Game!"}
        </button>

        <button
          onClick={reset}
          className="mx-auto block text-[10px] text-parchment/30 hover:text-parchment/60"
        >
          ← Start over
        </button>

        {error && (
          <div className="rpg-panel p-3">
            <p className="text-[10px] text-accent-red">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── SUCCESS PHASE ──
  if (phase === "success" && publishResult) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-sm sm:text-base text-accent-gold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          Nice! Your game is live!
        </h2>
        <p className="text-[10px] text-parchment/60">
          Share this link with friends:
        </p>

        <div className="rpg-panel p-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publishResult.url}
            className="flex-1 bg-transparent text-[8px] text-wood-dark outline-none normal-case"
            aria-label="Game URL"
          />
          <button
            onClick={copyUrl}
            className="rpg-btn rpg-btn-purple px-3 py-2 text-[10px]"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>

        <div className="flex gap-3">
          <a
            href={`/play/${publishResult.slug}`}
            className="rpg-btn rpg-btn-green flex-1 px-4 py-3 text-[10px] text-center"
          >
            ▶ Play It
          </a>
          <button
            onClick={reset}
            className="rpg-btn flex-1 px-4 py-3 text-[10px] text-center"
          >
            🎮 Make Another
          </button>
        </div>
      </div>
    );
  }

  return null;
}
