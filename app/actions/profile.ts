"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/auth";

export interface ProfileState {
  error?: string;
  ok?: boolean;
}

function isHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const avatar = String(formData.get("avatar_url") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (displayName.length < 2 || displayName.length > 40) {
    return { error: "Görünen ad 2-40 karakter olmalı." };
  }
  if (!isHttpUrl(avatar)) {
    return { error: "Profil fotoğrafı linki geçerli bir http(s) adresi olmalı." };
  }
  if (bio.length > 280) {
    return { error: "Hakkında metni en fazla 280 karakter olabilir." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("users")
    .update({
      display_name: displayName,
      avatar_url: avatar || null,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Profil güncellenemedi." };

  revalidatePath("/profil");
  return { ok: true };
}
