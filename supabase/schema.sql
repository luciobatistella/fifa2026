-- =============================================================================
--  FIFA World Cup 2026 — Sticker Album · Supabase schema
--  Rode este script no Supabase SQL Editor (uma única vez).
-- =============================================================================

-- 1) PROFILES (1:1 com auth.users) -------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all"  on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;

create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- Cria perfil automaticamente quando um usuário se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) COLLECTIONS (figurinhas do usuário) -------------------------------------
create table if not exists public.collections (
  user_id     uuid not null references auth.users(id) on delete cascade,
  sticker_id  text not null,                      -- formato canônico "PREFIX-NUMBER"
  owned       integer not null default 0 check (owned >= 0),
  updated_at  timestamptz not null default now(),
  primary key (user_id, sticker_id)
);

create index if not exists collections_user_id_idx on public.collections (user_id);

alter table public.collections enable row level security;

drop policy if exists "collections_select_own" on public.collections;
drop policy if exists "collections_insert_own" on public.collections;
drop policy if exists "collections_update_own" on public.collections;
drop policy if exists "collections_delete_own" on public.collections;

create policy "collections_select_own" on public.collections for select using (auth.uid() = user_id);
create policy "collections_insert_own" on public.collections for insert with check (auth.uid() = user_id);
create policy "collections_update_own" on public.collections for update using (auth.uid() = user_id);
create policy "collections_delete_own" on public.collections for delete using (auth.uid() = user_id);

-- updated_at automático
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.tg_set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- 3) PÁGINA PÚBLICA DE TROCAS -------------------------------------------------
-- Permite que qualquer pessoa (mesmo sem login) veja as figurinhas repetidas
-- (owned > 1) de qualquer usuário via username.

-- Policy: leitura pública das repetidas (owned > 1)
drop policy if exists "collections_select_public_extras" on public.collections;
create policy "collections_select_public_extras"
  on public.collections
  for select
  using (owned > 1);

-- View pública que junta profile + repetidas (simplifica a query no cliente)
create or replace view public.trocas_publicas as
  select
    p.username,
    p.display_name,
    p.avatar_url,
    c.sticker_id,
    c.owned,
    c.owned - 1 as extras
  from public.collections c
  join public.profiles p on p.id = c.user_id
  where c.owned > 1
    and p.username is not null;

-- Garante que a view seja acessível sem autenticação
grant select on public.trocas_publicas to anon, authenticated;

-- 4) AMIGOS / FRIENDSHIPS -----------------------------------------------------
-- Modelo direcional: a linha (user_id=A, friend_id=B) representa um pedido
-- enviado por A para B. Quando B aceita, status='accepted' e a amizade é
-- considerada mútua (não criamos linha inversa).
create table if not exists public.friendships (
  user_id    uuid not null references auth.users(id) on delete cascade,
  friend_id  uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_friend_id_idx on public.friendships (friend_id);

alter table public.friendships enable row level security;

drop policy if exists "friendships_select_involved" on public.friendships;
drop policy if exists "friendships_insert_self"     on public.friendships;
drop policy if exists "friendships_update_friend"   on public.friendships;
drop policy if exists "friendships_delete_involved" on public.friendships;

-- Vê linhas onde participa (como solicitante ou destinatário)
create policy "friendships_select_involved"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Cria pedido: somente em nome próprio
create policy "friendships_insert_self"
  on public.friendships for insert
  with check (auth.uid() = user_id);

-- Aceitar/atualizar status: somente o destinatário
create policy "friendships_update_friend"
  on public.friendships for update
  using (auth.uid() = friend_id);

-- Cancelar/remover/recusar: qualquer um dos dois lados
create policy "friendships_delete_involved"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.tg_set_updated_at();

-- Permite que amigos aceitos leiam as figurinhas um do outro (inclusive
-- as únicas, owned=1, necessário para calcular o "match" de troca).
drop policy if exists "collections_select_friends" on public.collections;
create policy "collections_select_friends"
  on public.collections for select
  using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and (
          (f.user_id = auth.uid()   and f.friend_id = collections.user_id) or
          (f.friend_id = auth.uid() and f.user_id   = collections.user_id)
        )
    )
  );
