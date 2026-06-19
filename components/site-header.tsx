import Link from "next/link";
import { PenLine } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { HeaderActions } from "@/components/header-actions";

export function SiteHeader({ user }: { user: PublicUser | null }) {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      {/* Üst şerit: tarih + giriş/profil */}
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground sm:px-6">
          <span className="hidden capitalize sm:block">{today}</span>
          <span className="font-semibold text-primary sm:hidden">ELS NEWS</span>
          <HeaderActions user={user} />
        </div>
      </div>

      {/* Logo + yaz butonu */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group inline-flex items-baseline gap-0.5">
          <span className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            ELS
          </span>
          <span className="font-display text-3xl font-black tracking-tight text-primary sm:text-4xl">
            News
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:block"
          >
            Anasayfa
          </Link>
          <Link
            href="/yaz"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" />
            <span className="hidden sm:inline">Haber Yayınla</span>
            <span className="sm:hidden">Yayınla</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
