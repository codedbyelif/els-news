import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-baseline gap-0.5">
              <span className="font-display text-2xl font-black tracking-tight">ELS</span>
              <span className="font-display text-2xl font-black tracking-tight text-primary">
                News
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Okuyucuların yazdığı bağımsız haber platformu. Gündemi sen belirle —
              haberini yayınla, tartışmaya katıl.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-foreground transition-colors hover:text-primary">
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link href="/yaz" className="text-foreground transition-colors hover:text-primary">
                  Haber Yayınla
                </Link>
              </li>
              <li>
                <Link href="/ara" className="text-foreground transition-colors hover:text-primary">
                  Ara
                </Link>
              </li>
              <li>
                <Link href="/kayit" className="text-foreground transition-colors hover:text-primary">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <a
            href="https://github.com/codedbyelif"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-primary"
          >
            © {year} ELS News
          </a>
          <span>codedbyelif tarafından geliştirildi</span>
        </div>
      </div>
    </footer>
  );
}
