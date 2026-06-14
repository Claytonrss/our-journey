# Roadmap — Our Journey

## Fase 1 — Curto Prazo

**Objetivo:** estabilizar guardrails e riscos imediatos.

- [x] Atualizar Vitest/Vite/esbuild para corrigir advisories críticas/altas (`pnpm audit`)
- [x] Adicionar headers básicos de segurança em `next.config.ts`
- [x] Adicionar rate limiting na validação do PIN (5 tentativas, 60s lockout)
- [x] Corrigir warnings do lint e excluir `coverage/**` do ESLint
- [x] Melhorar pipeline CI (pnpm v4, caching, coverage upload)
- [x] Adicionar logger estruturado com redação de campos sensíveis
- [ ] Definir `turbopack.root` em `next.config.ts`
- [ ] Configurar headers de segurança CSP (complexo: Mapbox, Spotify, Cloudinary, next/font)

## Fase 2 — Médio Prazo

**Objetivo:** transformar CI em guardrail obrigatório antes de merge/deploy.

- [x] Corrigir docs desatualizados (sobre testes, build, Sentry, Mapbox)
- [x] Integrar Playwright E2E ao CI
- [ ] Tornar `test:coverage` obrigatório no CI (branch protection)
- [ ] Adicionar branch protection para todos os checks: format, lint, unit, build, E2E
- [ ] Padronizar erros e logs nos route handlers e services
- [ ] Revisar política do token Mapbox — adicionar restrição de origem no painel Mapbox

## Fase 3 — Longo Prazo

**Objetivo:** observabilidade e evolução sustentável.

- [ ] Implementar Sentry com source maps, release tracking e tracing leve
- [ ] Criar health check (`GET /api/health`)
- [ ] Capturar Web Vitals via `useReportWebVitals`
- [ ] Evoluir coverage de testes para componentes UI críticos
- [ ] Avaliar persistência segura do estado `isPinValidated` entre reloads
- [ ] Separar docs de "estado atual" e "visão futura" para evitar divergência

---

Dependência principal: a pipeline CI/CD com lint, typecheck/build, unit tests e E2E deve estar estável antes de aplicar melhorias maiores.
