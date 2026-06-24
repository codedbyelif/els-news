"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

/** Kullanıcının tüm bildirimlerini okundu işaretler. */
export async function markAllReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  revalidatePath("/bildirimler");
}

/** Tek bir bildirimi okundu işaretler. */
export async function markReadAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !id) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);
}
