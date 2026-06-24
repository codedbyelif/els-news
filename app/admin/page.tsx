import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, MessageCircle, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminStats,
  getAllArticles,
  getAllComments,
  getAllUsers,
} from "@/lib/admin-queries";
import { AdminArticles } from "@/app/admin/_components/admin-articles";
import { AdminComments } from "@/app/admin/_components/admin-comments";
import { AdminUsers } from "@/app/admin/_components/admin-users";

export const metadata: Metadata = { title: "Yönetim Paneli" };

type Tab = "articles" | "comments" | "users";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/admin");
  if (!user.is_admin) redirect("/");

  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "comments" || tabParam === "users" ? tabParam : "articles";

  const stats = await getAdminStats();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-b-2 border-foreground pb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Yönetim
        </span>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
          Yönetim Paneli
        </h1>
      </header>

      {/* İstatistikler */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Haber" value={stats.articles} />
        <StatCard icon={<MessageCircle className="h-5 w-5" />} label="Yorum" value={stats.comments} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Kullanıcı" value={stats.users} />
      </div>

      {/* Sekmeler */}
      <nav className="mt-8 flex gap-1 border-b border-border">
        <TabLink href="/admin?tab=articles" active={tab === "articles"} label="Haberler" />
        <TabLink href="/admin?tab=comments" active={tab === "comments"} label="Yorumlar" />
        <TabLink href="/admin?tab=users" active={tab === "users"} label="Kullanıcılar" />
      </nav>

      <div className="mt-6">
        {tab === "articles" && <AdminArticles articles={await getAllArticles()} />}
        {tab === "comments" && <AdminComments comments={await getAllComments()} />}
        {tab === "users" && <AdminUsers users={await getAllUsers()} currentUserId={user.id} />}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
