-- ════════════════════════════════════════════════════════════════════════
-- XCHANGE schema, row-level security, and the secure exchange RPCs.
-- Run in the Supabase SQL editor (or `supabase db push`).
-- ════════════════════════════════════════════════════════════════════════
create extension if not exists pgcrypto;

-- ── cards: a user's shareable cards (one per kind) ──────────────────────────
create table if not exists public.cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('personal','work')),
  label      text not null default 'Personal',
  name       text not null default '',
  handle     text not null default '',
  title      text not null default '',
  company    text not null default '',
  phone      text not null default '',
  email      text not null default '',
  website    text not null default '',
  socials    jsonb not null default '{}'::jsonb,
  hue        int  not null default 158,
  tagline    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind)
);

-- ── contacts: people you've exchanged with ──────────────────────────────────
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null references auth.users(id) on delete cascade,
  source_user uuid references auth.users(id) on delete set null,
  name        text not null,
  handle      text default '',
  title       text default '',
  company     text default '',
  phone       text default '',
  email       text default '',
  website     text default '',
  socials     jsonb not null default '{}'::jsonb,
  hue         int  not null default 200,
  tagline     text default '',
  met         text not null default '',
  note        text default '',
  fav         boolean not null default false,
  method      text not null check (method in ('qr','tap','nearby')),
  verified    boolean not null default false,
  met_at      timestamptz not null default now()
);
-- one row per (owner, person) so repeat exchanges update instead of duplicate
create unique index if not exists contacts_owner_source_uniq
  on public.contacts (owner, source_user) where source_user is not null;

-- ── exchange_tokens: short-lived, single-use pairing primitive ──────────────
-- Encoded into the QR / NFC tag / Nearby presence. The ONLY way another user
-- can reach your card — and only briefly, once, and never read directly (RLS).
create table if not exists public.exchange_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    uuid not null references public.cards(id) on delete cascade,
  method     text not null check (method in ('qr','tap','nearby')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at    timestamptz,
  claimed_by uuid references auth.users(id)
);

-- ── pending_exchanges: a request awaiting the sharer's approval ─────────────
create table if not exists public.pending_exchanges (
  id             uuid primary key default gen_random_uuid(),
  token          text not null references public.exchange_tokens(token) on delete cascade,
  requester      uuid not null references auth.users(id) on delete cascade,
  requester_card jsonb not null,
  sharer         uuid not null references auth.users(id) on delete cascade,
  sharer_card_id uuid not null references public.cards(id) on delete cascade,
  sharer_card    jsonb,                 -- filled in on approval
  method         text not null,
  status         text not null default 'pending' check (status in ('pending','approved','declined')),
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null
);

-- ── updated_at trigger for cards ────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists cards_touch on public.cards;
create trigger cards_touch before update on public.cards
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════
alter table public.cards             enable row level security;
alter table public.contacts          enable row level security;
alter table public.exchange_tokens   enable row level security;
alter table public.pending_exchanges enable row level security;

-- cards: only the owner can see/manage their cards
create policy cards_own on public.cards
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- contacts: only the owner can see/manage their contacts
create policy contacts_own on public.contacts
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- exchange_tokens: create & read your own; never read someone else's directly
create policy tokens_insert on public.exchange_tokens
  for insert with check (user_id = auth.uid());
create policy tokens_select_own on public.exchange_tokens
  for select using (user_id = auth.uid());

-- pending_exchanges: visible to the two parties; writes go through RPCs only
create policy pending_select on public.pending_exchanges
  for select using (requester = auth.uid() or sharer = auth.uid());

-- ════════════════════════════════════════════════════════════════════════
-- SECURE EXCHANGE RPCs  (security definer; identity is server-verified)
-- ════════════════════════════════════════════════════════════════════════

