export interface CreatorIdentity {
  creator_id: string;
  creator_code: string;
  display_name: string;
}

const COOKIE_NAME = "kidhubb_identity";

export function getCreatorIdentity(): CreatorIdentity | null {
  try {
    const saved = localStorage.getItem("kidhubb_identity");
    if (saved) return JSON.parse(saved);
  } catch {
    // localStorage unavailable or corrupted
  }

  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
    );
    if (match) return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    // cookie missing or corrupted
  }

  return null;
}

export function saveCreatorIdentity(identity: CreatorIdentity) {
  try {
    localStorage.setItem("kidhubb_identity", JSON.stringify(identity));
  } catch {
    // localStorage unavailable
  }
  const encoded = encodeURIComponent(JSON.stringify(identity));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearCreatorIdentity() {
  try {
    localStorage.removeItem("kidhubb_identity");
  } catch {
    // localStorage unavailable
  }
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
