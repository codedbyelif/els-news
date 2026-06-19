import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-baseline gap-0.5">
          <span className="font-display text-3xl font-black tracking-tight">ELS</span>
          <span className="font-display text-3xl font-black tracking-tight text-primary">
            News
          </span>
        </Link>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        {children}
      </div>
    </main>
  );
}
