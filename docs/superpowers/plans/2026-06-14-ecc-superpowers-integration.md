# ECC + Superpowers Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate ECC (Everything Claude Code) into the local dev environment with the hybrid approach: Superpowers as methodological backbone, ECC for specialized subagents on demand, and markdown-based persistent memory.

**Architecture:** Two-layer configuration — user-level (`~/.config/opencode/`) sets global ECC plugin + orchestration + env vars; project-level (`our-journey/`) extends with project-specific orchestrations, memory structure, and bridge skill instructions. ECC runs with `ECC_HOOK_PROFILE=minimal` and selective hook disabling to avoid conflicts with Superpowers.

**Tech Stack:** opencode CLI, Superpowers plugin, ECC plugin, markdown for memory

---

## File Structure

```
User-level (global):
├── ~/.config/opencode/opencode.jsonc          MODIFY — add ECC plugin
├── ~/.config/opencode/AGENTS.md               MODIFY — orchestration + bridge skills
└── ~/.config/opencode/.env                    CREATE — ECC env vars

Project-level (our-journey):
├── opencode.json                              MODIFY — add ECC plugin
├── AGENTS.md                                  MODIFY — orchestration + memory rules
├── docs/superpowers/memory/
│   ├── architecture.md                        CREATE — architecture decisions
│   ├── decisions.md                           CREATE — ADR-style log
│   ├── patterns.md                            CREATE — conventions
│   └── known-issues.md                        CREATE — issues + resolutions
```

---

## Task 1: Add ECC plugin to user-level opencode.jsonc

**Files:**

- Modify: `~/.config/opencode/opencode.jsonc`

- [ ] **Step 1: Read current config to confirm content**

Read the file to verify it matches what we expect before editing.

- [ ] **Step 2: Add ECC plugin to the plugin array**

Current config:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"],
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true,
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-591cbd67-2cac-4978-9215-3ccd48f830bf",
      },
    },
  },
}
```

Replace with:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "ecc@git+https://github.com/affaan-m/ECC.git",
  ],
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true,
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-591cbd67-2cac-4978-9215-3ccd48f830bf",
      },
    },
  },
}
```

- [ ] **Step 3: Create ECC env file at `~/.config/opencode/.env`**

Create `~/.config/opencode/.env`:

```
ECC_HOOK_PROFILE=minimal
ECC_DISABLED_HOOKS=pre:bash:tmux-reminder,post:edit:typecheck,session:start:context-injection
```

Rationale from spec: `minimal` turns off aggressive automatic ECC hooks. The three disabled hooks are the ones that most conflict with Superpowers skills (context-injection at session start, typecheck post-edit, tmux-reminder).

- [ ] **Step 4: Verify files were created/updated correctly**

Run:

```bash
cat ~/.config/opencode/opencode.jsonc
cat ~/.config/opencode/.env
```

Expected: `opencode.jsonc` contains `"ecc@git+https://github.com/affaan-m/ECC.git"` in the plugin array. `.env` contains the two ECC variables.

- [ ] **Step 5: Invoke a test skill to verify ECC is available**

After restarting opencode, try invoking a known ECC skill (e.g., `ecc:security-audit` or check if ECC agents appear in the available skills listing).

Note: The exact invocation mechanism depends on how ECC registers with opencode. If it adds to the `available_skills` list, the `skill` tool should pick it up. If ECC uses a different mechanism (e.g., slash commands or task agents), verify that method works.

- [ ] **Step 6: No commit needed for user-level**

User-level config lives outside the git repo. No commit.

---

## Task 2: Update user-level AGENTS.md with orchestration rules

**Files:**

- Modify: `~/.config/opencode/AGENTS.md`

- [ ] **Step 1: Read current AGENTS.md**

Current content:

```markdown
<!-- context7 -->

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words)
4. Answer using the fetched docs
<!-- context7 -->
```

Replace with:

