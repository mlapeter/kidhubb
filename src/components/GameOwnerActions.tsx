"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCreatorIdentity } from "@/lib/identity";

interface GameOwnerActionsProps {
  slug: string;
  gameId: string;
  creatorId: string;
  serverIsOwner?: boolean;
}

export default function GameOwnerActions({ slug, gameId, creatorId, serverIsOwner }: GameOwnerActionsProps) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(serverIsOwner ?? false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOwner) return; // already confirmed by server
    const identity = getCreatorIdentity();
    if (identity?.creator_id === creatorId) {
      setIsOwner(true);
    }
  }, [creatorId, isOwner]);

  if (!isOwner) return null;

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this game? This can't be undone!")) {
      return;
    }

    setDeleting(true);
    try {
      const identity = getCreatorIdentity();
      if (!identity) return;

      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_code: identity.creator_code }),
      });

      if (res.ok) {
        router.push("/play");
      } else {
        alert("Failed to delete game");
      }
    } catch {
      alert("Couldn't connect — try again");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/publish?update=${slug}`}
        className="rpg-btn rpg-btn-purple px-4 py-2 text-[10px] text-center"
      >
        ✏️ Update
      </a>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rpg-panel px-4 py-2 text-[10px] text-accent-red hover:bg-wood-mid/20 disabled:opacity-50 cursor-pointer"
      >
        {deleting ? "..." : "🗑️ Delete"}
      </button>
    </div>
  );
}
