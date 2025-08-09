--- =========================
-- RESET COMPLET (DANGEREUX)
-- =========================
drop table if exists public.outfits cascade;
drop table if exists public.clothes cascade;
drop table if exists public.bulletins cascade;
drop table if exists public.exam_results cascade;
drop table if exists public.exams cascade;
drop table if exists public.syllabus cascade;
drop table if exists public.messages cascade;
drop table if exists public.proofs cascade;
drop table if exists public.exercise_logs cascade;
drop table if exists public.exercises cascade;
drop table if exists public.users cascade;

-- Extensions utiles (UUID)
create extension if not exists "pgcrypto";

-- =========================
-- (RE)CRÉATION DES TABLES
-- =========================

-- 1) Utilisateurs
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text check (role in ('eleve','prof')) not null default 'eleve',
  created_at timestamptz default now()
);

-- 2) Exercices (catalogue)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  created_at timestamptz default now()
);

-- 3) Journal des exercices cochés
create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  day date not null,
  done boolean not null default false,
  created_at timestamptz default now(),
  unique (user_id, exercise_id, day)
);

-- 4) Preuves (uploads)
create table public.proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  file_url text,
  note_prof int check (note_prof between 0 and 20),
  comment_prof text,
  created_at timestamptz default now()
);

-- 5) Messages (prof ↔ élève)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references public.users(id),
  to_user uuid references public.users(id),
  body text not null,
  created_at timestamptz default now()
);

-- 6) Dressing
create table public.clothes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text,
  color text,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- 7) Tenues
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  item_ids uuid[],
  created_at timestamptz default now()
);

-- 8) Syllabus (programme)
create table public.syllabus (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  week int not null check (week between 1 and 5),
  title text not null,
  description text not null
);

-- 9) Examens
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  syllabus_id uuid references public.syllabus(id) on delete cascade,
  title text not null,
  questions jsonb not null,
  kind text not null default 'quiz' -- 'quiz' | 'practical'
);

-- 10) Résultats d’examens
create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  score int check (score between 0 and 20),
  taken_at timestamptz default now()
);

-- 11) Bulletins mensuels
create table public.bulletins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  month char(7) not null, -- YYYY-MM
  moyenne int check (moyenne between 0 and 20),
  details jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- =========================
-- RLS (démo, permissif)
-- =========================
alter table public.users          enable row level security;
alter table public.exercises      enable row level security;
alter table public.exercise_logs  enable row level security;
alter table public.proofs         enable row level security;
alter table public.messages       enable row level security;
alter table public.clothes        enable row level security;
alter table public.outfits        enable row level security;
alter table public.syllabus       enable row level security;
alter table public.exams          enable row level security;
alter table public.exam_results   enable row level security;
alter table public.bulletins      enable row level security;

-- Policies permissives pour la démo (à durcir plus tard avec auth.uid())
create policy users_select     on public.users         for select using (true);
create policy users_insert     on public.users         for insert with check (true);

create policy exercises_rw     on public.exercises     for all    using (true) with check (true);
create policy exercise_logs_rw on public.exercise_logs for all    using (true) with check (true);
create policy proofs_rw        on public.proofs        for all    using (true) with check (true);
create policy messages_rw      on public.messages      for all    using (true) with check (true);
create policy clothes_rw       on public.clothes       for all    using (true) with check (true);
create policy outfits_rw       on public.outfits       for all    using (true) with check (true);
create policy syllabus_rw      on public.syllabus      for all    using (true) with check (true);
create policy exams_rw         on public.exams         for all    using (true) with check (true);
create policy exam_results_rw  on public.exam_results  for all    using (true) with check (true);
create policy bulletins_rw     on public.bulletins     for all    using (true) with check (true);

