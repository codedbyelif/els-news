import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Veritabanı tabanlı basit oran sınırlama (rate limit).
 *
 * Vercel gibi sunucusuz ortamlarda her istek farklı bir örneğe düşebileceği
 * için bellekte tutulan sayaçlar güvenilmez. Bunun yerine son `windowSeconds`
 * içinde kullanıcının ilgili tabloya kaç kayıt eklediğini sayarız.
 */
type Table = "articles" | "comments";

export interface RateResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  table: Table,
  authorId: string,
  max: number,
  windowSeconds: number
): Promise<RateResult> {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("author_id", authorId)
    .gte("created_at", since);

  // Sayım yapılamazsa kullanıcıyı engellemeyiz (fail-open).
  if (error || count === null) return { allowed: true };

  if (count >= max) {
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }
  return { allowed: true };
}

/** Limit aşıldığında kullanıcıya gösterilecek Türkçe mesaj. */
export function rateLimitMessage(kind: "article" | "comment"): string {
  return kind === "article"
    ? "Çok hızlı haber yayınlıyorsunuz. Lütfen birkaç dakika sonra tekrar deneyin."
    : "Çok hızlı yorum yapıyorsunuz. Lütfen biraz bekleyip tekrar deneyin.";
}
