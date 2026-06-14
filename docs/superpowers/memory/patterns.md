# Padrões — Our Journey

## Convenções de Código

- Prettier: single quotes, semicolons, trailing commas, 2-space indent
- Conventional Commits (commitlint + husky)
- Tailwind: classes merged via `cn()` helper de `@/lib/utils`
- Fonts: Inter (body) + Playfair Display (headings) via `next/font/google`
- `lang="pt-BR"` no `<html>`

## Convenções de Teste

- Vitest para unitário, Playwright para E2E
- Coverage thresholds: statements/lines >= 75%, branches >= 80%, functions >= 80%
- Mocks de env com `vi.stubEnv()`
- Mock modules com `vi.mock()` ou `vi.doMock()`
- Testes de erro silenciam `console.error` com `vi.spyOn(console, 'error')`

## Estrutura de Diretórios

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

## Padrões de Nomenclatura

- Componentes: PascalCase (LockScreen, MapView)
- Hooks: camelCase prefix `use` (useAppStore, useMapFlyTo)
- Services: camelCase (spotifyService, memoryService)
- Types: PascalCase (Memory, CurrentTrack)

(Atualizado em 2026-06-14 — preencher ao longo das sessões)
