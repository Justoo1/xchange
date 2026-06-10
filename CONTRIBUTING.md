# Contributing

Thanks for your interest in Xchange! This guide covers local setup and the conventions used
in the project. For a tour of how things fit together, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites

- **Node.js 18+** and npm
- **Expo Go** on a phone (iOS/Android) or a simulator/emulator
- A free **Supabase** project (optional — the app runs without one in local mode)

## Getting started

```bash
git clone https://github.com/Justoo1/xchange.git
cd xchange
npm install
npx expo start          # press i / a, or scan the QR with Expo Go
```

That's enough to run the app in **local mode** (seeded data, no sign-in).

### Enabling the backend (optional)

```bash
cp .env.example .env
```

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase **SQL editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. From **Settings → API**, put the project URL and anon key into `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
4. Restart with a clear cache: `npx expo start -c`.

> `.env` is git-ignored — never commit secrets. For quick auth testing, disable email
> confirmation under **Authentication → Providers → Email**, or use the "Email code" tab.

## Project layout

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full map. In short:
`src/app` routes · `src/data` server-state hooks · `src/state` zustand stores ·
`src/components` UI · `src/lib` & `src/theme` utilities/tokens · `supabase/` schema.

A key rule: **screens read data through `src/data/*` hooks**, never directly from Supabase
or the local stores.

## Development workflow

1. Branch from `main`: `git checkout -b feat/short-description`.
2. Make focused changes.
3. Verify before pushing (see below).
4. Open a pull request describing what changed and why.

### Verify your change

Both of these must pass:

```bash
npx tsc --noEmit                       # type-check
npx expo export --platform ios --output-dir /tmp/xc   # bundles cleanly (also try android)
```

## Code style

- **TypeScript, strict mode.** Prefer explicit types at module boundaries.
- **Components** are function components; one component per file, PascalCase filenames.
- **Styling** uses the design tokens in `src/theme`; inline styles are fine for layout,
  NativeWind `className` for structure. Reuse existing primitives in `src/components`.
- Keep modules small and cohesive; colocate hooks with the data they own (`src/data`).

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(exchange): add inbound approval sheet
fix(auth): handle expired OTP gracefully
docs: clarify Supabase setup
chore: bump expo to 56.0.10
```

Keep commits small and focused — one logical change each.

## Reporting issues

Open a GitHub issue with steps to reproduce, what you expected, what happened, and your
platform (iOS/Android, Expo Go vs dev build). For security-sensitive reports, please
disclose privately rather than in a public issue.
