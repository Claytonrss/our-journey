# AGENTS.md — Our Journey

## 1. Project Identity

- **Name:** Our Journey
- **Purpose:** Interactive geo-spatial memory map — a romantic gift for Marina, also a technical portfolio showcase
- **Primary audience:** Marina (emotional UX, mobile-first, Portuguese copy)
- **Secondary audience:** Tech recruiters and engineers evaluating architecture, code quality, and product craft
- **Deploy URL:** https://our-journey-cm.vercel.app/map
- **What makes this project special:** Every UI decision serves an intimate editorial experience. Copy, colors, animations, and photo hierarchy are curated — not generic. Treat every change with product-level care, not boilerplate patterns.

---

## 2. Stack and Versions

Extracted from `package.json` — verify before assuming API compatibility.

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

### Commands

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

- `pnpm run build` includes typechecking — there is no separate `tsc` step.
- Dev server binds to `127.0.0.1` (not `localhost`) for Spotify OAuth redirect URI compatibility.

---

## 3. Design System — Golden Rules

All tokens live in `src/app/globals.css`. **Never hardcode colors outside this palette.**

### CSS Custom Properties

```css
--gold: #d4af37;
--gold-dim: rgba(212, 175, 55, 0.12);
--gold-line: rgba(212, 175, 55, 0.18);
--gold-glow: rgba(212, 175, 55, 0.25);
--bg-void: #080808;
--bg-panel: #101010;
--bg-surface: #161616;
--bg-elevated: #1c1c1c;
--text-warm: #f2ede4;
--text-muted: #6e6860;
--text-ghost: #2e2a28;
--color-brand-gold: #d4af37;
--color-brand-rose: #e8a598;
--color-brand-deep: #2d1b0e;
/* Semantic aliases */
--text-primary: var(--text-warm);
--text-secondary: var(--text-muted);
--text-date: var(--text-ghost);
```

Tailwind `@theme inline` maps: `--color-background`, `--color-foreground`, `--color-brand-gold`, `--font-sans`, `--font-ui`, `--font-display`, `--font-editorial`.

### Color Usage Rules

| Token                            | When to use                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| `--gold`                         | Primary accent: pin highlights (◆), dates, links, active states, icon fills |
| `--text-warm` / `--text-primary` | Main readable text: titles, body on dark backgrounds                        |
| `--text-muted`                   | Descriptions, secondary copy, long-form text                                |
| `--text-ghost` / `--text-date`   | De-emphasized dates, placeholders, error labels                             |
| `--bg-void`                      | Page canvas, full-screen backgrounds                                        |
| `--bg-panel`                     | Overlays, modals, sidebar panels                                            |
| `--bg-surface`                   | Card backgrounds, image placeholders                                        |
| `--bg-elevated`                  | Nested panels (player strip, elevated controls)                             |
| White (`#fff`, `neutral-100`)    | Only inside player track titles — sparingly                                 |

### Typography

Loaded in `src/app/layout.tsx` via `next/font/google`:

| Role               | Font                                | CSS Variable                         | Usage                                  |
| ------------------ | ----------------------------------- | ------------------------------------ | -------------------------------------- |
| UI / Body          | DM Sans (300, 400, 500)             | `--font-dm-sans` / `--font-ui`       | Buttons, labels, descriptions, player  |
| Display / Headings | Playfair Display (400, 600, italic) | `--font-playfair` / `--font-display` | Memory titles, dates, timeline headers |
| Editorial          | Lora (400, 500, italic)             | `--font-lora` / `--font-editorial`   | Intro screen copy                      |

Apply via `fontFamily: 'var(--font-playfair)'` in inline styles or Tailwind `font-[family-name:var(--font-playfair)]`. `<html lang="pt-BR">`.

### Border Radius by Context

| Element                         | Radius                 |
| ------------------------------- | ---------------------- |
| Primary button (`.btn-primary`) | 14px                   |
| Intro modal                     | 24px                   |
| Mobile bottom sheet             | 28px 28px 0 0          |
| Gallery images / cards          | 12px                   |
| Timeline hero (top)             | 16px (`rounded-t-2xl`) |
| Lightbox photo                  | 6px                    |
| Player pill                     | full (9999px)          |
| Close buttons                   | 50% (circle)           |

