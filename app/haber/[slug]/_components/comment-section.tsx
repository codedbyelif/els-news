"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";
import type { CommentWithAuthor, PublicUser } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import { addCommentAction, deleteCommentAction, type CommentState } from "@/app/actions/comments";

interface Props {
  articleId: string;
  slug: string;
  comments: CommentWithAuthor[];
  currentUser: PublicUser | null;
}

export function CommentSection({ articleId, slug, comments, currentUser }: Props) {
  return (
    <section id="yorumlar" className="mt-16">
      <h2 className="font-display flex items-center gap-2 border-b-2 border-foreground pb-2 text-xl font-bold tracking-tight">
        <MessageCircle className="h-5 w-5" />
        Yorumlar
        <span className="text-muted-foreground">({comments.length})</span>
      </h2>

      {currentUser ? (
        <CommentForm articleId={articleId} slug={slug} user={currentUser} />
      ) : (
        <p className="mt-6 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          Yorum yapmak için{" "}
          <Link href="/giris" className="font-medium text-primary hover:underline">
            giriş yap
          </Link>{" "}
          ya da{" "}
          <Link href="/kayit" className="font-medium text-primary hover:underline">
            kayıt ol
          </Link>
          .
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {comments.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            Henüz yorum yok. İlk yorumu sen yap!
          </li>
        )}
        {comments.map((c) => {
          const canDelete =
            currentUser && (currentUser.id === c.author_id || currentUser.is_admin);
          return (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.author.display_name} src={c.author.avatar_url} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {c.author.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{c.author.username}
                  </span>
                  {c.author.is_admin && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                      Editör
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    · {timeAgo(c.created_at)}
                  </span>
                  {canDelete && (
                    <form action={deleteCommentAction} className="ml-auto">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                        aria-label="Yorumu sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CommentForm({
  articleId,
  slug,
  user,
}: {
  articleId: string;
  slug: string;
  user: PublicUser;
}) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addCommentAction,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 flex gap-3">
      <Avatar name={user.display_name} src={user.avatar_url} size={40} />
      <div className="flex-1">
        <input type="hidden" name="article_id" value={articleId} />
        <input type="hidden" name="slug" value={slug} />
        <textarea
          name="body"
          rows={3}
          required
          maxLength={1500}
          placeholder="Düşüncelerini paylaş…"
          className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring"
        />
        {state.error && (
          <p className="mt-1.5 text-sm text-destructive">{state.error}</p>
        )}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? "Gönderiliyor…" : "Yorum Yap"}
          </button>
        </div>
      </div>
    </form>
  );
}
