import type { Metadata } from "next";
import { Search } from "lucide-react";
import { searchArticles } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = { title: "Arama" };

export default async function SearchPage({ searchParams }: PageProps) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchArticles(query) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-b-2 border-foreground pb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
          <Search className="h-3.5 w-3.5" /> Arama
        </span>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
          {query ? `“${query}” için sonuçlar` : "Haber ara"}
        </h1>
        {query && (
          <p className="mt-1 text-sm text-muted-foreground">
            {results.length} sonuç bulundu
          </p>
        )}
      </header>

      {!query ? (
        <p className="mt-10 text-center text-muted-foreground">
          Yukarıdaki arama kutusuna bir kelime yazıp ara.
        </p>
      ) : results.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Sonuç bulunamadı"
            description={`“${query}” ile eşleşen bir haber yok. Farklı bir kelime dene.`}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </main>
  );
}
