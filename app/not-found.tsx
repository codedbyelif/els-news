import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="font-display text-7xl font-black text-primary">404</span>
      <h1 className="font-display mt-4 text-2xl font-bold tracking-tight">
        Aradığın sayfa bulunamadı
      </h1>
      <p className="mt-2 text-muted-foreground">
        Bu haber kaldırılmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Anasayfaya dön
      </Link>
    </main>
  );
}
