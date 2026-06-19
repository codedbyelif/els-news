-- =====================================================================
--  ELS News — Veritabanı Şeması
--  Supabase panelinde:  SQL Editor  →  New query  →  bu dosyayı yapıştır → Run
-- =====================================================================

-- UUID üretimi için
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Kullanıcılar (kendi auth sistemimiz — Supabase Auth KULLANMIYORUZ)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  display_name  text not null,
  avatar_url    text,
  bio           text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists users_username_idx on public.users (lower(username));

-- ---------------------------------------------------------------------
-- Haberler  (yazar tutulur ama sitede GÖSTERİLMEZ — haberler anonim)
-- ---------------------------------------------------------------------
create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  body            text not null,          -- TipTap'ten gelen HTML
  cover_image_url text,
  featured        boolean not null default false,
  views           integer not null default 0,
  author_id       uuid not null references public.users (id) on delete cascade,
  created_at      timestamptz not null default now()
);

create index if not exists articles_created_idx  on public.articles (created_at desc);
create index if not exists articles_author_idx   on public.articles (author_id);
create index if not exists articles_featured_idx on public.articles (featured) where featured = true;

-- ---------------------------------------------------------------------
-- Yorumlar  (yazar GÖRÜNÜR — profil fotoğrafı + isim)
-- ---------------------------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.articles (id) on delete cascade,
  author_id   uuid not null references public.users (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists comments_article_idx on public.comments (article_id, created_at desc);

-- ---------------------------------------------------------------------
-- Okunma sayacını atomik artırmak için RPC
-- ---------------------------------------------------------------------
create or replace function public.increment_article_views(article_id uuid)
returns void
language sql
as $$
  update public.articles set views = views + 1 where id = article_id;
$$;

-- ---------------------------------------------------------------------
-- RLS: Tüm erişim service-role anahtarıyla, sunucudaki Server Action'lar
-- üzerinden yapıldığı için RLS'i etkin tutup hiçbir public policy
-- tanımlamıyoruz. Böylece anon/public anahtarla doğrudan erişim engellenir.
-- ---------------------------------------------------------------------
alter table public.users    enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;

-- ---------------------------------------------------------------------
-- STORAGE: Görseller (kapak + editör içi + profil fotoğrafı) için bucket.
-- Panelde Storage → New bucket → ad: "els-media", Public: AÇIK olarak da
-- oluşturabilirsin. Aşağıdaki SQL aynısını yapar:
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'els-media', 'els-media', true, 10485760,
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/avif']
)
on conflict (id) do nothing;

-- =====================================================================
--  (İsteğe bağlı) İlk admin kullanıcısını oluşturmak için uygulamadaki
--  /kayit sayfasından kayıt ol, sonra aşağıdaki komutla admin yap:
--
--    update public.users set is_admin = true where username = 'KULLANICI_ADIN';
-- =====================================================================
