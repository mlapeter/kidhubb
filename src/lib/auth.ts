import crypto from "crypto";
import { supabase } from "./supabase";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateApiToken(): string {
  return crypto.randomUUID();
}

export async function authenticateCreator(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const hashed = hashToken(token);

  const { data } = await supabase
    .from("creators")
    .select("id, display_name")
    .eq("api_token", hashed)
    .single();

  return data;
}
