# ELS News

ELS News is a community-driven news platform where any registered reader can publish a story and join the discussion. It is built around two deliberate editorial rules:

- **Articles are published anonymously.** The author of a story is never shown anywhere on the site. The `author_id` is stored in the database only so the author (or an administrator) can manage their own content.
- **Comments are attributed.** When a reader comments, their display name and profile picture are shown next to the comment.

The result is a platform where the news itself stays in the foreground while the conversation around it stays personal and accountable.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI runtime | React 19 (Server Components by default) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first config, OKLCH tokens) |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage |
| Rich text | TipTap 3 |
| Auth | Custom username + password (bcrypt + signed cookie) |
| Package manager | Bun |

## Features

- **Home page** with a single highlighted headline, a most-read sidebar, and a chronological feed of the latest stories.
- **Article publishing** through a TipTap rich-text editor that supports bold, italic, headings, lists, blockquotes, links, and inline images. Images can be added by clicking, dragging and dropping, or pasting directly from the clipboard.
- **Image uploads** stored in Supabase Storage. Cover images and in-article images are uploaded as real files (not external links), validated for type and size on the server.
- **Comments** with author attribution (name + avatar). Administrators are marked with an editor badge.
- **Profiles** where users set a display name, a profile picture, and a short bio. Profile data is what appears next to their comments.
- **Authentication** with username and password only. No email is collected. Passwords are hashed with bcrypt and the session is a signed, HTTP-only cookie.
- **Search** across article titles and a personal "my articles" view.
- **Administration**: admins can set the featured headline and remove any article or comment.

## Architecture

### Authentication

Supabase Auth is intentionally not used. The custom layer in `lib/auth.ts`:

- hashes passwords with bcrypt on registration,
- verifies them with a constant-time comparison on login,
- stores the user id inside an HMAC-signed, HTTP-only cookie,
- exposes `getCurrentUser()` and `requireUser()` helpers for Server Components and Server Actions.

### Data access and authorization

All database access happens server-side through the Supabase service-role key (`lib/supabase.ts`). Row Level Security is enabled on every table with no public policy, so the anonymous key cannot reach the data directly. Authorization is enforced explicitly inside each Server Action (`requireUser`, ownership and admin checks).

### Anonymous articles, attributed comments

The `articles` table stores `author_id` purely for ownership checks; no query used for rendering ever exposes it. The `comments` table is joined against `users` so the author's name and avatar are shown.

### Content safety

Article bodies are user-generated HTML produced by TipTap. They are sanitized server-side with an allow-list (`lib/sanitize.ts`) before being rendered, which prevents stored cross-site scripting.

## Project structure

```
app/
  page.tsx                 Home page (headline + feed)
  haber/[slug]/            Article detail and comments
  ara/                     Search
  yaz/                     Article composer (TipTap editor)
  profil/                  Profile and "my articles"
  (auth)/giris, /kayit     Login and registration
  actions/                 Server Actions (auth, articles, comments, profile, upload)
components/                Header, footer, article card, avatar, shared UI
lib/                       supabase, auth, queries, types, utils, sanitize, env
supabase/schema.sql        Database schema and storage bucket
```

## Getting started

### 1. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com/dashboard).

### 2. Load the schema

Open the SQL Editor in the Supabase dashboard, paste the contents of `supabase/schema.sql`, and run it. This creates the `users`, `articles`, and `comments` tables, the view-counter function, and the `els-media` storage bucket.

### 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings, API, Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings, API, service_role key |
| `SESSION_SECRET` | Generate with `openssl rand -hex 32` |

The service-role key has full database access. It is used only on the server and is never sent to the browser. Keep `.env.local` out of version control.

### 4. Run

```bash
bun install
bun dev
```

The app is available at http://localhost:3000. If Supabase is not configured yet, the home page shows a step-by-step setup card instead of failing.

## Becoming an administrator

1. Register an account from the `/kayit` page.
2. Run the following in the Supabase SQL Editor:

```sql
update public.users set is_admin = true where username = 'YOUR_USERNAME';
```

## License

Released under the MIT License.
