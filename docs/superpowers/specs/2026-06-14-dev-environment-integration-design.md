# Dev Environment Integration Design: Superpowers + ECC Híbrido

**Data**: 2026-06-14
**Status**: Aprovado
**Abordagem**: ECC Minimal + Superpowers como Espinha Dorsal (Abordagem A)

---

## 1. Resumo

Integrar o ECC (Everything Claude Code) ao ambiente de desenvolvimento local do our-journey, adotando uma abordagem híbrida onde o Superpowers dita o fluxo metodológico (brainstorming -> spec -> plano -> TDD -> review) e o ECC fornece subagentes especializados sob demanda (security audit, deep code review, debug sistemático). A memória persistente usa markdown versionado no repo.

A integração opera em dois níveis:

- **User-level** (`~/.config/opencode/`): configuração global que se aplica a todos os projetos
- **Project-level** (`our-journey/`): configuração específica do projeto + estrutura de memória + bridge skills

---

## 2. Contexto Atual

### 2.1 User-level atual

| Arquivo                             | Conteúdo                                               |
| ----------------------------------- | ------------------------------------------------------ |
| `~/.config/opencode/opencode.jsonc` | Superpowers plugin + Context7 MCP                      |
| `~/.config/opencode/AGENTS.md`      | Instruções Context7 (resolve-library-id -> query-docs) |
| `~/.config/opencode/plugins/rtk.ts` | Plugin custom que reescreve comandos bash via `rtk`    |

### 2.2 Project-level atual

| Arquivo                     | Conteúdo                                         |
| --------------------------- | ------------------------------------------------ |
| `our-journey/opencode.json` | Superpowers plugin, permissões ask/ask           |
| `our-journey/AGENTS.md`     | Arquitetura, comandos pnpm, env vars, convencoes |
| `docs/superpowers/plans/`   | 3 planos de melhoria já executados               |

### 2.3 ECC (Everything Claude Code)

- Repo: `github.com/affaan-m/ECC`
- 215K+ stars, suporta opencode desde v1.3.0
- 64 agents, 262 skills, hooks configuráveis
- Controle de conflitos via `ECC_HOOK_PROFILE` e `ECC_DISABLED_HOOKS`

---

## 3. Design

### 3.1 Configuração Global (user-level)

#### `~/.config/opencode/opencode.jsonc`

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
        "CONTEXT7_API_KEY": "ctx7sk-...",
      },
    },
  },
}
```

#### Variáveis de ambiente (shell profile ou `~/.config/opencode/.env`)

```
ECC_HOOK_PROFILE=minimal
ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck,session:start:context-injection"
```

Rationale:

- `minimal` desliga hooks automáticos agressivos do ECC, deixando o Superpowers no comando da esteira
- Os hooks desabilitados são os que mais conflitam com as skills do Superpowers (context-injection no session:start, typecheck pós-edit, tmux-reminder)

#### `~/.config/opencode/AGENTS.md`

Manter instruções existentes do Context7 e adicionar seção de orquestração:

```markdown
## Superpowers vs ECC — Regras de Orquestração

### Fluxo de Vida (sempre Superpowers)

O fluxo de desenvolvimento segue as skills do Superpowers:
brainstorming -> spec -> plano -> TDD (Red-Green-Refactor) -> review

### Subagentes Especializados (ECC sob demanda)

Quando a tarefa requer especialização que o Superpowers não cobre:

- **Security audit**: invocar skill `ecc-security-audit`
- **Deep code review**: invocar skill `ecc-deep-review` (complementa, não substitui, `requesting-code-review` do Superpowers)
- **Debug sistemático avançado**: invocar skill `ecc-debug` quando `systematic-debugging` do Superpowers não resolver

### Conflito de Skills

Quando Superpowers e ECC oferecem a mesma capacidade:

- **TDD**: preferir `test-driven-development` do Superpowers
- **Code Review**: usar fluxo do Superpowers (`requesting-code-review`) + profundidade do ECC (`ecc-deep-review`)
- **Debug**: usar fluxo do Superpowers (`systematic-debugging`) + profundidade do ECC (`ecc-debug`)
- **Security**: usar ECC (Superpowers não tem equivalente)
- **Memoria**: usar skill customizada `session-memory` (markdown no repo)

