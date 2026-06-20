# Our Journey

**Cada pin é um pedaço nosso — um mapa vivo das viagens, encontros e histórias que só nós dois sabemos.**

https://github.com/user-attachments/assets/04dad2f8-7783-4e68-ac25-02c106d60ccf

Um projeto interativo que cataloga 38 locais que visitamos, combinando navegação geo-espacial, visualização de fotos e trilha sonora ambiente. Construído inicialmente como um presente, este repositório também serve como um showcase técnico de engenharia front-end.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-080808?style=flat-square&logo=next.js&logoColor=D4AF37)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-080808?style=flat-square&logo=typescript&logoColor=D4AF37)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-080808?style=flat-square&logo=tailwindcss&logoColor=D4AF37)](https://tailwindcss.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL-080808?style=flat-square&logo=mapbox&logoColor=D4AF37)](https://www.mapbox.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-080808?style=flat-square&logo=cloudinary&logoColor=D4AF37)](https://cloudinary.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-080808?style=flat-square&logo=framer&logoColor=D4AF37)](https://www.framer.com/motion/)
<br>
[![CI Pipeline](https://img.shields.io/github/actions/workflow/status/Claytonrss/our-journey/ci.yml?style=flat-square&logo=githubactions&logoColor=D4AF37&label=CI%20Pipeline)](https://github.com/Claytonrss/our-journey/actions)
[![Vitest & Playwright](https://img.shields.io/badge/Tested_with-Vitest_%7C_Playwright-080808?style=flat-square&logo=vitest&logoColor=D4AF37)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-080808.svg?style=flat-square&logo=opensourceinitiative&logoColor=D4AF37)](https://opensource.org/licenses/MIT)

**[our-journey-cm.vercel.app/map](https://our-journey-cm.vercel.app/map)**

---

## Destaques da Aplicação

- **Privacidade & Segurança First** — Uma tela de bloqueio com PIN numérico garante que apenas nós tenhamos acesso ao diário, protegida por rate limiting.
- **Mapa interativo com 38 pins** — Globo/mapa dark, fly-to automático no modo história, exploração livre, pins especiais (◆) com destaque dourado.
- **Modal editorial com foto hero + galeria** — Bottom sheet mobile / sidebar desktop, hero full-bleed, galeria masonry, lightbox com gestos.
- **Player de música ambiente** — Dual-mode: HTML5 local + Spotify Web Playback SDK.
- **Timeline cronológica** — Agrupada por ano, cards com parallax, linha dourada animada.
- **Intro cinematográfica** — Globo 3D rotacionando, copy sequencial animada, transição suave para o mapa.

---

## Engenharia e Arquitetura

O projeto demonstra engenharia front-end moderna: Next.js App Router com React 19, mapa WebGL persistente, CDN de imagens com transformações on-the-fly, autenticação em camadas e animações cinematográficas — tudo com tipagem estrita e validação Zod em runtime.

### Arquitetura (BFF Pattern)

A arquitetura adota o padrão **Backend-for-Frontend (BFF)** para proteger segredos de API (Spotify, Mapbox, Cloudinary). As chaves nunca são expostas ao cliente.

```mermaid
graph LR
    Client[Client App] --> |Requisita Token| RouteHandler[Route Handlers /api]
    RouteHandler --> |Injeta Segredos| ExternalAPI[Spotify / Mapbox API]
    ExternalAPI --> |Retorna Dados/Token| RouteHandler
    RouteHandler --> |Entrega ao Client| Client
```

- **Overlay Pattern:** O contexto WebGL do Mapbox é caro. Em vez de desmontar o mapa durante a navegação, utilizamos um padrão de overlay (sobreposição), onde as views (detalhes do local, timeline) são renderizadas sobre o mapa de forma não destrutiva.

---

## 🤖 AI-Powered Development

Este projeto demonstra práticas modernas de **AI-Assisted Engineering**:

**Stack de IA:**

- **OpenCode** — CLI com 5 agentes especializados + plugins customizados
- **Superpowers** — Espinha dorsal metodológica (brainstorming → spec → plan → TDD → review)
- **ECC** — Subagentes especializados (security audit, deep review, debug)
- **Context7 MCP** — Documentação de libs em tempo real

**Automação:**

- Plugin customizado com hooks (`session.idle`, `todo.updated`) que sugerem code review e paralelismo
- Hooks Git: pre-commit (lint-staged), pre-push (format + lint + test + build), commit-msg (Conventional Commits)
- Branch protection na `main` + CI obrigatório (GitHub Actions)
- Comando `/ship` — fluxo completo: branch → commits semânticos → push → PR com spec em pt-br

**Memória Persistente:**

- `docs/superpowers/memory/` — Contexto versionado entre sessões (ARQUITETURA.md, decisions.md, patterns.md, known-issues.md)
- ADRs (Architecture Decision Records) para decisões importantes

**Resultados:**

- Zero duplicação — documentação referenciada, não repetida
- Guardrails automatizados — erros recorrentes viram constraints determinísticas
- Contexto sob demanda — skills carregadas apenas quando necessárias (economia de tokens)

---

## Como Rodar

```bash
git clone https://github.com/Claytonrss/our-journey.git
cd our-journey
pnpm install
cp .env.example .env.local
# Edite .env.local com suas credenciais
pnpm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000) — o dev server usa `127.0.0.1` para compatibilidade com redirect URIs do Spotify.

### Scripts

```bash
pnpm run dev          # Dev server em 127.0.0.1:3000
pnpm run build        # TypeScript check + build de produção
pnpm run lint         # ESLint
pnpm run format:check # Prettier check
pnpm run format       # Prettier write
pnpm run test         # Vitest (unit tests)
pnpm run test:e2e     # Playwright (E2E)
pnpm run generate     # Sync Cloudinary → memories.json
```

---

## Documentação Completa

| Documento                           | Conteúdo                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| [Arquitetura](docs/ARCHITECTURE.md) | Arquitetura operacional, fluxos, decisões técnicas, guardrails |
| [Engenharia](docs/ENGINEERING.md)   | Fluxo de trabalho, checklist de PR, comandos, convenções       |
| [Roadmap](docs/ROADMAP.md)          | Próximas fases: curto, médio e longo prazo                     |
| [Changelog](docs/CHANGELOG.md)      | Histórico de releases e melhorias                              |
| [Backlog](docs/BACKLOG.md)          | Itens não agendados por prioridade                             |

---

## Créditos

Desenvolvido por [Clayton Souza](https://github.com/Claytonrss) como presente de Dia dos Namorados para a Marina.

Cada pin no mapa é real; cada foto foi tirada por nós; cada descrição foi escrita pensando na pessoa que ia abrir isso.
