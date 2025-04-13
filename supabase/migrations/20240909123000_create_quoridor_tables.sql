-- Migration: Initial Quoridor Game Schema
-- This migration creates the base tables needed for the Quoridor game application
-- Tables: profiles, games, moves, walls

-- Create profiles table for storing user information
create table public.profiles (
  id bigint generated always as identity primary key,
  user_id text not null unique,
  telegram_id text unique,
  username text not null,
  avatar_url text,
  rating integer default 1200,
  wins integer default 0,
  losses integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.profiles is 'Player profiles for Quoridor game with optional Telegram integration.';

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "Public profiles are viewable by everyone"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create games table
create table public.games (
  id bigint generated always as identity primary key,
  game_uuid uuid default gen_random_uuid() unique not null,
  player1_id text not null,
  player2_id text,
  current_turn text,
  winner_id text,
  status text not null check (status in ('waiting', 'active', 'finished')) default 'waiting',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.games is 'Quoridor games with player information and game state.';

-- Enable Row Level Security
alter table public.games enable row level security;

-- Create RLS policies for games
create policy "Games are viewable by everyone"
on public.games for select
to anon, authenticated
using (true);

create policy "Authenticated users can create games"
on public.games for insert
to authenticated
with check (auth.uid() = player1_id);

create policy "Players can update their games"
on public.games for update
to authenticated
using (auth.uid() = player1_id or auth.uid() = player2_id);

-- Create moves table to track player moves
create table public.moves (
  id bigint generated always as identity primary key,
  game_id bigint references public.games(id) on delete cascade not null,
  player_id text not null,
  move_type text not null check (move_type in ('move', 'wall')),
  row_from integer,
  col_from integer,
  row_to integer,
  col_to integer,
  created_at timestamptz default now() not null
);
comment on table public.moves is 'Player moves in Quoridor games, including pawn movement and wall placement.';

-- Enable Row Level Security
alter table public.moves enable row level security;

-- Create RLS policies for moves
create policy "Moves are viewable by everyone"
on public.moves for select
to anon, authenticated
using (true);

create policy "Players can insert moves in their games"
on public.moves for insert
to authenticated
with check (
  exists (
    select 1 from public.games 
    where id = game_id and 
    (player1_id = auth.uid() or player2_id = auth.uid())
  )
);

-- Create walls table
create table public.walls (
  id bigint generated always as identity primary key,
  game_id bigint references public.games(id) on delete cascade not null,
  player_id text not null,
  row_pos integer not null,
  col_pos integer not null,
  orientation text not null check (orientation in ('horizontal', 'vertical')),
  created_at timestamptz default now() not null
);
comment on table public.walls is 'Walls placed during Quoridor games.';

-- Enable Row Level Security
alter table public.walls enable row level security;

-- Create RLS policies for walls
create policy "Walls are viewable by everyone"
on public.walls for select
to anon, authenticated
using (true);

create policy "Players can insert walls in their games"
on public.walls for insert
to authenticated
with check (
  exists (
    select 1 from public.games 
    where id = game_id and 
    (player1_id = auth.uid() or player2_id = auth.uid())
  )
);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger set_updated_at
before update on public.games
for each row
execute function public.handle_updated_at();

-- Create player_state view for convenience
create or replace view public.player_state as
select 
  g.id as game_id,
  g.game_uuid,
  g.status,
  g.current_turn,
  g.winner_id,
  p1.user_id as player1_id,
  p1.username as player1_username,
  p2.user_id as player2_id,
  p2.username as player2_username,
  (select count(*) from public.walls w where w.game_id = g.id and w.player_id = g.player1_id) as player1_walls_used,
  (select count(*) from public.walls w where w.game_id = g.id and w.player_id = g.player2_id) as player2_walls_used,
  (
    select json_build_object(
      'row', m.row_to, 
      'col', m.col_to
    )
    from public.moves m
    where m.game_id = g.id and m.player_id = g.player1_id and m.move_type = 'move'
    order by m.created_at desc
    limit 1
  ) as player1_position,
  (
    select json_build_object(
      'row', m.row_to, 
      'col', m.col_to
    )
    from public.moves m
    where m.game_id = g.id and m.player_id = g.player2_id and m.move_type = 'move'
    order by m.created_at desc
    limit 1
  ) as player2_position,
  g.created_at,
  g.updated_at
from 
  public.games g
left join 
  public.profiles p1 on g.player1_id = p1.user_id
left join 
  public.profiles p2 on g.player2_id = p2.user_id; 