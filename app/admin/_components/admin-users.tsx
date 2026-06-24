"use client";

import { Shield, ShieldOff, Trash2 } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { formatDate } from "@/lib/utils";
import { adminToggleAdminAction, adminDeleteUserAction } from "@/app/actions/admin";

export function AdminUsers({
  users,
  currentUserId,
}: {
  users: PublicUser[];
  currentUserId: string;
}) {
  if (users.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">Henüz kullanıcı yok.</p>;
  }

  return (
    <ul className="space-y-3">
      {users.map((u) => {
        const isMe = u.id === currentUserId;
        return (
          <li
            key={u.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <Avatar name={u.display_name} src={u.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <span className="font-semibold">{u.display_name}</span>
                <span className="text-xs text-muted-foreground">@{u.username}</span>
                {u.is_admin && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                    Yönetici
                  </span>
                )}
                {isMe && <span className="text-xs text-muted-foreground">(sen)</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                Katılma: {formatDate(u.created_at)}
              </p>
            </div>

            {!isMe && (
              <div className="flex items-center gap-1">
                <form action={adminToggleAdminAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="make_admin" value={(!u.is_admin).toString()} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title={u.is_admin ? "Yöneticiliği kaldır" : "Yönetici yap"}
                  >
                    {u.is_admin ? (
                      <ShieldOff className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {u.is_admin ? "Yöneticiliği al" : "Yönetici yap"}
                    </span>
                  </button>
                </form>
                <form
                  action={adminDeleteUserAction}
                  onSubmit={(e) => {
                    if (
                      !confirm(
                        `@${u.username} kullanıcısını ve tüm haber/yorumlarını silmek istediğine emin misin?`
                      )
                    )
                      e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={u.id} />
                  <button
                    type="submit"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                    aria-label="Kullanıcıyı sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