### Context7

Continua como canal primário para documentação de libs. Não substituir por skills ECC para lookup de docs.
```

---

### 3.2 Configuração do Projeto (project-level)

#### `our-journey/opencode.json`

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "ecc@git+https://github.com/affaan-m/ECC.git",
  ],
  "permission": {
    "edit": "ask",
    "bash": "ask",
  },
}
```

#### `our-journey/AGENTS.md`

Ampliar com as regras de orquestração e memória:

```markdown
## Superpowers + ECC — Orquestração

Este projeto usa Superpowers como espinha dorsal metodológica e ECC para especialização sob demanda.

### Fluxo

1. Sempre seguir skills do Superpowers para o fluxo de vida
2. Ao iniciar sessão, ler `docs/superpowers/memory/architecture.md` e `docs/superpowers/memory/decisions.md`
3. Ao completar feature significativa, atualizar `docs/superpowers/memory/`
4. Em caso de conflito de skills, Superpowers comanda QUANDO e COMO; ECC fornece O QUÊ

### Subagentes ECC disponíveis

- `ecc-security-audit`: auditoria de segurança (auth, APIs, dados sensíveis)
- `ecc-deep-review`: review profundo (security, performance, edge cases)
- `ecc-debug`: debug sistemático avançado com rastreamento de causa raiz

### Memória Persistente

- Arquitetura: `docs/superpowers/memory/architecture.md`
- Decisões: `docs/superpowers/memory/decisions.md`
- Padrões: `docs/superpowers/memory/patterns.md`
- Issues conhecidas: `docs/superpowers/memory/known-issues.md`
```

---

### 3.3 Estrutura de Memória

```
docs/superpowers/memory/
├── architecture.md      # Decisões arquiteturais, stack, dependências
├── decisions.md          # Registro de decisões (ADR-style)
├── patterns.md           # Padrões e convenções adotados
└── known-issues.md       # Issues conhecidas e workarounds
```

Cada arquivo segue um template:

**architecture.md**:

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

## Padrões

- BFF: segredos no servidor, APIs proxy em src/app/api/
- Overlay pattern: nunca desmontar o mapa WebGL
- Memórias: JSON validado por Zod em src/data/

## Dependências Críticas

(sem conteúdo ainda — preencher ao longo das sessões)
```

**decisions.md**:

```markdown
# Decisões — Our Journey

## ADR-001: [Título]

- **Data**: YYYY-MM-DD
- **Contexto**: ...
- **Decisão**: ...
- **Consequências**: ...

(Adicionar novas decisões ao longo das sessões)
```

**patterns.md**:

```markdown
# Padrões — Our Journey

## Convencoes de Código

- Prettier: single quotes, semicolons, trailing commas, 2-space indent
- Conventional Commits (commitlint)
- Tailwind: cn() helper de @/lib/utils
- Fonts: Inter (body) + Playfair Display (headings)

## Convencoes de Teste

- Vitest para unitário, Playwright para E2E
- Coverage thresholds: statements/lines >= 75%, branches >= 80%, functions >= 80%

(Adicionar padrões ao longo das sessões)
```

**known-issues.md**:

````markdown
# Issues Conhecidas — Our Journey

## Vitest < 3.2.6 (Resolvido)

- ```CRITICAL: arbitrary file read/execute no Vitest UI~~~

  ```
````

- Resolvido em: upgrade para Vitest 3.x (plano practical-improvements)

## PIN sem rate limiting (Resolvido)

- ```4-digit PIN pode ser brute-forced~~~

  ```

- Resolvido em: rate limiting 5 tentativas/60s (plano practical-improvements)

(Adicionar novas issues ao longo das sessões)

```

---

### 3.4 Bridge Skills

4 skills customizadas que orquestram ECC a partir do Superpowers:

#### `ecc-security-audit` (global — local exato a confirmar na instalação do ECC; provavelmente `~/.opencode/skills/` ou `~/.config/opencode/skills/`)

**Propósito**: Delegate security auditing to ECC's security-auditor agent. Invocar após implementação de features que envolvem auth, APIs ou dados sensiveis.

**Trigger**: Quando uma task envolve auth, APIs externas, dados sensíveis, ou foi solicitado explicitamente.

