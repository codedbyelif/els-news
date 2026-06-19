import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/app/(auth)/_components/auth-form";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Tekrar hoş geldin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Haber yayınlamak ve yorum yapmak için giriş yap.
      </p>
      <div className="mt-6">
        <AuthForm mode="login" action={loginAction} />
      </div>
    </>
  );
}
