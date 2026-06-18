"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createSession, destroySession } from "@/lib/auth";

export interface AuthState {
  error?: string;
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_RE.test(username)) {
    return {
      error: "Kullanıcı adı 3-20 karakter olmalı; harf, rakam ve _ içerebilir.",
    };
  }
  if (displayName.length < 2 || displayName.length > 40) {
    return { error: "Görünen ad 2-40 karakter olmalı." };
  }
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalı." };
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  if (existing) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ username, display_name: displayName, password_hash })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Kayıt sırasında bir hata oluştu. Tekrar deneyin." };
  }

  await createSession(data.id);
  redirect("/");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Kullanıcı adı ve şifre gerekli." };
  }

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("id, password_hash")
    .ilike("username", username)
    .maybeSingle();

  // Kullanıcı yoksa bile sahte bir hash ile karşılaştırıp zamanlama farkını gizle.
  const hash = user?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) {
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
