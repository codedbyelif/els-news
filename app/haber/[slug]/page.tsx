import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Eye, MessageCircle, Clock } from "lucide-react";
import {
  getArticleBySlug,
  getComments,
  getLatestArticles,
  incrementViews,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { ArticleCard } from "@/components/article-card";
import { CommentSection } from "@/app/haber/[slug]/_components/comment-section";
import { ArticleActions } from "@/app/haber/[slug]/_components/article-actions";
import { formatDate } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { sanitizeArticleHtml, htmlToText } from "@/lib/sanitize";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "ELS News" };
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Haber bulunamadı" };
  const desc = htmlToText(article.body).slice(0, 160);
  return {
    title: article.title,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticlePage({ params }: PageProps) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Okunmayı artır (await etmiyoruz ki sayfa beklemesin diye değil, basitlik için await).
  await incrementViews(article.id);

  const [user, comments, related] = await Promise.all([
    getCurrentUser(),
    getComments(article.id),
    getLatestArticles(4, article.id),
  ]);

  const canModerate = !!user && (user.id === article.author_id || user.is_admin);
  const safeHtml = sanitizeArticleHtml(article.body);
  const plain = htmlToText(article.body);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <article>
        {/* Üst bilgi — DİKKAT: yazar adı YOK */}
        <header>
          <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground">
            <span>{formatDate(article.created_at)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {readingTime(plain)} dk okuma
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {article.views}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" /> {comments.length}
            </span>
            {canModerate && (
              <span className="ml-auto">
                <ArticleActions articleId={article.id} />
              </span>
            )}
          </div>
        </header>

        {article.cover_image_url && (
          <figure className="mt-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          </figure>
        )}

        <div
          className="prose-article mt-8 max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      {/* YORUMLAR — burada yazar GÖRÜNÜR */}
      <CommentSection
        articleId={article.id}
        slug={article.slug}
        comments={comments}
        currentUser={user}
      />

      {/* İLGİLİ HABERLER */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display border-b-2 border-foreground pb-2 text-xl font-bold tracking-tight">
            Diğer Haberler
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {related.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Tüm haberlere dön
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
