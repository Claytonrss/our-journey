# AGENTS.md — Our Journey

## Package manager

- Use **pnpm** for everything (`pnpm install`, `pnpm run …`), never npm or yarn.
- CI locks pnpm 9; `pnpm-lock.yaml` is the source of truth.

## Commands

| Command                 | What it does                        |
| ----------------------- | ----------------------------------- |
| `pnpm run dev`          | Dev server on `127.0.0.1:3000`      |
| `pnpm run build`        | TypeScript check + production build |
| `pnpm run lint`         | ESLint (core-web-vitals + TS rules) |
| `pnpm run format:check` | Prettier check                      |
| `pnpm run format`       | Prettier write                      |

- `pnpm run build` includes typechecking — there is no separate `tsc` step.
- No test suite exists in this repo.

## Architecture

- **Next.js 16 App Router** (React 19), single app — no monorepo.
- **BFF pattern**: external API secrets (Spotify, Mapbox) stay on the server. Route Handlers under `src/app/api/` proxy calls; never expose `SPOTIFY_CLIENT_SECRET` or `MAPBOX_TOKEN` to the client.
- **Mapbox WebGL map** (`react-map-gl`) runs on the `/map` page. The app uses an overlay pattern — never unmount the map component during navigation; content overlays sit on top.
- **Auth**: next-auth v5 (beta) with Spotify OAuth, plus a local PIN lock (`SECRET_PIN` env). `src/auth.ts` handles token refresh and auth URL normalization.

## Key directories

```
src/
├── app/            # App Router pages, API routes, server actions
│   ├── api/auth/   # next-auth route handler
│   ├── api/mapbox-token/  # BFF proxy — don't expose token client-side
│   ├── api/spotify-token/ # BFF proxy — don't expose token client-side
│   └── map/        # Mapbox WebGL page (preserve via overlay, never unmount)
├── components/
│   ├── features/   # Feature-grouped: auth, map, player, IntroScreen, overlay
│   └── ui/         # Shared UI primitives (currently empty)
├── hooks/          # Custom hooks + Zustand store (useAppStore)
├── lib/            # Utilities (cn() for Tailwind class merging)
├── services/       # External API integrations (Spotify, memory data, audio)
├── types/          # Zod schemas + TS types (Memory, CurrentTrack, AppState)
└── data/           # Static content: memories.json (Zod-validated at runtime)
```

## Environment variables

Copy `.env.example` → `.env.local`. Required vars:

- `SECRET_PIN` — local PIN lock
- `AUTH_SECRET` — next-auth secret (`openssl rand -base64 32`)
- `AUTH_URL` / `NEXTAUTH_URL` — canonical auth URL (e.g. `https://your-domain.vercel.app`)
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify OAuth credentials
- `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI` — `spotify:playlist:…` (this one is public)
- `MAPBOX_TOKEN` — Mapbox access token

Dev server binds to `127.0.0.1` (not localhost) so Spotify redirect URIs resolve correctly.

## Style & conventions

- **Prettier**: single quotes, semicolons, trailing commas, 2-space indent.
- **Conventional Commits** enforced by commitlint (husky `commit-msg` hook).
- **lint-staged** runs Prettier + ESLint on staged JS/TS files on pre-commit.
- Tailwind classes are merged with the `cn()` helper from `@/lib/utils`.
- Fonts: Inter (body) + Playfair Display (headings), loaded via `next/font/google`. `lang="pt-BR"` on `<html>`.
- All state mutations require `'use client'`; data fetching happens on the server where possible.

## Content updates

Memory data lives in `src/data/memories.json` and is validated against the Zod `MemorySchema` in `src/types/index.ts`. Update both the JSON and images (Cloudinary URLs) as needed. Each memory entry needs: id, title, date (YYYY-MM-DD), coordinates (`{lat, lng}`), isSpecialPin, description, and an images array.

## opencode.json permissions

Both `edit` and `bash` are set to `"ask"` — the agent must request approval before modifying files or running shell commands.

## Superpowers + ECC — Orquestração

Este projeto usa **Superpowers** como espinha dorsal metodológica e **ECC** para especialização sob demanda.

### Regras de Orquestração

- **Fluxo de vida**: sempre seguir skills do Superpowers (brainstorming -> spec -> plano -> TDD -> review)
- **Subagentes ECC**: usar sob demanda quando a tarefa pedir profundidade extra ou especialização
- **Conflito**: se Superpowers e ECC oferecem a mesma skill, Superpowers comanda QUANDO e COMO; ECC fornece O QUÊ

### Subagentes ECC disponíveis

| Skill                | Quando usar                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `ecc-security-audit` | Features com auth, APIs, dados sensíveis. Após implementação, antes de merge.              |
| `ecc-deep-review`    | Review profundo (security, performance, edge cases). Complementa `requesting-code-review`. |
| `ecc-debug`          | Debug avançado quando `systematic-debugging` não resolveu. Bugs multi-sistema.             |

### Memória Persistente

Ao iniciar sessão, ler `docs/superpowers/memory/`:

- `architecture.md` — Decisões arquiteturais, stack, dependências
- `decisions.md` — Registro de decisões (ADR-style)
- `patterns.md` — Padrões e convenções
- `known-issues.md` — Issues conhecidas e workarounds

Ao completar feature significativa, perguntar se deve atualizar os arquivos de memória.
NUNCA remover informações — apenas adicionar ou marcar como resolvido com ~~strikethrough~~.

### Context7 + Docs

Context7 continua como canal primário para documentação de bibliotecas. ECC skills NÃO substituem Context7 para lookup de docs.
