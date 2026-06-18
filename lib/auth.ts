import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { PublicUser } from "@/lib/types";

const COOKIE_NAME = "els_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

function getSecret(): string {
  return process.env.SESSION_SECRET || "els-news-dev-secret-change-me";
}

/** userId'yi imzalı bir token haline getirir: "<userId>.<imza>" */
function sign(userId: string): string {
  const sig = createHmac("sha256", getSecret()).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(userId).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Giriş yapmış kullanıcıyı döndürür; yoksa null. Şifre hash'i içermez. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const userId = verify(token);
  if (!userId) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, is_admin, created_at")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as PublicUser;
  } catch {
    // Supabase yapılandırılmamışsa sessizce çıkış yapmış say.
    return null;
  }
}

/** Server Action içinde: giriş zorunlu, değilse hata fırlatır. */
export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
  return user;
}
