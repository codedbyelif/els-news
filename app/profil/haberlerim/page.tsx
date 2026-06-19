import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getArticlesByAuthor } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Haberlerim" };

export default async function MyArticlesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/profil/haberlerim");

  const articles = await getArticlesByAuthor(user.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between border-b-2 border-foreground pb-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Haberlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yayınladığın {articles.length} haber. (Sitede yazar adın görünmez.)
          </p>
        </div>
        <Link
          href="/yaz"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PenLine className="h-4 w-4" /> Yeni Haber
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Henüz haber yayınlamadın"
            description="İlk haberini yayınla, gündeme sen yön ver."
            actionLabel="Haber yayınla"
            actionHref="/yaz"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </main>
  );
}
