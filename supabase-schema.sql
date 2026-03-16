-- ============================================================
--  Choix & Points — Supabase Schema
--  Copiez-collez ce SQL dans l'éditeur SQL de Supabase
-- ============================================================

-- Table: rooms
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  status      text not null default 'lobby', -- lobby | playing | reveal | finished
  turn        integer not null default 0,
  host_name   text not null,
  winner_id   uuid references public.players(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Table: players
create table if not exists public.players (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms(id) on delete cascade,
  name            text not null,
  score           integer not null default 10,
  eliminated      boolean not null default false,
  online          boolean not null default true,
  color_index     integer not null default 0,
  has_chosen      boolean not null default false,
  current_choice  integer,
  last_choice     integer,
  last_delta      integer,
  created_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_players_room on public.players(room_id);

-- Enable Realtime for both tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;

-- Row Level Security (RLS) — permissive for this game
alter table public.rooms enable row level security;
alter table public.players enable row level security;

create policy "Allow all on rooms" on public.rooms for all using (true) with check (true);
create policy "Allow all on players" on public.players for all using (true) with check (true);

-- Auto-cleanup: delete rooms older than 24h (optional, run as cron via pg_cron)
-- select cron.schedule('cleanup-old-rooms', '0 * * * *',
--   $$delete from public.rooms where created_at < now() - interval '24 hours'$$);
