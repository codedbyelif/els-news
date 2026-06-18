import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Article, ArticleListItem, CommentWithAuthor } from "@/lib/types";

/**
 * Bir haber listesine yorum sayılarını ekler. Haberlerde yazar bilgisi
 * KASITLI olarak çekilmez — haberler anonim gösterilir.
 */
async function attachCommentCounts(articles: Article[]): Promise<ArticleListItem[]> {
  if (articles.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const ids = articles.map((a) => a.id);

  const { data } = await supabase
    .from("comments")
    .select("article_id")
    .in("article_id", ids);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.article_id, (counts.get(row.article_id) ?? 0) + 1);
  }

  return articles.map((a) => ({ ...a, comment_count: counts.get(a.id) ?? 0 }));
}

export async function getFeaturedArticle(): Promise<ArticleListItem | null> {
  const supabase = getSupabaseAdmin();
  let { data } = await supabase
    .from("articles")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Öne çıkan işaretli haber yoksa en yeni haberi öne çıkar.
  if (!data) {
    const res = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = res.data;
  }

  if (!data) return null;
  const [item] = await attachCommentCounts([data as Article]);
  return item;
}

export async function getLatestArticles(
  limit = 12,
  excludeId?: string
): Promise<ArticleListItem[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  return attachCommentCounts((data ?? []) as Article[]);
}

export async function getMostReadArticles(limit = 5): Promise<ArticleListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCommentCounts((data ?? []) as Article[]);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Article) ?? null;
}

export async function incrementViews(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.rpc("increment_article_views", { article_id: id });
}

export async function getComments(articleId: string): Promise<CommentWithAuthor[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("comments")
    .select(
      "*, author:users(id, username, display_name, avatar_url, is_admin, created_at)"
    )
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function getArticlesByAuthor(
  authorId: string,
  limit = 50
): Promise<ArticleListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCommentCounts((data ?? []) as Article[]);
}

export async function searchArticles(q: string, limit = 30): Promise<ArticleListItem[]> {
  const supabase = getSupabaseAdmin();
  const term = `%${q}%`;
  const { data } = await supabase
    .from("articles")
    .select("*")
    .ilike("title", term)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachCommentCounts((data ?? []) as Article[]);
}
