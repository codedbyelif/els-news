import { Database, Terminal } from "lucide-react";

/** Supabase yapılandırılmadığında gösterilen kurulum kartı. */
export function SetupNotice() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="inline-flex rounded-full bg-primary/10 p-3 text-primary">
          <Database className="h-6 w-6" />
        </div>
        <h1 className="font-display mt-4 text-2xl font-bold tracking-tight">
          Son bir adım: Supabase'i bağla
        </h1>
        <p className="mt-2 text-muted-foreground">
          ELS News hazır, sadece veritabanı bağlantısı eksik. Aşağıdaki adımları
          izle, site çalışsın:
        </p>

        <ol className="mt-6 space-y-4 text-sm">
          <Step n={1}>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              supabase.com
            </a>{" "}
            üzerinde ücretsiz bir proje oluştur.
          </Step>
          <Step n={2}>
            Supabase panelinde <strong>SQL Editor</strong>'ı aç, projedeki{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              supabase/schema.sql
            </code>{" "}
            dosyasının içeriğini yapıştırıp çalıştır.
          </Step>
          <Step n={3}>
            Panelde <strong>Project Settings → API</strong> bölümünden{" "}
            <em>Project URL</em> ve <em>service_role</em> anahtarını kopyala.
          </Step>
          <Step n={4}>
            Proje kökünde{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              .env.local
            </code>{" "}
            dosyası oluştur ve şunları yaz:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-foreground p-4 text-xs leading-relaxed text-background">
              <code>{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SESSION_SECRET=uzun-rastgele-bir-metin`}</code>
            </pre>
          </Step>
          <Step n={5}>
            <span className="inline-flex items-center gap-1.5">
              <Terminal className="h-4 w-4" /> Sunucuyu yeniden başlat:
            </span>{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              bun dev
            </code>
          </Step>
        </ol>
      </div>
    </main>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <div className="pt-0.5 text-foreground">{children}</div>
    </li>
  );
}
