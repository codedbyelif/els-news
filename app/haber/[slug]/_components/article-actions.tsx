"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteArticleAction } from "@/app/actions/articles";

export function ArticleActions({ articleId }: { articleId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" /> Sil
      </button>
    );
  }

  return (
    <form action={deleteArticleAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={articleId} />
      <span className="text-xs text-muted-foreground">Emin misin?</span>
      <button
        type="submit"
        className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground hover:opacity-90"
      >
        Evet, sil
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
      >
        Vazgeç
      </button>
    </form>
  );
}
