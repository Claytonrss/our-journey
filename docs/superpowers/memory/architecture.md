# Architecture — Our Journey

## Stack

### Dependencies

| Package              | Version       |
| -------------------- | ------------- |
| next                 | 16.2.6        |
| react / react-dom    | 19.2.4        |
| typescript           | ^5            |
| tailwindcss          | ^4            |
| @tailwindcss/postcss | ^4            |
| framer-motion        | ^12.40.0      |
| mapbox-gl            | ^3.24.0       |
| react-map-gl         | ^8.1.1        |
| next-auth            | 5.0.0-beta.31 |
| next-cloudinary      | ^6.17.5       |
| zustand              | ^5.0.13       |
| zod                  | ^4.4.3        |
| @sentry/nextjs       | ^10           |
| clsx                 | ^2.1.1        |
| tailwind-merge       | ^3.6.0        |
| lucide-react         | ^1.16.0       |

### Dev Dependencies

| Package                | Version |
| ---------------------- | ------- |
| vitest                 | ^3.2.6  |
| @vitest/coverage-v8    | ^3.2.6  |
| @playwright/test       | ^1.60.0 |
| @testing-library/react | ^16.3.2 |
| eslint                 | ^9      |
| eslint-config-next     | 16.2.6  |
| prettier               | ^3.8.3  |
| husky                  | ^9.1.7  |
| lint-staged            | ^17.0.5 |
| @commitlint/cli        | ^21.0.1 |
| cloudinary (SDK)       | ^2.10.0 |
| tsx                    | ^4.22.4 |

### Package Manager

- **pnpm 9** (CI-enforced). Never use npm or yarn.
- `pnpm-lock.yaml` is the source of truth.

## Commands

| Command                  | What it does                        |
| ------------------------ | ----------------------------------- |
| `pnpm run dev`           | Dev server on `127.0.0.1:3000`      |
| `pnpm run build`         | TypeScript check + production build |
| `pnpm run lint`          | ESLint (core-web-vitals + TS rules) |
| `pnpm run format:check`  | Prettier check                      |
| `pnpm run format`        | Prettier write                      |
| `pnpm run test`          | Vitest unit tests                   |
| `pnpm run test:coverage` | Vitest with coverage thresholds     |
| `pnpm run test:e2e`      | Playwright E2E                      |
| `pnpm run generate`      | Sync Cloudinary → `memories.json`   |

- `pnpm run build` includes typechecking — no separate `tsc` step.
- Dev server binds to `127.0.0.1` (not `localhost`) for Spotify OAuth redirect URI.

## Architectural Patterns

- **BFF pattern**: Spotify, Mapbox, Cloudinary secrets stay server-side. Route Handlers in `src/app/api/` proxy external APIs.
- **Overlay pattern**: Mapbox WebGL map never unmounts during navigation. Content overlays sit on top.
- **Auth**: NextAuth v5 beta (Spotify OAuth) + local PIN lock (`SECRET_PIN` env) via Server Action.
- **Cloudinary**: `CldImage` with `publicId` from schema; transforms declarative.
- **Audio**: Dual-mode — HTML5 local fallback + Spotify SDK via `GlobalAudio`.
- **Memórias**: JSON versionado em `src/data/memories.json`, gerado via `pnpm run generate` a partir de `memories-source.json`, validado por Zod.

## Directory Responsibilities

```
src/
├── app/            # App Router: pages, API routes (BFF), server actions
├── components/
│   ├── features/   # Feature-grouped: auth, map, overlay, player, timeline, IntroScreen
│   └── ui/         # Shared primitives: CompassRose, ViewToggle
├── hooks/          # Custom hooks + Zustand store (useAppStore)
├── lib/            # Pure utilities: cn(), env, memory-grouping, navigation-utils, pin-validation, publicEnv
├── services/       # External integrations: Spotify, memory data, HTML5 audio
├── types/          # Zod schemas + TS types (Memory, AppState, CurrentTrack)
├── data/           # Static JSON: memories.json (generated), memories-source.json (source)
└── __tests__/      # Vitest tests mirroring src/ structure
scripts/            # generate-memories.ts (Cloudinary sync)
```

## Data Flow

1. **Source of truth:** `src/data/memories-source.json` (metadata + `cloudinaryFolder`)
2. **Generated artifact:** `src/data/memories.json` (via `pnpm run generate`)
3. **Validation:** `MemorySchema` / `ImageSchema` in `src/types/index.ts` (Zod)
4. **Service layer:** `memoryService.getMemories()` — dynamic import + Zod parse
5. **State:** Zustand `useAppStore` — `activeMemoryId`, `selectedMemoryId`, `viewMode`, audio, PIN
6. **Components:** receive typed props; never import JSON directly in UI components

## Component Structure Pattern

```tsx
'use client'; // required for state, effects, event handlers

import {} from /* external libs */ '...';
import {} from /* @/ internal imports */ '@/...';
import type { Memory } from '@/types';

interface MyComponentProps {
  memory: Memory;
  onAction: (id: string) => void;
}

export function MyComponent({ memory, onAction }: MyComponentProps) {
  // hooks first, then handlers, then render
}
```

- Merge Tailwind classes with `cn()` from `@/lib/utils`
- Prefer CSS vars over hardcoded colors in inline styles
- Feature components go in `components/features/<feature>/`
- Shared primitives go in `components/ui/`

## Where NOT to Put Logic

- **No fetch in UI components** — use services (`memoryService`) or Route Handlers (BFF)
- **No API secrets in client code** — proxy via `src/app/api/`
- **No direct JSON imports in components** — go through `memoryService`
- **No business logic in page files** — extract to hooks or services

## Critical Dependencies

- `react-map-gl`: renderização WebGL do mapa — nunca desmontar
- `next-auth@beta`: Spotify OAuth com refresh token em `src/auth.ts`
- `zustand`: estado global client-side (`useAppStore`)
- `zod`: validação de contratos (Memory, CurrentTrack, env)

## Environment Variables

Copy `.env.example` → `.env.local`. Required: `SECRET_PIN`, `AUTH_SECRET`, `AUTH_URL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`, `MAPBOX_TOKEN`, `CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

## Implementation Decisions

- Dev server em `127.0.0.1` (não `localhost`) para resolução de OAuth
- `next/font/google` para DM Sans (body) + Playfair Display (headings) + Lora (editorial)
- `lang="pt-BR"` no `<html>`
- Permissões opencode: `edit: ask`, `bash: ask`

(Updated 2026-06-14 — fill in as sessions progress)
