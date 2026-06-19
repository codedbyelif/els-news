import Link from "next/link";
import Image from "next/image";
import { Eye, MessageCircle, PenLine } from "lucide-react";
import {
  getFeaturedArticle,
  getLatestArticles,
  getMostReadArticles,
} from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { timeAgo } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import { EmptyState } from "@/components/empty-state";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const [featured, latest, mostRead] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(13),
    getMostReadArticles(5),
  ]);

  if (!featured) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Henüz haber yok"
          description="İlk haberi sen yayınla — ELS News'in açılış manşeti senin olsun."
          actionLabel="İlk haberi yayınla"
          actionHref="/yaz"
        />
      </main>
    );
  }

  // Manşet, ana akışta tekrar etmesin.
  const rest = latest.filter((a) => a.id !== featured.id).slice(0, 9);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* MANŞET + EN ÇOK OKUNAN */}
      <section className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
        {/* Manşet */}
        <article className="group animate-fade-up">
          <Link
            href={`/haber/${featured.slug}`}
            className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-muted"
          >
            {featured.cover_image_url ? (
              <Image
                src={featured.cover_image_url}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-accent">
                <span className="font-display text-5xl font-black text-muted-foreground/30">
                  ELS
                </span>
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              Manşet
            </span>
          </Link>

          <div className="mt-4">
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl">
              <Link href={`/haber/${featured.slug}`} className="hover:text-primary">
                {featured.title}
              </Link>
            </h1>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={featured.created_at}>{timeAgo(featured.created_at)}</time>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {featured.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> {featured.comment_count}
              </span>
            </div>
          </div>
        </article>

        {/* En çok okunan */}
        <aside className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest">En Çok Okunan</h2>
          </div>
          <ol className="mt-3 divide-y divide-border">
            {mostRead.map((a, i) => (
              <li key={a.id} className="flex gap-3 py-3">
                <span className="font-display text-2xl font-black leading-none text-primary/70">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[0.95rem] font-semibold leading-snug">
                    <Link href={`/haber/${a.slug}`} className="hover:text-primary">
                      <span className="line-clamp-2">{a.title}</span>
                    </Link>
                  </h3>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {timeAgo(a.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      {/* SON HABERLER */}
      <section className="mt-14">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
          <h2 className="font-display text-2xl font-bold tracking-tight">Son Haberler</h2>
        </div>

        {rest.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            Şimdilik tek haber var. Yenilerini sen ekle!
          </p>
        ) : (
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a, i) => (
              <div
                key={a.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mt-16 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-start gap-4 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Gündemi sen belirle
            </h2>
            <p className="mt-1 text-muted-foreground">
              Bir haberin mi var? Saniyeler içinde yayınla, herkes okusun.
            </p>
          </div>
          <Link
            href="/yaz"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" /> Haber Yayınla
          </Link>
        </div>
      </section>
    </main>
  );
}
