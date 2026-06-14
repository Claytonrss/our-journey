# Issues Conhecidas — Our Journey

## Vitest < 3.2.6 — CRITICAL (Resolvido)

- ~~CRITICAL: arbitrary file read/execute via Vitest UI server (GHSA-5xrq-8626-4rwp)~~

  ```

  ```

- **Resolução**: upgrade para Vitest 3.x (plano `2026-06-13-practical-improvements.md`)

## esbuild < 0.28.1 — HIGH (Resolvido)

- ~~HIGH: integridade de binário comprometida~~

  ```

  ```

- **Resolução**: atualização transitiva via upgrade do Vitest/Vite

## PIN sem rate limiting — HIGH (Resolvido)

- ~~4-digit PIN pode ser brute-forced em segundos~~

  ```

  ```

- **Resolução**: rate limiting 5 tentativas/60s implementado na server action (plano `2026-06-13-practical-improvements.md`)

## Token Mapbox sem restrição de origem — MEDIUM

- `/api/mapbox-token` retorna token para qualquer caller
- **Status**: requer restrição no painel Mapbox por URL + headers `Cache-Control`
- **Plano**: `2026-06-13-practical-improvements.md`

## Estado do PIN em memória — LOW

- `isPinValidated` vive apenas no Zustand (memória). Reload em `/map` perde acesso.
- **Status**: comportamento intencional por enquanto; avaliar persistência segura se necessário
- **Plano**: fase 3 do roadmap em `melhoria-plano.md`

## PostCSS em versão vulnerável — MODERATE

- postcss < 8.5.10, XSS em stringify CSS (via Next.js)

  ```

  ```

- **Status**: aguardando Next.js incorporar postcss >= 8.5.10
- **Mitigação**: monitorar advisories do Next.js

## PNPM audit — vulnerabilidades moderadas

- Vite <= 6.4.1 path traversal em optimized deps sourcemaps

  ```

  ```

- **Status**: aguardando resolução upstream
- **Mitigação**: ambiente de dev local; CI usa `--frozen-lockfile`

(Atualizado em 2026-06-14 — preencher ao longo das sessões)
