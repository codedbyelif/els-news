import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Giriş kapısı (gate): siteye girmeden önce sorulan sorulardan en az
 * REQUIRED_CORRECT tanesini doğru cevaplayan kullanıcıya erişim verir.
 *
 * Sorular ve cevaplar SADECE Supabase'deki `gate_questions` tablosunda durur
 * (bkz. supabase/migration-gate.sql). Tablo RLS ile public erişime kapalıdır;
 * yalnızca service-role anahtarıyla sunucu tarafında okunur. Cevaplar asla
 * istemciye gönderilmez — client'a sadece soru metni ve maskelenmiş ipucu gider.
 */

export interface GateQuestion {
  id: string;
  /** Kullanıcıya gösterilen soru metni. */
  prompt: string;
  /** Doğru cevap. Esnek eşleşir (büyük/küçük, boşluk, Türkçe karakter farkları yok sayılır). */
  answer: string;
}

/** Siteye girmek için en az kaç soruyu doğru cevaplamak gerekir. */
export const REQUIRED_CORRECT = 2;

/** Soruları Supabase'den çeker (sıralı). Cevaplar dahil — sadece sunucuda kullanılır. */
export async function getQuestions(): Promise<GateQuestion[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gate_questions")
    .select("id, prompt, answer")
    .order("sort", { ascending: true });
  if (error || !data) return [];
  return data as GateQuestion[];
}

export const GATE_COOKIE = "els_gate";
const GATE_MAX_AGE = 60 * 60 * 24 * 365; // 1 yıl ("hep açık")

function getSecret(): string {
  return process.env.SESSION_SECRET || "els-news-dev-secret-change-me";
}

/** Cevabı esnek karşılaştırma için normalize eder. */
export function normalizeAnswer(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // aksanları kaldır (ş→s, ç→c, ü→u, ...)
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9 ]+/g, "") // harf/rakam/boşluk dışını at (noktalama vb.)
    .replace(/\s+/g, " ") // birden fazla boşluğu teke indir
    .trim();
}

/** Tüm boşlukları da kaldıran sıkı biçim ("ab cd" == "abcd"). */
function squash(value: string): string {
  return normalizeAnswer(value).replace(/ /g, "");
}

/** Belirli bir cevap, belirli bir sorunun doğru cevabıyla eşleşiyor mu? */
function matches(answer: string, expected: string): boolean {
  const guess = normalizeAnswer(answer);
  if (!guess || !normalizeAnswer(expected)) return false; // cevap tanımsızsa asla eşleşme
  return (
    normalizeAnswer(expected) === guess ||
    squash(expected) === squash(answer) // boşluklu/bitişik yazımı da kabul et
  );
}

/**
 * Verilen cevapların kaç tanesinin doğru olduğunu sayar.
 * Sorular (cevaplarıyla) Supabase'den çekilip buraya verilir — bkz. getQuestions().
 * Örn. answers = { q1: "...", q2: "..." } → kaç tanesi doğruysa o sayı.
 */
export function countCorrect(
  answers: Record<string, string>,
  questions: GateQuestion[],
): number {
  return questions.reduce((count, q) => {
    const given = answers[q.id];
    return given && matches(given, q.answer) ? count + 1 : count;
  }, 0);
}

/**
 * Soruları client'a göndermek için ipuçlu, cevapsız hale getirir.
 * Supabase'den çeker; cevap asla istemciye gitmez, sadece maskelenmiş ipucu.
 * Örn. cevap "elif kaynar" → ipucu "e**** k*****"
 */
export async function getPublicQuestions(): Promise<
  { id: string; prompt: string; hint: string }[]
> {
  const questions = await getQuestions();
  return questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    hint: makeHint(q.answer),
  }));
}

/** "elif kaynar" → "e*** k*****" (ilk harf açık, kalanı yıldız, kelime uzunluğu korunur). */
export function makeHint(answer: string): string {
  return answer
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word;
      return word[0] + "*".repeat(word.length - 1);
    })
    .join(" ");
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Kapı geçildi olarak işaretle (imzalı cookie). */
export async function grantGate(): Promise<void> {
  const value = "ok";
  const store = await cookies();
  store.set(GATE_COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
}

/** Cookie değeri geçerli mi? (proxy ve sunucu tarafında ortak mantık) */
export function isValidGateToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(value);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
