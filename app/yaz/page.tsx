import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ArticleEditor } from "@/app/yaz/_components/article-editor";

export const metadata: Metadata = { title: "Haber Yayınla" };

export default async function PublishPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/yaz");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Haber Yayınla</h1>
        <p className="mt-1 text-muted-foreground">
          Haberin anında yayına girer. Yayınlandığında kim yazdığı görünmez —
          haberler ELS News'te anonim yayınlanır.
        </p>
      </div>
      <ArticleEditor />
    </main>
  );
}