```markdown
<!-- context7 -->

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words)
4. Answer using the fetched docs
<!-- context7 -->

<!-- superpowers-ecc-orchestration -->

## Superpowers vs ECC — Regras de Orquestração

Este ambiente usa **dois plugins complementares**:

- **Superpowers**: espinha dorsal metodológica (brainstorming -> spec -> plano -> TDD -> review)
- **ECC**: subagentes especializados sob demanda (security audit, deep code review, debug avançado)

### Fluxo de Vida (sempre Superpowers)

O fluxo de desenvolvimento segue as skills do Superpowers:

1. brainstorming — explora requisitos e design
2. writing-plans — cria plano de implementação detalhado
3. test-driven-development — Red-Green-Refactor
4. requesting-code-review — verificação antes de merge

### Subagentes ECC (sob demanda)

Quando a tarefa requer especialização que o Superpowers não cobre ou pede profundidade extra:

- **Security audit**: rodar auditoria de segurança completa em arquivos/diretórios
- **Deep code review**: review profundo focado em security, performance, edge cases
- **Debug avançado**: debug sistemático com rastreamento de causa raiz e logs estruturados

### Regras de Conflito

Quando Superpowers e ECC oferecem skills sobrepostas:
| Capacidade | Escolha |
|-----------|---------|
| **TDD** | SEMPRE Superpowers (`test-driven-development`) |
| **Code Review** | Superpowers primeiro (`requesting-code-review`). ECC depois (`ecc-deep-review`) se precisar profundidade |
| **Debug** | Superpowers primeiro (`systematic-debugging`). ECC depois se não resolver |
| **Security** | ECC (Superpowers não tem equivalente) |
| **Memória** | Custom (markdown em `docs/superpowers/memory/` no projeto) |

### Context7

Continua como canal primário para documentação de libs. NÃO usar ECC skills para lookup de docs de bibliotecas.

<!-- superpowers-ecc-orchestration -->

<!-- ecc-bridge-skills -->

## Bridge Skills — Quando e Como Invocar ECC

### ecc-security-audit

**Quando invocar**: Após implementar features que envolvem auth, APIs externas, manipulação de tokens, validação de input, ou dados sensíveis. Também quando solicitado explicitamente.

**Como usar**:

1. Identificar escopo: quais arquivos/diretórios auditar (ex: `src/app/api/`, `src/auth.ts`, `src/app/actions/`)
2. Invocar ECC security-auditor agent com o escopo definido
3. Receber relatório com vulnerabilidades classificadas por severidade
4. Apresentar achados ao usuário com ações recomendadas
5. NUNCA modificar código diretamente durante a auditoria — apenas reportar

### ecc-deep-review

**Quando invocar**: Antes de merge/PR de features significativas (>50 linhas mudadas, nova rota API, mudança em auth), OU quando o `requesting-code-review` do Superpowers identificar pontos que precisam de análise mais profunda.

**Como usar**:

1. Executar `requesting-code-review` do Superpowers primeiro (fluxo metodológico)
2. Se o review identificar áreas de risco não triviais, invocar ECC code-reviewer nas áreas específicas
3. Combinar achados do Superpowers + ECC em relatório consolidado
4. Priorizar vulnerabilidades reais sobre falsos positivos

### ecc-debug

**Quando invocar**: Quando a skill `systematic-debugging` do Superpowers não identificar a causa raiz após uma iteração completa, OU quando o bug envolve múltiplos sistemas (ex: auth + Spotify + Mapbox).

**Como usar**:

1. Executar `systematic-debugging` do Superpowers primeiro
2. Documentar hipóteses e evidências coletadas
3. Se não resolver, invocar ECC debugger com as hipóteses documentadas
4. Rastreamento de causa raiz com logs estruturados
5. Reportar achados e atualizar `known-issues.md` no projeto

### session-memory

**Quando invocar**: Automaticamente no início de cada sessão (ler) e ao completar features significativas (escrever). NÃO é um agente ECC — é uma instrução embutida.

**Como usar (início da sessão)**:

1. Verificar se existe `docs/superpowers/memory/` no projeto atual
2. Se existir, ler `architecture.md` e `decisions.md` para recuperar contexto
3. Usar o contexto lido durante a sessão

**Como usar (fim de feature)**:

1. Perguntar ao usuário: "Atualizar a memória do projeto?"
2. Se sim, atualizar os arquivos relevantes:
   - `architecture.md`: mudanças na stack, dependências, padrões
   - `decisions.md`: novas decisões (ADR-style: data, contexto, decisão, consequências)
   - `patterns.md`: novas convenções ou padrões descobertos
   - `known-issues.md`: issues encontradas (marcar resolvidas com ~~strikethrough~~)
3. NUNCA remover informações — apenas adicionar ou marcar como resolvido
<!-- ecc-bridge-skills -->
```

- [ ] **Step 2: Verify file was updated**

Run:

```bash
wc -l ~/.config/opencode/AGENTS.md
grep -c "superpowers-ecc-orchestration" ~/.config/opencode/AGENTS.md
grep -c "ecc-bridge-skills" ~/.config/opencode/AGENTS.md
```

