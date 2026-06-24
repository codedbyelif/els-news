"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CommentWithAuthor } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import { adminDeleteCommentAction } from "@/app/actions/admin";

type Row = CommentWithAuthor & { article?: { slug: string; title: string } | null };

export function AdminComments({ comments }: { comments: Row[] }) {
  if (comments.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">Henüz yorum yok.</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li
          key={c.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
        >
          <Avatar name={c.author.display_name} src={c.author.avatar_url} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-semibold">{c.author.display_name}</span>
              <span className="text-xs text-muted-foreground">@{c.author.username}</span>
              <span className="text-xs text-muted-foreground">· {timeAgo(c.created_at)}</span>
            </div>
            {c.body && <p className="mt-1 line-clamp-3 text-sm text-foreground">{c.body}</p>}
            {c.image_url && (
              <span className="mt-1 inline-block text-xs text-muted-foreground">[fotoğraf]</span>
            )}
            {c.article && (
              <Link
                href={`/haber/${c.article.slug}`}
                className="mt-1 block truncate text-xs text-primary hover:underline"
              >
                Haber: {c.article.title}
              </Link>
            )}
          </div>
          <form
            action={adminDeleteCommentAction}
            onSubmit={(e) => {
              if (!confirm("Bu yorumu silmek istediğine emin misin?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              aria-label="Yorumu sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
