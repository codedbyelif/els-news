"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User as UserIcon, LogOut, FileText, ChevronDown } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { logoutAction } from "@/app/actions/auth";

export function HeaderActions({ user }: { user: PublicUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) {
      router.push(`/ara?q=${encodeURIComponent(term)}`);
      setSearchOpen(false);
      setQ("");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {searchOpen ? (
        <form onSubmit={submitSearch} className="flex items-center">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => !q && setSearchOpen(false)}
            placeholder="Haber ara…"
            className="h-7 w-40 rounded-full border border-border bg-card px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring sm:w-56"
          />
        </form>
      ) : (
        <button
          onClick={() => setSearchOpen(true)}
          className="inline-flex items-center gap-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Ara"
        >
          <Search className="h-4 w-4" />
        </button>
      )}

      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1.5 transition-colors hover:bg-accent"
          >
            <Avatar name={user.display_name} src={user.avatar_url} size={24} />
            <span className="hidden max-w-24 truncate font-medium text-foreground sm:inline">
              {user.display_name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
              <Link
                href="/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
              >
                <UserIcon className="h-4 w-4" /> Profilim
              </Link>
              <Link
                href="/profil/haberlerim"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
              >
                <FileText className="h-4 w-4" /> Haberlerim
              </Link>
              {user.is_admin && (
                <span className="block px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                  Admin
                </span>
              )}
              <form action={logoutAction} className="border-t border-border">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" /> Çıkış Yap
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Link
            href="/giris"
            className="rounded-full px-3 py-1 font-medium text-foreground transition-colors hover:bg-accent"
          >
            Giriş
          </Link>
          <Link
            href="/kayit"
            className="rounded-full bg-foreground px-3 py-1 font-medium text-background transition-opacity hover:opacity-90"
          >
            Kayıt Ol
          </Link>
        </div>
      )}
    </div>
  );
}
