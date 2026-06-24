"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Heart, Reply, CheckCheck } from "lucide-react";
import type { AppNotification } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { timeAgo } from "@/lib/utils";
import { markAllReadAction } from "@/app/actions/notifications";

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
}

const VERB: Record<AppNotification["type"], string> = {
  comment: "haberine yorum yaptı",
  like: "yorumunu beğendi",
  reply: "yorumuna yanıt verdi",
};

function Icon({ type }: { type: AppNotification["type"] }) {
  if (type === "like") return <Heart className="h-3.5 w-3.5 text-primary" />;
  if (type === "reply") return <Reply className="h-3.5 w-3.5 text-primary" />;
  return <MessageCircle className="h-3.5 w-3.5 text-primary" />;
}

export function NotificationBell({ notifications, unreadCount }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function openAndMarkRead() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await markAllReadAction();
      router.refresh();
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openAndMarkRead}
        className="relative inline-flex items-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Bildirimler"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-none text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold text-popover-foreground">Bildirimler</span>
            {notifications.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCheck className="h-3.5 w-3.5" /> Okundu
              </span>
            )}
          </div>

          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                Henüz bildirim yok.
              </li>
            )}
            {notifications.map((n) => {
              const href = n.article_slug
                ? `/haber/${n.article_slug}#yorumlar`
                : "/";
              return (
                <li key={n.id} className={n.is_read ? "" : "bg-primary/5"}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-3 py-3 transition-colors hover:bg-accent"
                  >
                    <div className="relative shrink-0">
                      <Avatar name={n.actor.display_name} src={n.actor.avatar_url} size={36} />
                      <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                        <Icon type={n.type} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-popover-foreground">
                        <span className="font-semibold">{n.actor.display_name}</span>{" "}
                        <span className="text-muted-foreground">{VERB[n.type]}</span>
                      </p>
                      {n.preview && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          “{n.preview}”
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