Expected: At least 100+ lines. Both markers found exactly once.

- [ ] **Step 3: No commit needed for user-level**

---

## Task 3: Add ECC plugin to project-level opencode.json

**Files:**

- Modify: `our-journey/opencode.json`

- [ ] **Step 1: Read current project opencode.json**

Current content:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  }
}
```

Replace with:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "ecc@git+https://github.com/affaan-m/ECC.git"
  ],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  }
}
```

- [ ] **Step 2: Verify file was updated**

Run:

```bash
cat opencode.json
```

Expected: Contains `"ecc@git+https://github.com/affaan-m/ECC.git"` and permissions still `ask/ask`.

---

## Task 4: Update project-level AGENTS.md

**Files:**

- Modify: `our-journey/AGENTS.md`

- [ ] **Step 1: Read current AGENTS.md**

Current content starts with `# AGENTS.md — Our Journey` and ends with the opencode.json permissions note (75 lines). The full current content should be read before editing.

- [ ] **Step 2: Append ECC orchestration + memory section**

Add to the END of the file (after the "opencode.json permissions" section, before the final backticks if any):

```markdown
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
```

- [ ] **Step 3: Verify file was updated**

Run:

```bash
grep -n "ECC — Orquestração" AGENTS.md
grep -n "docs/superpowers/memory" AGENTS.md
```

Expected: Both patterns found with line numbers.

---

## Task 5: Create memory directory structure

**Files:**

- Create: `our-journey/docs/superpowers/memory/architecture.md`
- Create: `our-journey/docs/superpowers/memory/decisions.md`
- Create: `our-journey/docs/superpowers/memory/patterns.md`
- Create: `our-journey/docs/superpowers/memory/known-issues.md`

- [ ] **Step 1: Create the memory directory**

Run:

```bash
mkdir -p docs/superpowers/memory
```

- [ ] **Step 2: Create `docs/superpowers/memory/architecture.md`**

```markdown
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
```

- [ ] **Step 3: Create `docs/superpowers/memory/decisions.md`**

```markdown
# Decisões — Our Journey

## ADR-001: Arquitetura BFF para Segredos de API

- **Data**: 2026-06-01 (estimado)
- **Contexto**: Spotify Client Secret e Mapbox Token precisam ficar no servidor
- **Decisão**: Route Handlers em `src/app/api/` fazem proxy; nunca expor `SPOTIFY_CLIENT_SECRET` ou `MAPBOX_TOKEN` ao client
- **Consequências**: Latência extra na chamada client → route handler → API externa. Segredos protegidos.

## ADR-002: Chave PIN com Server Action

- **Data**: 2026-06-01 (estimado)
- **Contexto**: Controle de acesso local antes da autenticação Spotify
- **Decisão**: Server action `validatePin()` em `src/app/actions/auth.ts` com rate limiting (5 tentativas/60s)
- **Consequências**: PIN validado server-side. Rate limiting em memória (reinicia no cold start).

## ADR-003: Overlay Pattern para Mapa WebGL

- **Data**: 2026-06-01 (estimado)
- **Contexto**: WebGL context é caro para recriar; navegação entre views não deve desmontar o mapa
- **Decisão**: `MapView` com `reuseMaps`. Overlays renderizam sobre o mapa sem desmontá-lo
- **Consequências**: Gerenciamento de z-index para overlays. Mapa sempre presente em memória.

## ADR-004: Integração Superpowers + ECC (Híbrido Minimal)

- **Data**: 2026-06-14
- **Contexto**: Superpowers oferece disciplina metodológica; ECC oferece subagentes especializados. Ambos podem conflitar.
- **Decisão**: Abordagem híbrida: Superpowers como espinha dorsal, ECC com `ECC_HOOK_PROFILE=minimal`. Bridge skills em AGENTS.md. Memória em markdown versionado.
- **Consequências**: Dois plugins para manter. Hooks do ECC desligados seletivamente. Memória manual (não automática).

(Adicionar novas decisões ao longo das sessões)
```

- [ ] **Step 4: Create `docs/superpowers/memory/patterns.md`**

```markdown
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
├── app/ # App Router pages, API routes, server actions
├── components/
│ ├── features/ # Feature-grouped: auth, map, player, IntroScreen, overlay
│ └── ui/ # Shared UI primitives
├── hooks/ # Custom hooks + Zustand store
├── lib/ # Utilities (cn(), env, logger, publicEnv)
├── services/ # External API integrations (Spotify, memory, audio)
├── types/ # Zod schemas + TS types
└── data/ # Static content: memories.json

```

