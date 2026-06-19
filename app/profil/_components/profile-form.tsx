"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { updateProfileAction, type ProfileState } from "@/app/actions/profile";

interface Props {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function ProfileForm({ username, displayName, avatarUrl, bio }: Props) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );
  const [avatar, setAvatar] = useState(avatarUrl ?? "");
  const [name, setName] = useState(displayName);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-600/5 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Profil güncellendi.
        </div>
      )}

      <div className="flex items-center gap-4">
        <Avatar name={name || username} src={avatar || null} size={72} />
        <div>
          <p className="font-semibold">@{username}</p>
          <p className="text-sm text-muted-foreground">
            Kullanıcı adın değiştirilemez.
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Görünen ad</span>
        <input
          name="display_name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">
          Profil fotoğrafı linki{" "}
          <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </span>
        <input
          name="avatar_url"
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://… fotoğrafının adresini yapıştır"
          className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Hakkında</span>
        <textarea
          name="bio"
          rows={3}
          defaultValue={bio ?? ""}
          maxLength={280}
          placeholder="Kendinden kısaca bahset…"
          className="w-full resize-none rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="flex justify-end border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