### Animation Rules

| Use Framer Motion                             | Use CSS `@keyframes`                      |
| --------------------------------------------- | ----------------------------------------- |
| Overlay enter/exit (slide, fade)              | Pin pulse/glow (`pin-pulse`, `pin-glow`)  |
| Lightbox transitions + drag gestures          | Compass rotation (`compass-rotate`, 120s) |
| Intro modal staggered reveal                  | PIN error shake (`shake`)                 |
| Parallax scroll (`useScroll`, `useTransform`) | Shimmer loading skeleton                  |
| Player album cover rotation                   | Heart glow, year-dot-pulse                |
| `AnimatePresence` mount/unmount               | Button hover (opacity + translateY)       |

Easing standard for overlays: `[0.16, 1, 0.3, 1]` (custom cubic-bezier). Duration: 0.4–0.5s for panels, 0.8s for intro fade.

### Responsiveness

- Mobile breakpoint: **768px** via `useIsMobile()` hook (`max-width: 767px`)
- Mobile-first for overlay layout (bottom sheet vs sidebar)
- Tailwind `md:` prefix for desktop adjustments in IntroScreen
- Touch targets: minimum 44–48px for interactive buttons

### Visual Anti-Patterns — NEVER Do

- Never use colors outside the palette (no blue links, no green success, no random hex)
- Never use light mode or white backgrounds
- Never break full-width primary buttons (`.btn-primary` is always `width: 100%`, `height: 52px`)
- Never put technical jargon in UI copy (the user is Marina, not a developer)
- Never demote the hero photo — first image in `memory.images[]` is always dominant full-bleed
- Never unmount `MapView` during navigation — overlay pattern only
- Never expose `MAPBOX_TOKEN`, `SPOTIFY_CLIENT_SECRET`, or `CLOUDINARY_API_SECRET` to the client
- Never use `any` in TypeScript — use Zod-inferred types or explicit interfaces
- Never skip `alt` on images or `aria-label` on icon-only buttons

---

## 4. Architecture and Code Patterns

### Directory Responsibilities

```
src/
├── app/            # App Router: pages, API routes (BFF), server actions
├── components/
│   ├── features/   # Feature-grouped: auth, map, overlay, player, timeline, IntroScreen
│   └── ui/         # Shared primitives: CompassRose, ViewToggle
├── hooks/          # Custom hooks + Zustand store (useAppStore)
├── lib/            # Pure utilities: cn(), env, memory-grouping, pin-validation
├── services/       # External integrations: Spotify, memory data, HTML5 audio
├── types/          # Zod schemas + TS types (Memory, AppState, CurrentTrack)
├── data/           # Static JSON: memories.json (generated), memories-source.json (source)
└── __tests__/      # Vitest tests mirroring src/ structure
scripts/            # generate-memories.ts (Cloudinary sync)
```

### Naming Conventions

- Components: PascalCase files and exports (`MapView.tsx`, `LockScreen.tsx`)
- Hooks: camelCase with `use` prefix (`useAppStore.ts`, `useMapFlyTo.ts`)
- Services: camelCase objects (`memoryService`, `spotifyService`)
- Types: PascalCase (`Memory`, `CurrentTrack`, `AppState`)
- Lib utilities: camelCase functions (`groupMemoriesByYear`, `validatePin`)

### Data Flow

1. **Source of truth:** `src/data/memories-source.json` (metadata + `cloudinaryFolder`)
2. **Generated artifact:** `src/data/memories.json` (via `pnpm run generate`)
3. **Validation:** `MemorySchema` / `ImageSchema` in `src/types/index.ts` (Zod)
4. **Service layer:** `memoryService.getMemories()` — dynamic import + Zod parse
5. **State:** Zustand `useAppStore` — `activeMemoryId`, `selectedMemoryId`, `viewMode`, audio, PIN
6. **Components:** receive typed props; never import JSON directly in UI components

