"use client";

import { useRef, useState, useEffect } from "react";

interface GamePlayerProps {
  slug: string;
  title: string;
}

const GAME_RENDER_ORIGIN =
  process.env.NEXT_PUBLIC_GAME_RENDER_ORIGIN || "https://play.kidhubb.com";

type LoadState = "loading" | "ready" | "timed-out";

const LOAD_TIMEOUT_MS = 10_000;

export default function GamePlayer({ slug, title }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Load timeout — if iframe hasn't fired onload after 10s, assume it's stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadState((prev) => (prev === "loading" ? "timed-out" : prev));
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleIframeLoad() {
    setLoadState((prev) => (prev === "timed-out" ? prev : "ready"));
  }

  function stopGame() {
    if (iframeRef.current) {
      iframeRef.current.src = "about:blank";
    }
    setLoadState("ready");
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  return (
    <div
      ref={containerRef}
      className="pixel-border bg-black relative"
      style={{ boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.5), 6px 6px 0 rgba(0,0,0,0.3)" }}
    >
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        src={`${GAME_RENDER_ORIGIN}/render/${slug}`}
        style={{ width: "100%", height: isFullscreen ? "100vh" : "78vh", border: "none" }}
        title={title}
        loading="lazy"
        onLoad={handleIframeLoad}
      />
      {loadState === "timed-out" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center p-6">
            <p className="text-white text-lg mb-4">This game seems stuck...</p>
            <button
              onClick={stopGame}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition-colors"
            >
              Stop Game
            </button>
          </div>
        </div>
      )}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 text-white/30 hover:text-white/80 transition-colors text-lg px-2 py-1 bg-black/30 rounded"
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        ⛶
      </button>
    </div>
  );
}
