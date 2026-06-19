"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { uploadImageAction } from "@/app/actions/upload";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  /** Gizli input'a yazılacak HTML'i güncelleyen callback. */
  onChange: (html: string) => void;
}

export function RichEditor({ onChange }: RichEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImageAction(fd);
        if (res.error || !res.url) {
          alert(res.error ?? "Görsel yüklenemedi.");
          return null;
        }
        return res.url;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", class: "text-primary underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg my-4 w-full" },
      }),
      Placeholder.configure({
        placeholder: "Haberini buraya yaz… Görselleri metnin içine sürükle veya yapıştır.",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[320px] w-full px-4 py-3 outline-none focus:outline-none",
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              upload(file).then((url) => {
                if (url) editor?.chain().focus().setImage({ src: url }).run();
              });
              return true;
            }
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith("image/")) {
          event.preventDefault();
          upload(files[0]).then((url) => {
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          });
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const onPickImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      const url = await upload(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
    [editor, upload]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Bağlantı adresi:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        Editör yükleniyor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/50 px-2 py-1.5">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Kalın">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="İtalik">
          <Italic className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Başlık">
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Alt başlık">
          <Heading3 className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Madde listesi">
          <List className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numaralı liste">
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Alıntı">
          <Quote className="h-4 w-4" />
        </Btn>
        <Sep />
        <Btn onClick={setLink} active={editor.isActive("link")} label="Bağlantı">
          <Link2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => fileInputRef.current?.click()} label="Görsel ekle" disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()} label="Geri al" disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} label="İleri al" disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </Btn>
      </div>

      <EditorContent editor={editor} />

      <p className="border-t border-border bg-secondary/30 px-4 py-1.5 text-xs text-muted-foreground">
        💡 Görseli metnin içine sürükle-bırak veya doğrudan yapıştır (Ctrl/⌘+V).
      </p>
    </div>
  );
}

function Btn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