### Component Structure Pattern

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

### Where NOT to Put Logic

- **No fetch in UI components** — use services (`memoryService`) or Route Handlers (BFF)
- **No API secrets in client code** — proxy via `src/app/api/`
- **No direct JSON imports in components** — go through `memoryService`
- **No business logic in page files** — extract to hooks or services

### Key Architectural Decisions

- **BFF pattern:** Spotify, Mapbox, Cloudinary secrets stay server-side
- **Overlay pattern:** Map WebGL never unmounts; content overlays on top
- **Auth:** NextAuth v5 beta (Spotify OAuth) + PIN lock via Server Action
- **Cloudinary:** `CldImage` with `publicId` from schema; transforms declarative
- **Audio:** Dual-mode — HTML5 local fallback + Spotify SDK via `GlobalAudio`

---

## 5. Quality Conventions

### TypeScript

- `strict: true` in `tsconfig.json`
- `any` is prohibited — use Zod inference (`z.infer<typeof MemorySchema>`) or explicit interfaces
- Prefer `interface` for component props and service contracts; `type` for Zod inference and unions
- Path alias: `@/*` → `./src/*`

### Accessibility Minimums

- All `<img>` / `CldImage` must have meaningful `alt` (auto-generated in script: `"Foto de {title} {n}: {filename}"`)
- Icon-only buttons must have `aria-label` (e.g., `'Pausar'`, `'Fechar painel'`, `'Foto anterior'`)
- Form inputs must be focusable and have visible focus states
- Color contrast: `--text-warm` on `--bg-void` meets WCAG AA

### Performance Checklist

- Hero images: `priority` prop on `CldImage`
- Gallery images: `loading="lazy"`, appropriate `sizes`
- Map: `reuseMaps` prop, never remount
- Animations: prefer `transform` and `opacity` (GPU-composited); avoid animating `width`/`height`
- New photos: verify Cloudinary transforms don't exceed viewport needs

### Visual Testing Before Done

1. Test mobile (≤767px) and desktop (≥768px)
2. Verify dark palette consistency — no stray colors
3. Check overlay transitions (open, close, drag-to-dismiss on mobile)
4. Confirm hero photo dominance in overlay and timeline cards
5. Run `pnpm run build` locally (includes typecheck)

### Testing

- **Unit:** Vitest + Testing Library — coverage thresholds enforced in CI (statements/lines ≥ 75%, branches/functions ≥ 80%)
- **E2E:** Playwright — PIN flow, map, timeline smoke tests
- **No test suite skip** — CI runs format, lint, unit+coverage, build, and E2E on every PR

### Code Style

- Prettier: single quotes, semicolons, trailing commas, 2-space indent
- Conventional Commits enforced by commitlint (husky `commit-msg` hook)
- lint-staged runs Prettier + ESLint on staged JS/TS files on pre-commit

---

## 6. Emotional Tone — Copy Calibration

This is a romantic gift. All user-facing text must reflect intimacy, warmth, and shared history.

### Voice Rules

- First person plural: "nós", "nossa", "a gente" — never third person
- Intimate but not cheesy — genuine, not Hallmark
- Portuguese (Brazil) — `lang="pt-BR"`, dates formatted with `toLocaleDateString('pt-BR')`
- Never use technical language in UI (no "loading", "error 404", "API", "token")

### Good vs Bad Copy Examples (from the codebase)

| Context          | Good                                                              | Bad                                     |
| ---------------- | ----------------------------------------------------------------- | --------------------------------------- |
| Intro            | "Cada pin neste mapa é um pedaço nosso."                          | "Clique nos markers para ver detalhes." |
| PIN error (1234) | "Sério? Essa é a primeira que todo mundo tenta."                  | "PIN inválido. Tente novamente."        |
| Audio default    | "Nossa Trilha" / "Amor & Viagem"                                  | "Background Music Player"               |
| CTA              | "Vamos lá"                                                        | "Continuar" / "Next"                    |
| Timeline link    | "Ver na timeline →"                                               | "Navigate to timeline view"             |
| Map fallback     | "Seu navegador não suporta WebGL, necessário para exibir o mapa." | "WebGL not supported"                   |

