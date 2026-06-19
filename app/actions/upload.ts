"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/auth";

const BUCKET = "els-media";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/avif"];

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Tek bir görseli Supabase Storage'a yükler ve herkese açık URL'sini döndürür.
 * Hem kapak görseli hem editör içi görseller hem profil fotoğrafı için kullanılır.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "Görsel yüklemek için giriş yapmalısınız." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Dosya bulunamadı." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Görsel en fazla 10 MB olabilir." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { error: "Sadece görsel dosyaları yüklenebilir (png, jpg, webp, gif)." };
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rand = crypto.randomUUID();
  const path = `${user.id}/${rand}.${ext}`;

  const supabase = getSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { error: "Yükleme başarısız: " + error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