-- Mint a fresh, time-boxed, single-use token for one of MY cards.
create or replace function public.create_exchange_token(
  p_card_id uuid, p_method text, p_ttl int default 90
) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_token text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from cards where id = p_card_id and user_id = auth.uid()) then
    raise exception 'card not found';
  end if;
  v_token := replace(replace(encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-');
  insert into exchange_tokens(token, user_id, card_id, method, expires_at)
    values (v_token, auth.uid(), p_card_id, p_method, now() + make_interval(secs => greatest(p_ttl, 10)));
  return v_token;
end $$;

-- Claim a token: validates freshness/single-use, records a PENDING request that
-- the sharer must approve. Returns a minimal preview of who you're connecting to.
create or replace function public.request_exchange(
  p_token text, p_my_card jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t record; v_id uuid; v_name text; v_hue int; v_title text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into t from exchange_tokens where token = p_token for update;
  if not found then raise exception 'invalid code'; end if;
  if t.used_at is not null then raise exception 'code already used'; end if;
  if t.expires_at < now() then raise exception 'code expired'; end if;
  if t.user_id = auth.uid() then raise exception 'cannot exchange with yourself'; end if;

  update exchange_tokens set used_at = now(), claimed_by = auth.uid() where token = p_token;

  insert into pending_exchanges(token, requester, requester_card, sharer, sharer_card_id, method, expires_at)
    values (p_token, auth.uid(), p_my_card, t.user_id, t.card_id, t.method, now() + interval '120 seconds')
    returning id into v_id;

  select name, hue, title into v_name, v_hue, v_title from cards where id = t.card_id;
  return jsonb_build_object('request_id', v_id, 'name', v_name, 'hue', v_hue, 'title', v_title);
end $$;

-- The sharer approves/declines an incoming request. On approval both sides get
-- a contact; the requester reads the full card from pending.sharer_card.
create or replace function public.respond_exchange(
  p_request_id uuid, p_approve boolean
) returns void
language plpgsql security definer set search_path = public as $$
declare pe record; sc record;
begin
  select * into pe from pending_exchanges where id = p_request_id for update;
  if not found then raise exception 'request not found'; end if;
  if pe.sharer <> auth.uid() then raise exception 'not your request to answer'; end if;
  if pe.status <> 'pending' then return; end if;

  if not p_approve then
    update pending_exchanges set status = 'declined' where id = p_request_id;
    return;
  end if;

  select * into sc from cards where id = pe.sharer_card_id;

  -- record the sharer-facing contact (the requester's card)
  insert into contacts(owner, source_user, name, handle, title, company, phone, email, website, socials, hue, tagline, met, method, verified)
    values (
      pe.sharer, pe.requester,
      coalesce(pe.requester_card->>'name',''), coalesce(pe.requester_card->>'handle',''),
      coalesce(pe.requester_card->>'title',''), coalesce(pe.requester_card->>'company',''),
      coalesce(pe.requester_card->>'phone',''), coalesce(pe.requester_card->>'email',''),
      coalesce(pe.requester_card->>'website',''), coalesce(pe.requester_card->'socials','{}'::jsonb),
      coalesce((pe.requester_card->>'hue')::int, 200), coalesce(pe.requester_card->>'tagline',''),
      initcap(pe.method), pe.method, true
    )
    on conflict (owner, source_user) where source_user is not null
    do update set met_at = now(), verified = true;

  -- expose the sharer's full card to the requester (+ source user id)
  update pending_exchanges
    set status = 'approved',
        sharer_card = jsonb_build_object(
          'user_id', pe.sharer, 'name', sc.name, 'handle', sc.handle, 'title', sc.title,
          'company', sc.company, 'phone', sc.phone, 'email', sc.email, 'website', sc.website,
          'socials', sc.socials, 'hue', sc.hue, 'tagline', sc.tagline)
    where id = p_request_id;
end $$;

grant execute on function public.create_exchange_token(uuid, text, int) to authenticated;
grant execute on function public.request_exchange(text, jsonb) to authenticated;
grant execute on function public.respond_exchange(uuid, boolean) to authenticated;

-- ── realtime: let both parties watch pending_exchanges live ─────────────────
alter publication supabase_realtime add table public.pending_exchanges;
alter publication supabase_realtime add table public.contacts;
