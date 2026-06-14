# Our Journey

**Cada pin é um pedaço nosso — um mapa vivo das viagens, encontros e histórias que só nós dois sabemos.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-080808?style=flat-square&logo=next.js&logoColor=D4AF37)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-080808?style=flat-square&logo=typescript&logoColor=D4AF37)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-080808?style=flat-square&logo=tailwindcss&logoColor=D4AF37)](https://tailwindcss.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL-080808?style=flat-square&logo=mapbox&logoColor=D4AF37)](https://www.mapbox.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-080808?style=flat-square&logo=cloudinary&logoColor=D4AF37)](https://cloudinary.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-080808?style=flat-square&logo=framer&logoColor=D4AF37)](https://www.framer.com/motion/)

**[our-journey-cm.vercel.app/map](https://our-journey-cm.vercel.app/map)**

Um presente pessoal para a Marina — e, ao mesmo tempo, um showcase técnico: design system próprio, integrações com APIs externas, pipeline de CI completa e arquitetura pensada para agentes de IA.

---

## Sobre

Our Journey transforma memórias de viagem em uma experiência geo-espacial imersiva. O usuário desbloqueia o app com um PIN, atravessa uma intro cinematográfica com globo 3D, e explora **38 locais catalogados** — cada um com fotos reais, coordenadas GPS, copywriting personalizado e trilha sonora ambiente.

O projeto nasceu como presente de Dia dos Namorados e demonstra engenharia front-end moderna: Next.js App Router com React 19, mapa WebGL persistente, CDN de imagens com transformações on-the-fly, autenticação em camadas e animações cinematográficas — tudo com tipagem estrita e validação Zod em runtime.

---

## Features

- **Mapa interativo com 38 pins** — Globo/mapa dark, fly-to automático no modo história, exploração livre, pins especiais (◆) com destaque dourado
- **Modal editorial com foto hero + galeria** — Bottom sheet mobile / sidebar desktop, hero full-bleed, galeria masonry, lightbox com gestos
- **Player de música ambiente** — Dual-mode: HTML5 local + Spotify Web Playback SDK
- **Timeline cronológica** — Agrupada por ano, cards com parallax, linha dourada animada
- **Autenticação por PIN + Spotify OAuth** — Server Action com rate limiting, mensagens de erro contextuais
- **Intro cinematográfica** — Globo 3D rotacionando, copy sequencial animada, transição suave para o mapa

---

## Como Rodar

```bash
git clone https://github.com/claytonsouza/our-journey.git
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
pnpm run test         # Vitest (unit tests)
pnpm run test:e2e     # Playwright (E2E)
pnpm run generate     # Sync Cloudinary → memories.json
```

---

## Documentação

| Documento                           | Conteúdo                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| [Arquitetura](docs/ARCHITECTURE.md) | Arquitetura operacional, fluxos, decisões técnicas, guardrails |
| [Engenharia](docs/ENGINEERING.md)   | Fluxo de trabalho, checklist de PR, comandos, convenções       |
| [Roadmap](docs/ROADMAP.md)          | Próximas fases: curto, médio e longo prazo                     |
| [Changelog](docs/CHANGELOG.md)      | Histórico de releases e melhorias                              |
| [Backlog](docs/BACKLOG.md)          | Itens não agendados por prioridade                             |

---

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Mapbox GL JS · Cloudinary · NextAuth v5 · Zustand · Zod · Vitest · Playwright · Sentry · pnpm 9

---

## Créditos

Desenvolvido por [Clayton Souza](https://github.com/claytonsouza) como presente de Dia dos Namorados para a Marina.

Cada pin no mapa é real; cada foto foi tirada por nós; cada descrição foi escrita pensando na pessoa que ia abrir isso.
