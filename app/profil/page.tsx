import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ProfileForm } from "@/app/profil/_components/profile-form";

export const metadata: Metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/profil");

  // bio alanını ayrıca çek (PublicUser içinde yok).
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("bio")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Profilim</h1>
      <p className="mt-1 text-muted-foreground">
        Görünen adını, profil fotoğrafını ve hakkında bilgini düzenle.
        Bu bilgiler yorumlarında görünür.
      </p>
      <div className="mt-8">
        <ProfileForm
          username={user.username}
          displayName={user.display_name}
          avatarUrl={user.avatar_url}
          bio={data?.bio ?? null}
        />
      </div>
    </main>
  );
}
