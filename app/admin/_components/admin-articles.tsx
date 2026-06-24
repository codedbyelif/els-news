"use client";

import Link from "next/link";
import { Star, Trash2, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  adminDeleteArticleAction,
  adminToggleFeaturedAction,
} from "@/app/actions/admin";

export function AdminArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">Henüz haber yok.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Başlık</th>
            <th className="py-2 pr-4 font-medium">Tarih</th>
            <th className="py-2 pr-4 text-right font-medium">Okunma</th>
            <th className="py-2 pl-4 text-right font-medium">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="border-b border-border/60 align-middle">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {a.featured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />
                  )}
                  <Link
                    href={`/haber/${a.slug}`}
                    className="line-clamp-1 font-medium hover:text-primary"
                  >
                    {a.title}
                  </Link>
                </div>
              </td>
              <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                {formatDate(a.created_at)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                {a.views}
              </td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/haber/${a.slug}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Habere git"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <form action={adminToggleFeaturedAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="featured" value={(!a.featured).toString()} />
                    <button
                      type="submit"
                      className={`rounded-md p-1.5 transition-colors hover:bg-accent ${
                        a.featured ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label={a.featured ? "Manşetten kaldır" : "Manşet yap"}
                      title={a.featured ? "Manşetten kaldır" : "Manşet yap"}
                    >
                      <Star className={`h-4 w-4 ${a.featured ? "fill-current" : ""}`} />
                    </button>
                  </form>
                  <form
                    action={adminDeleteArticleAction}
                    onSubmit={(e) => {
                      if (!confirm("Bu haberi silmek istediğine emin misin?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
