"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

export interface ArticleFormState {
  error?: string;
  values?: {
    title: string;
    body: string;
    cover_image_url: string;
  };
}

/** HTML etiketlerini soyup düz metin uzunluğunu ölçer. */
function textLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export async function publishArticleAction(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/giris?next=/yaz");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const cover = String(formData.get("cover_image_url") ?? "").trim();

  const values = { title, body, cover_image_url: cover };

  if (title.length === 0) {
    return { error: "Başlık boş olamaz.", values };
  }
  if (textLength(body) === 0) {
    return { error: "Haber metni boş olamaz.", values };
  }

  // Spam koruması: 10 dakikada en fazla 5 haber.
  if (!user.is_admin) {
    const rate = await checkRateLimit("articles", user.id, 5, 600);
    if (!rate.allowed) {
      return { error: rateLimitMessage("article"), values };
    }
  }

  const supabase = getSupabaseAdmin();

  // Benzersiz slug üret
  const base = slugify(title) || "haber";
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${base}-${Math.floor(1000 + (Date.now() % 9000))}-${i}`;
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      slug,
      title,
      body,
      cover_image_url: cover || null,
      author_id: user.id,
      featured: false,
    })
    .select("slug")
    .single();

  if (error || !data) {
    return { error: "Haber yayınlanamadı. Tekrar deneyin.", values };
  }

  revalidatePath("/");
  redirect(`/haber/${data.slug}`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase
    .from("articles")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();

  if (!article) return;
  // Sadece haberi yazan kişi ya da admin silebilir.
  if (article.author_id !== user.id && !user.is_admin) {
    throw new Error("Bu haberi silme yetkiniz yok.");
  }

  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!user.is_admin) throw new Error("Sadece admin öne çıkarabilir.");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseAdmin();
  // Önce diğerlerinin öne çıkanını kaldır (tek bir manşet).
  await supabase.from("articles").update({ featured: false }).neq("id", id);
  await supabase.from("articles").update({ featured: true }).eq("id", id);
  revalidatePath("/");
}
