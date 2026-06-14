# Arquitetura — Our Journey

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Framer Motion
- NextAuth v5 beta com Spotify OAuth
- Mapbox GL via react-map-gl
- Cloudinary via next-cloudinary
- Zustand para estado global client-side
- Zod para contratos de dados
- Vitest + Testing Library para testes unitários
- Playwright para E2E

## Padrões Arquiteturais

- **BFF**: segredos no servidor (Spotify, Mapbox, Cloudinary). APIs proxy em `src/app/api/`
- **Overlay pattern**: nunca desmontar o mapa WebGL durante navegação
- **Memórias**: JSON versionado em `src/data/memories.json`, validado por Zod
- **Chave PIN**: server action em `src/app/actions/auth.ts`, validada server-side

## Dependências Críticas

- `react-map-gl`: renderização WebGL do mapa — nunca desmontar
- `next-auth@beta`: Spotify OAuth com refresh token em `src/auth.ts`
- `zustand`: estado global client-side (`useAppStore`)
- `zod`: validação de contratos (Memory, CurrentTrack, env)

## Decisões de Implementação

- Dev server em `127.0.0.1` (não `localhost`) para resolução de OAuth
- `next/font/google` para Inter (body) + Playfair Display (headings)
- `lang="pt-BR"` no `<html>`
- Permissões opencode: `edit: ask`, `bash: ask`

(Atualizado em 2026-06-14 — preencher ao longo das sessões)
