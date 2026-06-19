"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser, requireUser } from "@/lib/auth";

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

  if (!articleId) return { error: "Haber bulunamadı." };
  if (body.length < 2) return { error: "Yorum çok kısa." };
  if (body.length > 1500) return { error: "Yorum en fazla 1500 karakter olabilir." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    author_id: user.id,
    body,
  });

  if (error) return { error: "Yorum eklenemedi. Tekrar deneyin." };

  if (slug) revalidatePath(`/haber/${slug}`);
  return { ok: true };
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
