# AGENTS.md — Our Journey

## 1. Project Identity

- **Name:** Our Journey
- **Purpose:** Interactive geo-spatial memory map — romantic gift for Marina, also a tech portfolio showcase
- **Audience:** Marina (mobile-first, Portuguese copy, emotional UX), then tech recruiters
- **Deploy URL:** https://our-journey-cm.vercel.app/map
- **Rule:** Every UI decision serves an intimate editorial experience — curated, not generic.

## 2. Workflow

For any task in this repository:

1. Read relevant files before proposing changes — never guess architecture
2. Verify design system compliance — colors, fonts, radius, animations (see `docs/superpowers/memory/patterns.md`)
3. Check consistency with similar existing components
4. Validate TypeScript — run `pnpm run build` (includes typecheck)
5. Describe what will change and why before applying
6. Create a descriptive branch (`feat/`, `fix/`, `chore/`, `docs/`)
7. Commit with Conventional Commits (commitlint enforced)
8. Open a PR with clear title and description
9. Wait for CI: format, lint, unit+coverage, build, E2E
10. Never push directly to `main`

**Definition of done:** PR open with green CI pipeline.

## 3. Commands

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

- **pnpm 9** only — never npm or yarn. `pnpm-lock.yaml` is source of truth.
- Dev server binds to `127.0.0.1` (not `localhost`) for Spotify OAuth.

## 4. Visual Anti-Patterns — NEVER

- Never use colors outside the design system palette
- Never use light mode or white backgrounds
- Never break full-width primary buttons
- Never put technical jargon in UI copy (the user is Marina)
- Never demote the hero photo — first image in `memory.images[]` is always dominant full-bleed
- Never unmount `MapView` during navigation — overlay pattern only
- Never expose `MAPBOX_TOKEN`, `SPOTIFY_CLIENT_SECRET`, or `CLOUDINARY_API_SECRET` to the client
- Never use `any` in TypeScript
- Never skip `alt` on images or `aria-label` on icon-only buttons

## 5. Do Not Change Without Asking

- Color palette and CSS custom properties in `globals.css`
- Memory data schema (`MemorySchema` / `ImageSchema` in `src/types/index.ts`)
- PIN authentication flow (`LockScreen`, `validatePin` server action, rate limiting)
- "Memory as Editorial" philosophy — hero photo dominant, editorial typography
- Any UI copy directed at Marina (intro, PIN messages, memory descriptions)
- Overlay pattern — never unmount the WebGL map
- BFF pattern for API secrets
- `lang="pt-BR"` on `<html>`

## 6. Memory Files (see `docs/superpowers/memory/`)

Always read on session start. Do not duplicate this content in conversation — reference the files.

| File              | Contents                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `architecture.md` | Stack, versions, commands, directory structure, data flow, key decisions, env vars                         |
| `decisions.md`    | ADR-style decision log                                                                                     |
| `patterns.md`     | Design system (colors, typography, radius, animations), quality conventions, code style, copy tone, naming |
| `known-issues.md` | Known issues and workarounds                                                                               |

## 7. Superpowers + ECC — Orchestration

This project uses **Superpowers** (methodological backbone) and **ECC** (specialized subagents on demand).

### Orchestration

- **Lifecycle flow:** Superpowers skills (brainstorming → spec → plan → TDD → review)
- **ECC subagents:** use on demand when the task requires extra depth
- **Conflict:** if both offer the same skill, Superpowers commands WHEN/HOW; ECC provides WHAT

### Available ECC Subagents

| Skill                | When                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| `ecc-security-audit` | Features with auth, APIs, sensitive data                                              |
| `ecc-deep-review`    | Deep review (security, performance, edge cases); complements `requesting-code-review` |
| `ecc-debug`          | Advanced debugging when `systematic-debugging` didn't resolve                         |

### Persistent Memory

On session start: read `docs/superpowers/memory/architecture.md` and `docs/superpowers/memory/decisions.md`.
After feature completion: ask to update memory files. Never remove — only add or mark resolved with ~~strikethrough~~.

### Context7

Primary channel for library docs. ECC does NOT replace Context7 for doc lookups.

## 8. Permissions

Both `edit` and `bash` are set to `"ask"` — request approval before modifying files or running commands.
