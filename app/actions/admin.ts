"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await requireUser();
  if (!user.is_admin) throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  return user;
}

export async function adminDeleteArticleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminDeleteCommentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("comments").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function adminToggleFeaturedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const makeFeatured = String(formData.get("featured") ?? "") === "true";
  if (!id) return;
  const supabase = getSupabaseAdmin();
  if (makeFeatured) {
    // Tek manşet: önce hepsini kaldır, sonra bunu işaretle.
    await supabase.from("articles").update({ featured: false }).neq("id", id);
    await supabase.from("articles").update({ featured: true }).eq("id", id);
  } else {
    await supabase.from("articles").update({ featured: false }).eq("id", id);
  }
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminToggleAdminAction(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const makeAdmin = String(formData.get("make_admin") ?? "") === "true";
  if (!id) return;
  // Kendini admin'likten düşürmeyi engelle (kilitlenmeyi önler).
  if (id === me.id && !makeAdmin) {
    throw new Error("Kendi yönetici yetkinizi kaldıramazsınız.");
  }
  const supabase = getSupabaseAdmin();
  await supabase.from("users").update({ is_admin: makeAdmin }).eq("id", id);
  revalidatePath("/admin");
}

export async function adminDeleteUserAction(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (id === me.id) {
    throw new Error("Kendi hesabınızı silemezsiniz.");
  }
  const supabase = getSupabaseAdmin();
  // Haberleri ve yorumları (cascade) ile birlikte silinir.
  await supabase.from("users").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}
