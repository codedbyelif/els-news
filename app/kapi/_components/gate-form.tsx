"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { submitGate, type GateState } from "@/app/actions/gate";

interface PublicQuestion {
  id: string;
  prompt: string;
  hint: string;
}

export function GateForm({ questions }: { questions: PublicQuestion[] }) {
  const [state, formAction, pending] = useActionState<GateState, FormData>(
    submitGate,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((q, i) => (
          <li key={q.id} className="space-y-2">
            <p className="text-lg font-semibold leading-snug text-foreground">
              <span className="text-muted-foreground">{i + 1}.</span> {q.prompt}
            </p>
            <input
              name={q.id}
              type="text"
              autoComplete="off"
              placeholder={q.hint}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-foreground outline-none transition-shadow placeholder:font-mono placeholder:tracking-widest placeholder:text-primary/50 focus:ring-2 focus:ring-ring"
            />
          </li>
        ))}
      </ol>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Kontrol ediliyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
