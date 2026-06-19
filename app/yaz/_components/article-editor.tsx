"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye } from "lucide-react";
import {
  publishArticleAction,
  type ArticleFormState,
} from "@/app/actions/articles";
import { CoverUploader } from "@/app/yaz/_components/cover-uploader";
import { RichEditor } from "@/app/yaz/_components/rich-editor";

export function ArticleEditor() {
  const [state, formAction, pending] = useActionState<ArticleFormState, FormData>(
    publishArticleAction,
    {}
  );
  const v = state.values;
  const [cover, setCover] = useState(v?.cover_image_url ?? "");
  const [bodyHtml, setBodyHtml] = useState(v?.body ?? "");

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Kapak görseli — dosya / sürükle / yapıştır */}
      <div>
        <span className="mb-1.5 block text-sm font-medium">
          Kapak görseli{" "}
          <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </span>
        <CoverUploader value={cover} onChange={setCover} />
        <input type="hidden" name="cover_image_url" value={cover} />
      </div>

      {/* Başlık */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Başlık</span>
        <textarea
          name="title"
          rows={2}
          required
          defaultValue={v?.title}
          placeholder="Dikkat çekici bir başlık yaz…"
          className="font-display w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-2xl font-bold leading-snug outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {/* Metin — TipTap zengin editör */}
      <div>
        <span className="mb-1.5 block text-sm font-medium">Haber metni</span>
        <RichEditor onChange={setBodyHtml} />
        <input type="hidden" name="body" value={bodyHtml} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <span className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" /> Yayınlanınca herkes görebilir
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Yayınlanıyor…" : "Yayınla"}
        </button>
      </div>
    </form>
  );
}
