export interface CreatorIdentity {
  creator_id: string;
  creator_code: string;
  display_name: string;
}

const COOKIE_NAME = "arcadelab_identity";
const LEGACY_COOKIE_NAME = "kidhubb_identity";
const LS_KEY = "arcadelab_identity";
const LEGACY_LS_KEY = "kidhubb_identity";

export function getCreatorIdentity(): CreatorIdentity | null {
  // Try localStorage (new key first, then legacy)
  for (const key of [LS_KEY, LEGACY_LS_KEY]) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const identity = JSON.parse(saved);
        if (key === LEGACY_LS_KEY) {
          saveCreatorIdentity(identity);
          localStorage.removeItem(LEGACY_LS_KEY);
        }
        return identity;
      }
    } catch {
      // localStorage unavailable or corrupted
    }
  }

  // Try cookies (new name first, then legacy)
  for (const name of [COOKIE_NAME, LEGACY_COOKIE_NAME]) {
    try {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${name}=([^;]*)`)
      );
      if (match) {
        const identity = JSON.parse(decodeURIComponent(match[1]));
        if (name === LEGACY_COOKIE_NAME) {
          saveCreatorIdentity(identity);
          document.cookie = `${LEGACY_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
        }
        return identity;
      }
    } catch {
      // cookie missing or corrupted
    }
  }

  return null;
}

export function saveCreatorIdentity(identity: CreatorIdentity) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(identity));
  } catch {
    // localStorage unavailable
  }
  const encoded = encodeURIComponent(JSON.stringify(identity));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearCreatorIdentity() {
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    // localStorage unavailable
  }
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${LEGACY_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
