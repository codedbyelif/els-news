import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  Article,
  ArticleListItem,
  CommentWithAuthor,
  AppNotification,
} from "@/lib/types";

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

/**
 * Bir haberin yorumlarını beğeni sayıları ve tek seviye yanıtlarıyla getirir.
 * Üst düzey yorumlar yeniden->eskiye; yanıtlar eskiden->yeniye sıralanır.
 * `currentUserId` verilirse her yorumun kullanıcı tarafından beğenilip
 * beğenilmediği (`liked_by_me`) hesaplanır.
 */
export async function getComments(
  articleId: string,
  currentUserId?: string
): Promise<CommentWithAuthor[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("comments")
    .select(
      "*, author:users!comments_author_id_fkey(id, username, display_name, avatar_url, is_admin, created_at)"
    )
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as CommentWithAuthor[];
  if (rows.length === 0) return [];

  // Beğeni sayıları + kullanıcının beğenileri
  const ids = rows.map((r) => r.id);
  const { data: likeRows } = await supabase
    .from("comment_likes")
    .select("comment_id, user_id")
    .in("comment_id", ids);

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const l of likeRows ?? []) {
    counts.set(l.comment_id, (counts.get(l.comment_id) ?? 0) + 1);
    if (currentUserId && l.user_id === currentUserId) mine.add(l.comment_id);
  }

  for (const r of rows) {
    r.like_count = counts.get(r.id) ?? 0;
    r.liked_by_me = mine.has(r.id);
    r.replies = [];
  }

  // Tek seviye ağaç: yanıtları üst yorumun altına yerleştir.
  const byId = new Map(rows.map((r) => [r.id, r]));
  const top: CommentWithAuthor[] = [];
  for (const r of rows) {
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.replies!.push(r);
    } else {
      top.push(r);
    }
  }

  // Üst yorumlar yeniden eskiye; yanıtlar zaten eskiden yeniye.
  top.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return top;
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

// ---------------------------------------------------------------------
// Bildirimler
// ---------------------------------------------------------------------

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  // notifications tablosu henüz oluşturulmadıysa (migration çalıştırılmadan)
  // hata yutulur ve 0 döner.
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function getNotifications(
  userId: string,
  limit = 30
): Promise<AppNotification[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "*, actor:users!notifications_actor_id_fkey(id, username, display_name, avatar_url, is_admin, created_at)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as AppNotification[];
}
