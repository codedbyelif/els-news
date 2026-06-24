import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";

export type NotificationType = "comment" | "like" | "reply";

interface CreateArgs {
  userId: string; // bildirimi alan
  actorId: string; // eylemi yapan
  type: NotificationType;
  articleId?: string | null;
  articleSlug?: string | null;
  commentId?: string | null;
  preview?: string | null;
}

/**
 * Bildirim oluşturur. Kullanıcı kendi içeriğine işlem yaptıysa (kendi
 * haberine yorum, kendi yorumunu beğenme vb.) bildirim üretilmez.
 */
export async function createNotification(args: CreateArgs): Promise<void> {
  if (args.userId === args.actorId) return;

  // Bildirim oluşturma asla asıl işlemi (yorum/beğeni) bozmamalı; hata yutulur.
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("notifications").insert({
      user_id: args.userId,
      actor_id: args.actorId,
      type: args.type,
      article_id: args.articleId ?? null,
      article_slug: args.articleSlug ?? null,
      comment_id: args.commentId ?? null,
      preview: args.preview ? args.preview.slice(0, 120) : null,
    });
  } catch {
    // tablo yoksa veya geçici hata: sessizce geç.
  }
}