## Padrões de Nomenclatura
- Componentes: PascalCase (LockScreen, MapView)
- Hooks: camelCase prefix `use` (useAppStore, useMapFlyTo)
- Services: camelCase (spotifyService, memoryService)
- Types: PascalCase (Memory, CurrentTrack)

(Atualizado em 2026-06-14 — preencher ao longo das sessões)
```

- [ ] **Step 5: Create `docs/superpowers/memory/known-issues.md`**

````markdown
# Issues Conhecidas — Our Journey

## Vitest < 3.2.6 — CRITICAL (Resolvido)

- ```CRITICAL: arbitrary file read/execute via Vitest UI server (GHSA-5xrq-8626-4rwp)~~~

  ```
````

- **Resolução**: upgrade para Vitest 3.x (plano `2026-06-13-practical-improvements.md`)

## esbuild < 0.28.1 — HIGH (Resolvido)

- ```HIGH: integridade de binário comprometida~~~

  ```

- **Resolução**: atualização transitiva via upgrade do Vitest/Vite

## PIN sem rate limiting — HIGH (Resolvido)

- ```4-digit PIN pode ser brute-forced em segundos~~~

  ```

- **Resolução**: rate limiting 5 tentativas/60s implementado na server action (plano `2026-06-13-practical-improvements.md`)

## Token Mapbox sem restrição de origem — MEDIUM

- `/api/mapbox-token` retorna token para qualquer caller
- **Status**: requer restrição no painel Mapbox por URL + headers `Cache-Control`
- **Plano**: `2026-06-13-practical-improvements.md`

## Estato do PIN em memória — LOW

- `isPinValidated` vive apenas no Zustand (memória). Reload em `/map` perde acesso.
- **Status**: comportamento intencional por enquanto; avaliar persistência segura se necessário
- **Plano**: fase 3 do roadmap em `melhoria-plano.md`

## PostCSS em versão vulnerável — MODERATE

- ```postcss < 8.5.10, XSS em stringify CSS (via Next.js)~~~

  ```

- **Status**: aguardando Next.js incorporar postcss >= 8.5.10
- **Mitigação**: monitorar advisories do Next.js

## PNPM audit — vulnerabilidades moderadas

- ```Vite <= 6.4.1 path traversal em optimized deps sourcemaps~~~

  ```

- **Status**: aguardando resolução upstream
- **Mitigação**: ambiente de dev local; CI usa `--frozen-lockfile`

(Atualizado em 2026-06-14 — preencher ao longo das sessões)

````

- [ ] **Step 6: Verify all files were created**

Run:

```bash
ls -la docs/superpowers/memory/
wc -l docs/superpowers/memory/*.md
````

Expected: 4 files, each with content.

---

## Task 6: Commit all project-level changes

**Files:**

- opencode.json
- AGENTS.md
- docs/superpowers/memory/architecture.md
- docs/superpowers/memory/decisions.md
- docs/superpowers/memory/patterns.md
- docs/superpowers/memory/known-issues.md

- [ ] **Step 1: Stage all files**

Run:

```bash
git add opencode.json AGENTS.md docs/superpowers/memory/
```

- [ ] **Step 2: Verify staged files**

Run:

```bash
git status
git diff --cached --stat
```

Expected: 6 files staged (opencode.json, AGENTS.md, 4 memory files).

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: integrate ECC with Superpowers hybrid approach

- Add ECC plugin to opencode.json (project-level)
- Update AGENTS.md with ECC orchestration rules and memory paths
- Create docs/superpowers/memory/ with architecture, decisions, patterns, known-issues"
```

- [ ] **Step 4: Verify commit**

Run:

```bash
git log -1 --stat
```

Expected: One commit with all 6 files.

---

## Decision Summary

| Decision                 | Choice                                                         |
| ------------------------ | -------------------------------------------------------------- |
| ECC installation         | Plugin via opencode.json (both user-level and project-level)   |
| Hook conflict resolution | `ECC_HOOK_PROFILE=minimal` + `ECC_DISABLED_HOOKS`              |
| Bridge skills location   | AGENTS.md (both user-level and project-level)                  |
| Memory persistence       | Markdown in `docs/superpowers/memory/`, manual update          |
| Skill overlap            | Superpowers for flow, ECC for depth                            |
| Permissions              | Kept `ask/ask`                                                 |
| Coding model             | Same opencode agent, orchestrating ECC agents via instructions |
