import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3 saat önce", "2 gün önce" gibi Türkçe göreli zaman. */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;

  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Yüklenebilecek en büyük görsel boyutu (bayt). Sunucu sınırıyla aynı. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Görseli yüklemeden önce istemcide kontrol eder. Sorun varsa kullanıcıya
 * gösterilecek Türkçe mesajı döndürür; yoksa null.
 */
export function imageFileError(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Sadece görsel dosyası yükleyebilirsiniz.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Görsel çok büyük (${mb} MB). En fazla 10 MB yükleyebilirsiniz.`;
  }
  return null;
}

/** Başlıktan URL slug üretir (Türkçe karakter desteğiyle). */
export function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
