-- create_exchange_token mints its token with extensions.gen_random_bytes (pgcrypto).
-- On Supabase pgcrypto lives in the `extensions` schema, but the function ran with
-- `search_path = public` and couldn't resolve it: Postgres error 42883
-- ("function gen_random_bytes(integer) does not exist"), which PostgREST surfaces
-- to the client as HTTP 404. Add `extensions` to the function's search_path.
--
-- pgcrypto ships pre-installed on Supabase; this is a no-op there but keeps fresh
-- (non-Supabase) deploys working too.
create extension if not exists pgcrypto with schema extensions;

alter function public.create_exchange_token(uuid, text, int)
  set search_path = public, extensions;
