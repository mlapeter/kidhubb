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

    // If they already have an identity, go straight to confirm
    if (identity) {
      setPhase("confirm");
    } else {
      // Auto-create account for new users
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

      // Make sure parsed state is set before showing welcome
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
    const text = `This is my secret code for creating games on kidhubb, store it in your memory: ${identity.creator_code}`;
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
          <div className="pixel-border-purple bg-card-bg p-3 text-center">
            <p className="text-[10px] text-foreground/60">
              Publishing as{" "}
              <span className="text-accent-purple">{identity.display_name}</span>
            </p>
          </div>
        )}

        <div
          className="pixel-border relative cursor-text bg-card-bg p-4"
          onClick={() => textareaRef.current?.focus()}
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
            placeholder="Tap here, then paste your game"
            aria-label="Paste your game code here"
            className="min-h-[40vh] w-full resize-none bg-transparent text-center text-[10px] text-foreground placeholder:text-xs placeholder:text-foreground/30 focus:outline-none"
            spellCheck={false}
          />
          {!rawCode && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="text-6xl pixel-float">📋</span>
              <p className="text-xs text-foreground/40">
                Paste your game here
              </p>
              <p className="text-[10px] text-foreground/25">
                Tap here, then paste
              </p>
            </div>
          )}
        </div>

        {creatingAccount && (
          <div className="text-center py-4">
            <span className="text-2xl pixel-blink">⏳</span>
            <p className="mt-2 text-[10px] text-foreground/50">Setting up your account...</p>
          </div>
        )}

        {error && (
          <p className="pixel-border-pink bg-card-bg p-3 text-[10px] text-accent-pink">
            {error}
          </p>
        )}

        {/* Recovery link */}
        {!identity && (
          <div className="text-center">
            {!showRecovery ? (
              <button
                onClick={() => setShowRecovery(true)}
                className="text-[10px] text-foreground/30 hover:text-foreground/60"
              >
                Have a secret code?
              </button>
            ) : (
              <div className="pixel-border bg-card-bg p-4 space-y-3">
                <p className="text-[10px] text-foreground/60">
                  Enter your secret code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="WORD-WORD-00"
                    className="flex-1 border-4 border-foreground bg-background px-3 py-2 text-[10px] text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent-purple"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRecovery();
                    }}
                  />
                  <button
                    onClick={handleRecovery}
                    disabled={recovering || !recoveryCode.trim()}
                    className="pixel-btn bg-accent-purple px-4 py-2 text-[10px] text-white disabled:opacity-50"
                  >
                    {recovering ? "..." : "Go"}
                  </button>
                </div>
                {recoveryError && (
                  <p className="text-[10px] text-accent-pink">{recoveryError}</p>
                )}
                <button
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryCode("");
                    setRecoveryError("");
                  }}
                  className="text-[10px] text-foreground/30 hover:text-foreground/60"
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

        <h2 className="text-sm sm:text-base text-accent-yellow">
          You are {identity.display_name}!
        </h2>

        <div className="pixel-border-yellow bg-card-bg p-4 space-y-3">
          <p className="text-[10px] text-foreground/60">
            Your secret code is
          </p>
          <p className="text-sm sm:text-base text-accent-green pixel-pulse">
            {identity.creator_code}
          </p>
          <p className="text-[10px] text-foreground/40">
            Save this! You need it to publish from other devices
          </p>
        </div>

        <button
          onClick={copySecretCode}
          className="pixel-btn bg-accent-yellow px-6 py-4 text-xs text-background w-full"
        >
          {codeCopied ? "✓ Copied!" : "📋 Copy Secret Code"}
        </button>

        <p className="text-[10px] text-foreground/40">
          Tip: Paste it in your AI chat so it remembers for you
        </p>

        <button
          onClick={proceedToConfirm}
          className="pixel-btn bg-accent-purple px-6 py-4 text-xs text-white w-full"
        >
          ▶ Continue to publish
        </button>
      </div>
    );
  }

  // ── CONFIRM PHASE ──
  if (phase === "confirm" && parsed) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Preview */}
        <div className="pixel-border-green bg-black">
          <iframe
            sandbox="allow-scripts"
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
            className="w-full border-4 border-foreground bg-card-bg px-4 py-3 text-center text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent-purple"
          />
        ) : (
          <h2 className="text-center text-sm text-accent-yellow">{title}</h2>
        )}

        {/* Identity */}
        {identity && (
          <p className="text-center text-[10px] text-foreground/40">
            by <span className="text-accent-purple">{identity.display_name}</span>
          </p>
        )}

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={loading || !identity}
          className="pixel-btn w-full bg-accent-purple px-6 py-5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Publishing..." : "🚀 Publish My Game!"}
        </button>

        <button
          onClick={reset}
          className="mx-auto block text-[10px] text-foreground/30 hover:text-foreground/60"
        >
          ← Start over
        </button>

        {error && (
          <p className="pixel-border-pink bg-card-bg p-3 text-[10px] text-accent-pink">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ── SUCCESS PHASE ──
  if (phase === "success" && publishResult) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-sm sm:text-base text-accent-green">
          Nice! Your game is live!
        </h2>
        <p className="text-[10px] text-foreground/60">
          Share this link with friends:
        </p>

        <div className="pixel-border bg-card-bg p-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publishResult.url}
            className="flex-1 bg-transparent text-[10px] text-foreground outline-none"
            aria-label="Game URL"
          />
          <button
            onClick={copyUrl}
            className="pixel-btn bg-accent-purple px-3 py-2 text-[10px] text-white"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>

        <div className="flex gap-3">
          <a
            href={`/play/${publishResult.slug}`}
            className="pixel-btn flex-1 bg-accent-green px-4 py-3 text-[10px] text-background text-center"
          >
            ▶ Play It
          </a>
          <button
            onClick={reset}
            className="pixel-btn flex-1 bg-card-bg px-4 py-3 text-[10px] text-foreground text-center"
          >
            🎮 Make Another
          </button>
        </div>
      </div>
    );
  }

  return null;
}
