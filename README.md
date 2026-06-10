# Xchange

Exchange contacts in seconds — **QR first**, with **Tap (NFC)** and an AirDrop-style
**Nearby radar**. A faithful React-Native (Expo SDK 56) build of the **XCHANGE** design
handoff: premium dark canvas, Space Grotesk + Manrope type, mint accent, hue-tinted cards.

---

## Run it

```bash
npm install
cp .env.example .env     # then fill in your Supabase URL + anon key (see Backend)
npx expo start           # then press i / a, or scan the QR with Expo Go
```

> **No backend yet?** Leave `.env` blank and the app runs in **local mode**: no
> sign-in, seeded sample data, and a fully simulated exchange flow — handy for a
> quick look. With Supabase configured you get real auth, synced data, and the
> secure server-mediated exchange below.

## Backend (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL editor → New query →** paste [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run it. This creates the tables, **row-level security**, and the exchange RPCs.
3. **Settings → API →** copy the *Project URL* and *anon public* key into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Restart `expo start`. (Email sign-up confirmation is on by default in Supabase —
   turn it off under **Authentication → Providers → Email** for instant testing, or
   use the **Email code** tab which sends a 6-digit OTP.)

## Auth

[`src/app/(auth)/sign-in.tsx`](src/app/(auth)/sign-in.tsx) supports **email + password**
and **email OTP** (passwordless 6-digit code). Sessions persist to AsyncStorage and
auto-refresh ([`src/lib/supabase.ts`](src/lib/supabase.ts)); the root layout gates routes:
signed-out → sign-in, signed-in-without-a-card → onboarding, otherwise the app.

---

## What it does

| Screen | Notes |
| --- | --- |
| **Onboarding** | 4-step build-your-card (identity → reach → preview), pre-filled, with a live gradient-card preview. |
| **Card** (home) | Wordmark, Personal/Work switch, the contact card, Exchange + QR, "Recently met". |
| **Exchange** | QR (show / scan), **Tap** (pulsing rings), **Nearby** (rotating radar with blips). Method switch at the bottom. |
| **Confirm & Save** | Mutual-swap badge, integrity-verification banner, **"where you met"** chips + a note, then a success pop. |
| **Contacts** | Search + All/Favorites/Recent filters; role, "met" place, favorite stars. |
| **Activity** | Stat strip (swaps / orgs / starred) + a timeline grouped by day with per-method icons. |
| **Profile** | Your cards, **Privacy** toggles (approve-before-sharing, include socials, Nearby discoverable), app settings. |
| **Tweaks** | Brand **accent** (5), card **layout** (minimal / gradient / bold), default exchange method — live preview. |

The standout touches from the design brief are here: **Work/Personal** profiles, the
**"where did you meet"** context captured at exchange time, the **Nearby radar**, and
satisfying **success animations**.

---

## Design system — straight from the handoff

Tokens mirror `XCHANGE.html` exactly ([`src/theme/index.ts`](src/theme/index.ts)):

- **Canvas** `#0c0e12`, surfaces `#14161c → #23262f`, hairlines at 8–14% white.
- **Type** Space Grotesk (display), Manrope (body), Space Mono (eyebrows) — loaded via
  `@expo-google-fonts/*`.
- **Accent** mint `#6ce5b1` by default; the other 4 swatches and the `soft`/`line`/`ink`
  variants are derived the way the prototype's `color-mix()` did ([`src/lib/color.ts`](src/lib/color.ts)).
- **Hue cards** every person has a `hue`; avatars and the gradient card are built from an
  **OKLCH** two-stop gradient, converted to sRGB in [`src/lib/color.ts`](src/lib/color.ts)
  since RN can't parse `oklch()`.

Layout is plain RN styles for design-exact spacing, with NativeWind available for structure.

---

## Secure exchange (Tap & Nearby)

The exchange is **server-mediated** so identity is actually verifiable. The flow
([`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) +
[`src/data/exchange.ts`](src/data/exchange.ts)):

1. **Mint** — the sharer's app calls `create_exchange_token`, getting a random,
   **single-use**, **90s-expiry** token bound to one of their cards. It's encoded into
   the QR (and, later, the NFC tag / Nearby broadcast). It is never the card itself.
2. **Request** — the claimer calls `request_exchange(token, my_card)`. The server checks
   the token is unused + unexpired, marks it used, and records a **pending** request. No
   card is released yet.
3. **Approve** — the **sharer must approve** the named incoming request
   ([`IncomingSheet`](src/components/IncomingSheet.tsx)). Only on approval does the server
   reveal each side's card and create both contacts.
4. **Confirm** — the claimer reviews the card, tags **where they met** + a note, and saves
   ([`ConfirmSheet`](src/components/ConfirmSheet.tsx)).

Why this is safe:

- **No silent harvesting.** A card is unreadable without a fresh token *and* the owner's
  approval. **Row-level security** means no user can read another's cards/contacts directly.
- **Single-use + expiry** kills replay; tokens die in 90s and after one claim.
- **Server-verified identity.** A token maps to a real authenticated user, so imported
  contacts are marked **verified** — this is real attestation, not just an integrity hash.
- **Off-by-default Nearby.** "Discoverable on Nearby" is a Privacy toggle (off initially);
  you only appear in the realtime presence lobby while the Exchange sheet is open.

**Native later.** QR and Nearby (realtime presence) work today. Tap (NFC) shares the same
token primitive — wire `react-native-nfc-manager` in a dev build to read/write the token
over NFC; the request/approve/confirm path above is unchanged.

---

## Architecture

```
src/
  app/
    _layout.tsx         providers + fonts + auth/onboarding route guard
    (auth)/sign-in.tsx  email + password / OTP
    (tabs)/             index (Card), people, activity, profile + custom TabBar (squircle FAB)
    exchange.tsx        QR / Tap / Nearby overlay + request/approve/confirm orchestration
    onboarding.tsx  tweaks.tsx  edit.tsx  contact/[id].tsx
  data/                 server state (React Query) — unified hooks over Supabase OR local
    cards.ts  contacts.ts  exchange.ts  nearby.ts  query.tsx
  lib/                  supabase client, color (oklch + accent), format
  state/                zustand: auth (session), ui (active card), settings; local-mode stores
  services/payload.ts   client-side integrity signing (local mode + defense-in-depth)
  components/  theme/    design system
supabase/migrations/    schema, RLS, exchange RPCs
```

**Data layer.** Screens read through `src/data/*` hooks that transparently use Supabase +
React Query (with realtime invalidation) when configured, or the local seeded stores when
not — so the UI is identical in both modes and there's no dummy data once a backend is set.

---

## Tech

Expo SDK 56 · React Native 0.85 · expo-router · **Supabase** (auth + Postgres + RLS +
realtime) · **@tanstack/react-query** · zustand · expo-camera · react-native-qrcode-svg ·
expo-linear-gradient · expo-crypto · expo-haptics · NativeWind · @expo-google-fonts.
