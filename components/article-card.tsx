import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Eye } from "lucide-react";
import type { ArticleListItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface ArticleCardProps {
  article: ArticleListItem;
  /** Görsel oranı / boyutu için varyant. */
  variant?: "default" | "compact" | "horizontal";
  priority?: boolean;
}

/**
 * Haber kartı. DİKKAT: Haberlerde yazar bilgisi GÖSTERİLMEZ — sadece
 * başlık, görsel, tarih ve istatistikler. (Haberler anonim.)
 */
export function ArticleCard({ article, variant = "default", priority }: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4">
        <Link
          href={`/haber/${article.slug}`}
          className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-36"
        >
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <NoImage />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold leading-snug">
            <Link href={`/haber/${article.slug}`} className="hover:text-primary">
              <span className="line-clamp-3">{article.title}</span>
            </Link>
          </h3>
          <Meta article={article} className="mt-2" />
        </div>
      </article>
    );
  }

  const aspect = variant === "compact" ? "aspect-[16/10]" : "aspect-[3/2]";

  return (
    <article className="group flex flex-col">
      <Link
        href={`/haber/${article.slug}`}
        className={`relative ${aspect} overflow-hidden rounded-lg bg-muted`}
      >
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <NoImage />
        )}
      </Link>

      <div className="mt-3 flex flex-col">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/haber/${article.slug}`} className="hover:text-primary">
            <span className="line-clamp-3">{article.title}</span>
          </Link>
        </h3>
        <Meta article={article} className="mt-3" />
      </div>
    </article>
  );
}

function Meta({
  article,
  className,
}: {
  article: ArticleListItem;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-xs text-muted-foreground ${className ?? ""}`}
    >
      <time dateTime={article.created_at}>{timeAgo(article.created_at)}</time>
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {article.views}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {article.comment_count}
      </span>
    </div>
  );
}

function NoImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-accent">
      <span className="font-display text-2xl font-black tracking-tight text-muted-foreground/40">
        ELS
      </span>
    </div>
  );
}
