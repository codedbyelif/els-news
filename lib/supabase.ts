import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Sunucu tarafı Supabase istemcisi.
 *
 * ELS News kendi kimlik doğrulamasını (kullanıcı adı + şifre) yönettiği için
 * Supabase Auth kullanmıyoruz. Tüm veri erişimi sunucu üzerinden, yetki
 * kontrolü Server Action'larda yapılarak gerçekleşir; bu yüzden service-role
 * anahtarı kullanıyoruz. Bu anahtar ASLA istemciye sızdırılmamalıdır.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. .env.local içine NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY ekleyin."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
