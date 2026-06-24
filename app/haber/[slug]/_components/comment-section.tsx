"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Trash2, Heart, Reply, ImagePlus, X, Loader2 } from "lucide-react";
import type { CommentWithAuthor, PublicUser } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import {
  addCommentAction,
  deleteCommentAction,
  toggleCommentLikeAction,
  type CommentState,
} from "@/app/actions/comments";
import { uploadImageAction } from "@/app/actions/upload";

interface Props {
  articleId: string;
  slug: string;
  comments: CommentWithAuthor[];
  currentUser: PublicUser | null;
}

function totalCount(comments: CommentWithAuthor[]): number {
  return comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
}

export function CommentSection({ articleId, slug, comments, currentUser }: Props) {
  return (
    <section id="yorumlar" className="mt-16">
      <h2 className="font-display flex items-center gap-2 border-b-2 border-foreground pb-2 text-xl font-bold tracking-tight">
        <MessageCircle className="h-5 w-5" />
        Yorumlar
        <span className="text-muted-foreground">({totalCount(comments)})</span>
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
        {comments.map((c) => (
          <li key={c.id}>
            <CommentItem
              comment={c}
              articleId={articleId}
              slug={slug}
              currentUser={currentUser}
            />
            {c.replies && c.replies.length > 0 && (
              <ul className="mt-4 space-y-4 border-l-2 border-border pl-4 sm:ml-12 sm:pl-5">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <CommentItem
                      comment={r}
                      articleId={articleId}
                      slug={slug}
                      currentUser={currentUser}
                      isReply
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommentItem({
  comment: c,
  articleId,
  slug,
  currentUser,
  isReply,
}: {
  comment: CommentWithAuthor;
  articleId: string;
  slug: string;
  currentUser: PublicUser | null;
  isReply?: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const canDelete =
    currentUser && (currentUser.id === c.author_id || currentUser.is_admin);
  const size = isReply ? 32 : 40;

  return (
    <div className="flex gap-3">
      <Avatar name={c.author.display_name} src={c.author.avatar_url} size={size} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{c.author.display_name}</span>
          <span className="text-xs text-muted-foreground">@{c.author.username}</span>
          <span className="text-xs text-muted-foreground">· {timeAgo(c.created_at)}</span>
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

        {c.body && (
          <p className="mt-1 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">
            {c.body}
          </p>
        )}

        {c.image_url && (
          <div className="relative mt-2 max-w-sm overflow-hidden rounded-lg border border-border">
            <Image
              src={c.image_url}
              alt="Yorum görseli"
              width={400}
              height={300}
              className="h-auto w-full object-cover"
              sizes="384px"
            />
          </div>
        )}

        {/* Beğen + Yanıtla */}
        <div className="mt-2 flex items-center gap-4 text-xs">
          {currentUser ? (
            <form action={toggleCommentLikeAction}>
              <input type="hidden" name="comment_id" value={c.id} />
              <input type="hidden" name="slug" value={slug} />
              <button
                type="submit"
                className={`inline-flex items-center gap-1 transition-colors ${
                  c.liked_by_me
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={c.liked_by_me ? "Beğeniyi geri al" : "Beğen"}
              >
                <Heart className={`h-4 w-4 ${c.liked_by_me ? "fill-current" : ""}`} />
                {c.like_count > 0 && <span>{c.like_count}</span>}
              </button>
            </form>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4" />
              {c.like_count > 0 && <span>{c.like_count}</span>}
            </span>
          )}

          {currentUser && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Reply className="h-4 w-4" /> Yanıtla
            </button>
          )}
        </div>

        {replying && currentUser && (
          <div className="mt-3">
            <CommentForm
              articleId={articleId}
              slug={slug}
              user={currentUser}
              parentId={c.id}
              compact
              onDone={() => setReplying(false)}
              placeholder={`@${c.author.username} kullanıcısına yanıt yaz…`}
              defaultBody={isReply ? `@${c.author.username} ` : ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CommentForm({
  articleId,
  slug,
  user,
  parentId,
  compact,
  onDone,
  placeholder = "Düşüncelerini paylaş…",
  defaultBody = "",
}: {
  articleId: string;
  slug: string;
  user: PublicUser;
  parentId?: string;
  compact?: boolean;
  onDone?: () => void;
  placeholder?: string;
  defaultBody?: string;
}) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addCommentAction,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setImage("");
      onDone?.();
    }
  }, [state.ok, onDone]);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadImageAction(fd);
      if (res.error || !res.url) {
        alert(res.error ?? "Görsel yüklenemedi.");
        return;
      }
      setImage(res.url);
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <form ref={formRef} action={formAction} className={`flex gap-3 ${compact ? "" : "mt-6"}`}>
      <Avatar name={user.display_name} src={user.avatar_url} size={compact ? 32 : 40} />
      <div className="flex-1">
        <input type="hidden" name="article_id" value={articleId} />
        <input type="hidden" name="slug" value={slug} />
        {parentId && <input type="hidden" name="parent_id" value={parentId} />}
        <input type="hidden" name="image_url" value={image} />

        <textarea
          name="body"
          rows={compact ? 2 : 3}
          placeholder={placeholder}
          defaultValue={defaultBody}
          onPaste={(e) => {
            const item = Array.from(e.clipboardData.items).find((i) =>
              i.type.startsWith("image/")
            );
            const f = item?.getAsFile();
            if (f) {
              e.preventDefault();
              handleFile(f);
            }
          }}
          className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring"
        />

        {image && (
          <div className="relative mt-2 inline-block">
            <Image
              src={image}
              alt="Eklenecek görsel"
              width={140}
              height={105}
              className="h-auto w-32 rounded-lg border border-border object-cover"
              sizes="128px"
            />
            <button
              type="button"
              onClick={() => setImage("")}
              className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"
              aria-label="Görseli kaldır"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {state.error && <p className="mt-1.5 text-sm text-destructive">{state.error}</p>}

        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Fotoğraf ekle
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) handleFile(f);
            }}
          />

          <div className="flex items-center gap-2">
            {compact && onDone && (
              <button
                type="button"
                onClick={onDone}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
              >
                Vazgeç
              </button>
            )}
            <button
              type="submit"
              disabled={pending || uploading}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? "Gönderiliyor…" : parentId ? "Yanıtla" : "Yorum Yap"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
