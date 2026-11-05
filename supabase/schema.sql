create table if not exists public.library (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 250),
 kind text not null default 'Película' check (kind in ('Película','Serie')),
 director text,
 release_year integer,
 status text not null default 'Completada' check (status in ('Completada','Al día','En curso')),
 shared_rating numeric(4,2) check (shared_rating between 0 and 10),
 juanma_rating numeric(4,2) check (juanma_rating between 0 and 10),
 pouk_rating numeric(4,2) check (pouk_rating between 0 and 10),
 watched_on date,
 notes text,
 created_by text check (created_by in ('Juanma','Pouk')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists library_title_idx on public.library (title);
alter table public.library enable row level security;
-- No public policies: only server-side service role accesses records.
