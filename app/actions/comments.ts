"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

export interface CommentState {
  error?: string;
  ok?: boolean;
}

export async function addCommentAction(
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Yorum yapmak için giriş yapmalısınız." };
  }

  const articleId = String(formData.get("article_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "").trim();

  if (!articleId) return { error: "Haber bulunamadı." };
  // Fotoğraflı yorumda metin zorunlu değil; ikisi de boşsa hata.
  if (body.length === 0 && !imageUrl) {
    return { error: "Yorum boş olamaz." };
  }

  // Spam koruması: 5 dakikada en fazla 10 yorum.
  if (!user.is_admin) {
    const rate = await checkRateLimit("comments", user.id, 10, 300);
    if (!rate.allowed) {
      return { error: rateLimitMessage("comment") };
    }
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    author_id: user.id,
    body,
    image_url: imageUrl || null,
    parent_id: parentId || null,
  });

  if (error) return { error: "Yorum eklenemedi. Tekrar deneyin." };

  if (slug) revalidatePath(`/haber/${slug}`);
  return { ok: true };
}

/** Yorumu beğen / beğeniyi geri al (giriş zorunlu). */
export async function toggleCommentLikeAction(
  formData: FormData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const commentId = String(formData.get("comment_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!commentId) return;

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: user.id });
  }

  if (slug) revalidatePath(`/haber/${slug}`);
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return;

  const supabase = getSupabaseAdmin();
  const { data: comment } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();

  if (!comment) return;
  if (comment.author_id !== user.id && !user.is_admin) {
    throw new Error("Bu yorumu silme yetkiniz yok.");
  }

  await supabase.from("comments").delete().eq("id", id);
  if (slug) revalidatePath(`/haber/${slug}`);
}