### Copy That Must Not Change Without Asking

- Intro screen paragraphs in `IntroScreen.tsx`
- PIN error messages in `src/lib/pin-validation.ts`
- Memory descriptions in `memories-source.json` / `memories.json`
- Timeline end note, headphones screen copy

---

## 7. Expected Workflow

For any task in this repository:

1. **Read relevant files** before proposing changes — never guess architecture
2. **Verify design system compliance** — colors, fonts, radius, animation rules
3. **Check consistency** with similar existing components
4. **Validate TypeScript** — run `pnpm run build` (includes typecheck)
5. **Describe what will change and why** before applying
6. **Create a descriptive branch** (`feat/`, `fix/`, `chore/`, `docs/`)
7. **Commit with Conventional Commits** message format
8. **Open a Pull Request** with clear title and description of what and why
9. **Wait for CI pipeline to pass** — format, lint, unit+coverage, build, E2E
10. **Never push directly to `main`** — all work goes through PR, no exceptions

**Definition of done:** A task is NOT complete until a PR is open with a green CI pipeline. Local implementation without PR does not count as delivery.

### Content Updates

Memory data lives in `src/data/memories-source.json` (metadata) and is generated into `src/data/memories.json` via `pnpm run generate`. Each memory entry requires: `id`, `title`, `date` (YYYY-MM-DD), `coordinates` (`{lat, lng}`), `isSpecialPin`, `description`, `cloudinaryFolder`. Generated JSON adds `images[]` with `publicId`, `alt`, `width`, `height`.

### Environment Variables

Copy `.env.example` → `.env.local`. See README for full list. Required: `SECRET_PIN`, `AUTH_SECRET`, `AUTH_URL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`, `MAPBOX_TOKEN`, `CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

---

## 8. Do Not Change Without Asking

- Color palette and CSS custom properties in `globals.css`
- Memory data schema (`MemorySchema` / `ImageSchema` in `src/types/index.ts`)
- PIN authentication flow (`LockScreen`, `validatePin` server action, rate limiting)
- "Memory as Editorial" philosophy — hero photo always dominant, editorial typography
- Any UI copy directed at Marina (intro, PIN messages, memory descriptions)
- Overlay pattern — never unmount the WebGL map
- BFF pattern for API secrets
- `lang="pt-BR"` on `<html>`

---

## Superpowers + ECC — Orchestration

This project uses **Superpowers** as the methodological backbone and **ECC** for on-demand specialization.

### Orchestration Rules

- **Lifecycle flow:** always follow Superpowers skills (brainstorming → spec → plan → TDD → review)
- **ECC subagents:** use on demand when the task requires extra depth or specialization
- **Conflict resolution:** if Superpowers and ECC offer the same skill, Superpowers commands WHEN and HOW; ECC provides WHAT

### Available ECC Subagents

| Skill                | When to use                                                                            |
| -------------------- | -------------------------------------------------------------------------------------- |
| `ecc-security-audit` | Features with auth, APIs, sensitive data. After implementation, before merge.          |
| `ecc-deep-review`    | Deep review (security, performance, edge cases). Complements `requesting-code-review`. |
| `ecc-debug`          | Advanced debugging when `systematic-debugging` didn't resolve it. Multi-system bugs.   |

### Persistent Memory

At session start, read `docs/superpowers/memory/`:

- `architecture.md` — Architectural decisions, stack, dependencies
- `decisions.md` — Decision log (ADR-style)
- `patterns.md` — Patterns and conventions
- `known-issues.md` — Known issues and workarounds

After completing a significant feature, ask if memory files should be updated.
NEVER remove information — only add or mark as resolved with ~~strikethrough~~.

### Context7 + Docs

Context7 is the primary channel for library documentation lookup. ECC skills do NOT replace Context7 for doc lookups.

---

## opencode.json Permissions

Both `edit` and `bash` are set to `"ask"` — the agent must request approval before modifying files or running shell commands.
