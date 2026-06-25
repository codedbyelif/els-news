import type { Metadata } from "next";
import { getPublicQuestions, REQUIRED_CORRECT } from "@/lib/gate";
import { GateForm } from "./_components/gate-form";

export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: false },
};

export default async function GatePage() {
  const questions = await getPublicQuestions();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <span className="inline-flex items-baseline gap-0.5">
            <span className="font-display text-4xl font-black tracking-tight">ELS</span>
            <span className="font-display text-4xl font-black tracking-tight text-primary">
              News
            </span>
          </span>
          <p className="mt-3 text-lg text-muted-foreground">
            Girmek için aşağıdaki sorulardan en az{" "}
            <span className="font-semibold text-foreground">{REQUIRED_CORRECT} tanesini</span>{" "}
            doğru cevapla.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <GateForm questions={questions} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          İpucu: yıldızlar cevaptaki harf sayısını gösterir.
        </p>
      </div>
    </main>
  );
}
