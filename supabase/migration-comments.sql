-- =====================================================================
--  ELS News — Yorum geliştirmeleri migration'ı
--  Yorumlara: fotoğraf, beğeni ve tek seviye yanıt ekler.
--  Supabase panelinde: SQL Editor → New query → bu dosyayı yapıştır → Run
-- =====================================================================

-- 1) Yoruma fotoğraf ve yanıt (parent) desteği
alter table public.comments
  add column if not exists image_url text,
  add column if not exists parent_id uuid references public.comments (id) on delete cascade;

create index if not exists comments_parent_idx on public.comments (parent_id);

-- 2) Yorum beğenileri (her kullanıcı bir yorumu en fazla bir kez beğenir)
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists comment_likes_comment_idx on public.comment_likes (comment_id);

alter table public.comment_likes enable row level security;
