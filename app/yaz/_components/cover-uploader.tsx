"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImageAction } from "@/app/actions/upload";

interface CoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverUploader({ value, onChange }: CoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImageAction(fd);
        if (res.error || !res.url) {
          alert(res.error ?? "Görsel yüklenemedi.");
          return;
        }
        onChange(res.url);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((i) =>
        i.type.startsWith("image/")
      );
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        handleFile(file);
      }
    },
    [handleFile]
  );

  if (value) {
    return (
      <div className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted">
        <Image src={value} alt="Kapak görseli" fill className="object-cover" sizes="640px" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-foreground/80 px-3 py-1.5 text-xs font-medium text-background backdrop-blur transition-opacity hover:bg-foreground"
        >
          <X className="h-3.5 w-3.5" /> Kaldır
        </button>
      </div>
    );
  }

  return (
    <div
      onPaste={onPaste}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) handleFile(file);
      }}
      className={`flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-card text-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
    >
      {uploading ? (
        <>
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Yükleniyor…</span>
        </>
      ) : (
        <>
          <div className="rounded-full bg-muted p-3">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Kapak görseli yükle
          </span>
          <span className="text-xs text-muted-foreground">
            Tıkla & seç, sürükle-bırak ya da panodan yapıştır
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
