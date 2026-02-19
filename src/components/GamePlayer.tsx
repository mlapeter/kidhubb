"use client";

import { useRef, useState, useEffect } from "react";

interface GamePlayerProps {
  slug: string;
  title: string;
}

const GAME_RENDER_ORIGIN =
  process.env.NEXT_PUBLIC_GAME_RENDER_ORIGIN || "https://play.kidhubb.com";

export default function GamePlayer({ slug, title }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

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
        sandbox="allow-scripts allow-same-origin"
        src={`${GAME_RENDER_ORIGIN}/render/${slug}`}
        style={{ width: "100%", height: isFullscreen ? "100vh" : "78vh", border: "none" }}
        title={title}
        loading="lazy"
      />
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
