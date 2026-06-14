# Patterns — Our Journey

## Design System — Golden Rules

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

### Color Usage

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

Apply via `fontFamily: 'var(--font-playfair)'` in inline styles or Tailwind `font-[family-name:var(--font-playfair)]`.

### Border Radius

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

Easing for overlays: `[0.16, 1, 0.3, 1]` (custom cubic-bezier). Duration: 0.4–0.5s panels, 0.8s intro fade.

### Responsiveness

- Mobile breakpoint: **768px** via `useIsMobile()` hook (`max-width: 767px`)
- Mobile-first for overlay layout (bottom sheet vs sidebar)
- Tailwind `md:` for desktop adjustments
- Touch targets: minimum 44–48px

---

## Quality Conventions

### TypeScript

- `strict: true` in `tsconfig.json`
- `any` is prohibited — use Zod inference or explicit interfaces
- Prefer `interface` for component props; `type` for Zod inference and unions
- Path alias: `@/*` → `./src/*`

### Accessibility

- All `<img>` / `CldImage` must have meaningful `alt`
- Icon-only buttons must have `aria-label`
- Form inputs must be focusable with visible focus states
- Color contrast: `--text-warm` on `--bg-void` meets WCAG AA

### Performance

- Hero images: `priority` prop on `CldImage`
- Gallery images: `loading="lazy"`, appropriate `sizes`
- Map: `reuseMaps` prop, never remount
- Animations: prefer `transform` and `opacity` (GPU-composited)
- New photos: verify Cloudinary transforms don't exceed viewport needs

### Testing

- **Unit:** Vitest + Testing Library — thresholds: statements/lines ≥ 75%, branches/functions ≥ 80%
- **E2E:** Playwright — PIN flow, map, timeline smoke tests
- **CI:** format, lint, unit+coverage, build, E2E on every PR
- Mocks: `vi.stubEnv()` for env vars, `vi.mock()`/`vi.doMock()` for modules
- Error tests: silence `console.error` with `vi.spyOn(console, 'error')`

### Code Style

- Prettier: single quotes, semicolons, trailing commas, 2-space indent
- Conventional Commits enforced by commitlint (husky `commit-msg` hook)
- lint-staged runs Prettier + ESLint on staged JS/TS files on pre-commit

---

## Directory Structure

```
src/
├── app/            # App Router pages, API routes, server actions
├── components/
│   ├── features/   # Feature-grouped: auth, map, player, IntroScreen, overlay
│   └── ui/         # Shared UI primitives
├── hooks/          # Custom hooks + Zustand store
├── lib/            # Utilities (cn(), env, memory-grouping, navigation-utils, pin-validation, publicEnv)
├── services/       # External API integrations (Spotify, memory, audio)
├── types/          # Zod schemas + TS types
└── data/           # Static content: memories.json
```

## Naming Conventions

- Componentes: PascalCase (LockScreen, MapView)
- Hooks: camelCase prefix `use` (useAppStore, useMapFlyTo)
- Services: camelCase (spotifyService, memoryService)
- Types: PascalCase (Memory, CurrentTrack)
- Lib: camelCase functions (groupMemoriesByYear, validatePin)

## Copy & Emotional Tone

This is a romantic gift. All user-facing text must reflect intimacy, warmth, and shared history.

### Voice Rules

- First person plural: "nós", "nossa", "a gente" — never third person
- Intimate but not cheesy — genuine, not Hallmark
- Portuguese (Brazil) — `lang="pt-BR"`, dates via `toLocaleDateString('pt-BR')`
- Never use technical language in UI (no "loading", "error 404", "API", "token")

### Good vs Bad Copy

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

## Visual Anti-Patterns — NEVER Do

- Never use colors outside the palette (no blue links, no green success, no random hex)
- Never use light mode or white backgrounds
- Never break full-width primary buttons (`.btn-primary` is always `width: 100%`, `height: 52px`)
- Never put technical jargon in UI copy (the user is Marina, not a developer)
- Never demote the hero photo — first image in `memory.images[]` is always dominant full-bleed
- Never unmount `MapView` during navigation — overlay pattern only
- Never expose `MAPBOX_TOKEN`, `SPOTIFY_CLIENT_SECRET`, or `CLOUDINARY_API_SECRET` to the client
- Never use `any` in TypeScript — use Zod-inferred types or explicit interfaces
- Never skip `alt` on images or `aria-label` on icon-only buttons

(Updated 2026-06-14 — fill in as sessions progress)
