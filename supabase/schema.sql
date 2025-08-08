-- Tables
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text check (role in ('eleve','prof')) not null default 'eleve',
  created_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  created_at timestamptz default now()
);

create table if not exists public.proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id),
  file_url text,
  note_prof int check (note_prof between 0 and 20),
  comment_prof text,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references public.users(id),
  to_user uuid references public.users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.clothes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  type text,
  color text,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  date date not null,
  item_ids uuid[],
  created_at timestamptz default now()
);

create table if not exists public.syllabus (
  id uuid primary key default gen_random_uuid(),
  month int not null check (month between 1 and 12),
  week int not null check (week between 1 and 5),
  title text not null,
  description text not null
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  syllabus_id uuid references public.syllabus(id) on delete cascade,
  title text not null,
  questions jsonb not null,
  kind text not null default 'quiz' -- quiz or practical
);

create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  score int check (score between 0 and 20),
  taken_at timestamptz default now()
);

create table if not exists public.bulletins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  month char(7) not null, -- YYYY-MM
  moyenne int check (moyenne between 0 and 20),
  details jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- RLS (enable and simple policies; refine in prod)
alter table public.users enable row level security;
alter table public.proofs enable row level security;
alter table public.messages enable row level security;
alter table public.clothes enable row level security;
alter table public.outfits enable row level security;
alter table public.exam_results enable row level security;
alter table public.bulletins enable row level security;

-- Policies (placeholder; replace with auth.uid() based rules when using Supabase Auth)
create policy if not exists users_read on public.users for select using (true);
create policy if not exists users_insert on public.users for insert with check (true);

create policy if not exists proofs_own_read on public.proofs for select using (true);
create policy if not exists proofs_insert on public.proofs for insert with check (true);
create policy if not exists proofs_update_prof on public.proofs for update using (true);

create policy if not exists messages_read on public.messages for select using (true);
create policy if not exists messages_write on public.messages for insert with check (true);
