import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/app/(auth)/_components/auth-form";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">Aramıza katıl</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        E-posta yok — sadece kullanıcı adı ve şifre. Saniyeler içinde başla.
      </p>
      <div className="mt-6">
        <AuthForm mode="register" action={registerAction} />
      </div>
    </>
  );
}
