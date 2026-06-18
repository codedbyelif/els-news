export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
}

/** İstemciye gönderilebilecek güvenli kullanıcı bilgisi (şifre hash'i hariç). */
export type PublicUser = Pick<
  User,
  "id" | "username" | "display_name" | "avatar_url" | "is_admin" | "created_at"
>;

export interface Article {
  id: string;
  slug: string;
  title: string;
  /** Haber gövdesi — TipTap'ten gelen HTML. */
  body: string;
  cover_image_url: string | null;
  featured: boolean;
  views: number;
  /**
   * Haberi yayınlayan kullanıcı. Veritabanında tutulur ancak sitede ASLA
   * gösterilmez — haberler anonim yayınlanır. Sadece "kendi haberlerim"
   * gibi sahiplik kontrolleri için kullanılır.
   */
  author_id: string;
  created_at: string;
}

export interface ArticleListItem extends Article {
  comment_count: number;
}

export interface Comment {
  id: string;
  article_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

/** Yorumlarda yazar GÖRÜNÜR — profil fotoğrafı ve adıyla birlikte. */
export interface CommentWithAuthor extends Comment {
  author: PublicUser;
}