**Comportamento**:

1. Identificar escopo (arquivos/diretórios a auditar)
2. Invocar ECC security-auditor agent com o escopo
3. Receber relatório de vulnerabilidades com severidade
4. Apresentar achados ao user com ações recomendadas
5. Não modificar código diretamente — apenas reportar

#### `ecc-deep-review` (global — mesmo local das outras bridge skills)

**Propósito**: Deep code review complementar ao `requesting-code-review` do Superpowers. Foca em security, performance e edge cases.

**Trigger**: Antes de merge/PR de features significativas, OU quando invocado explicitamente.

**Comportamento**:

1. Rodar `requesting-code-review` do Superpowers primeiro (fluxo metodológico)
2. Se o review do Superpowers identificar pontos que precisam de profundidade, invocar ECC code-reviewer
3. Combinar achados e apresentar relatório consolidado
4. Priorizar vulnerabilidades reais sobre falsos positivos

#### `ecc-debug` (global — mesmo local das outras bridge skills)

**Propósito**: Debug sistemático avançado quando `systematic-debugging` do Superpowers não resolveu.

**Trigger**: Quando a abordagem de debug do Superpowers não identificar a causa raiz, OU quando invocado explicitamente.

**Comportamento**:

1. Rodar `systematic-debugging` do Superpowers primeiro
2. Se não resolver, invocar ECC debugger com hipóteses documentadas
3. Rastreamento de causa raiz com logs estruturados
4. Reportar achados e atualizar `known-issues.md`

#### `session-memory` (global — mesmo local das outras bridge skills)

**Propósito**: Persistir e recuperar contexto entre sessões usando markdown no repo.

**Trigger**: Automático no início de cada sessão (ler) e ao completar features significativas (escrever).

**Comportamento**:

1. Ao iniciar: ler `docs/superpowers/memory/` e injetar contexto na conversa
2. Ao completar feature: perguntar ao user se deve atualizar arquivos de memória
3. Atualizar `architecture.md`, `decisions.md`, `patterns.md` ou `known-issues.md` conforme relevante
4. Nunma remover informações — apenas adicionar ou marcar como resolvido com ~~strikethrough~~

---

### 3.5 Resolução de Conflitos

| Conflito                                                       | Resolução                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| Hooks duplicados (context-injection, typecheck, tmux-reminder) | `ECC_HOOK_PROFILE=minimal` + `ECC_DISABLED_HOOKS`                  |
| Skills sobrepostas (TDD, review, debug)                        | Superpowers comanda fluxo; ECC complementa profundidade            |
| Memória                                                        | Custom `session-memory` skill em markdown, não `ecc:memory` nativo |
| Chamadas simultâneas                                           | Bridge skills são sequenciais: Superpowers primeiro, ECC depois    |

### 3.6 Integração com Planos Existentes

Os planos já existentes em `docs/superpowers/plans/` continuam válidos:

- `2026-06-13-unit-tests.md` — executado
- `2026-06-13-practical-improvements.md` — em andamento
- `2026-06-14-coverage-e2e.md` — pendente

Esta integração NÃO invalida nenhum plano. Ela melhora o ambiente de execução: quando os planos forem executados, os subagentes ECC estarão disponíveis para auditoria de segurança (security-audit) e review profundo (deep-review).

---

## 4. Decisões

| Decisão                 | Escolha                                                    | Rationale                                                                        |
| ----------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Abordagem de integração | ECC Minimal + Superpowers como espinha dorsal              | Disciplina do fluxo + ferramental especializado. Hooks mínimos evitam conflitos. |
| Memória persistente     | Markdown em `docs/superpowers/memory/`                     | Versionado no git, legível por humanos, editável manualmente                     |
| Skills sobrepostas      | Superpowers comanda fluxo, ECC complementa                 | Mantém disciplina metodológica enquanto ganha profundidade                       |
| Local das bridge skills | Global (path exato depende da instalacao do ECC)           | Precisa confirmar durante instalacao                                             |
| Configuração ECC        | `ECC_HOOK_PROFILE=minimal` + hooks desabilitados seletivos | Minimiza conflitos com Superpowers                                               |
| Permissões              | Mantido `ask/ask`                                          | Controle humano sobre modificações                                               |
```
