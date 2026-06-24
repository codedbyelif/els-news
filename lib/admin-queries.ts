import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Article, CommentWithAuthor, PublicUser } from "@/lib/types";

export interface AdminStats {
  articles: number;
  comments: number;
  users: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabaseAdmin();
  const [a, c, u] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);
  return {
    articles: a.count ?? 0,
    comments: c.count ?? 0,
    users: u.count ?? 0,
  };
}

export async function getAllArticles(limit = 100): Promise<Article[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Article[];
}

export async function getAllComments(limit = 100): Promise<(CommentWithAuthor & { article_slug?: string })[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("comments")
    .select(
      "*, author:users!comments_author_id_fkey(id, username, display_name, avatar_url, is_admin, created_at), article:articles(slug, title)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as (CommentWithAuthor & { article_slug?: string })[];
}

export async function getAllUsers(limit = 200): Promise<PublicUser[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as PublicUser[];
}
