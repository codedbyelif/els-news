-- =====================================================================
--  ELS News — Bildirimler migration'ı
--  Kullanıcıya gelen bildirimleri tutar:
--    - haberine yorum yapıldığında
--    - yorumu beğenildiğinde
--    - yorumuna yanıt verildiğinde
--  Supabase panelinde: SQL Editor → New query → yapıştır → Run
-- =====================================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  -- Bildirimi alan (haber/yorum sahibi)
  user_id     uuid not null references public.users (id) on delete cascade,
  -- Eylemi yapan (yorum yazan / beğenen / yanıtlayan)
  actor_id    uuid not null references public.users (id) on delete cascade,
  -- 'comment' | 'like' | 'reply'
  type        text not null,
  -- Tıklayınca gidilecek haber
  article_id  uuid references public.articles (id) on delete cascade,
  article_slug text,
  -- İlgili yorum (varsa)
  comment_id  uuid references public.comments (id) on delete cascade,
  -- Yorum/yanıt metninden kısa önizleme
  preview     text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where is_read = false;

alter table public.notifications enable row level security;
