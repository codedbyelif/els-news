"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { AuthState } from "@/app/actions/auth";

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

interface AuthFormProps {
  mode: "login" | "register";
  action: Action;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {}
  );
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Field
        label="Kullanıcı adı"
        name="username"
        autoComplete="username"
        placeholder="kullaniciadi"
        autoFocus
      />

      {isRegister && (
        <Field
          label="Görünen ad"
          name="display_name"
          autoComplete="name"
          placeholder="Adın nasıl görünsün?"
        />
      )}

      <Field
        label="Şifre"
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending
          ? "Lütfen bekleyin…"
          : isRegister
            ? "Hesap Oluştur"
            : "Giriş Yap"}
      </button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        {isRegister ? (
          <>
            Zaten hesabın var mı?{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </>
        ) : (
          <>
            Hesabın yok mu?{" "}
            <Link href="/kayit" className="font-medium text-primary hover:underline">
              Kayıt ol
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring"
        {...rest}
      />
    </label>
  );
}
