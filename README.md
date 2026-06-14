# Our Journey

**Cada pin é um pedaço nosso — um mapa vivo das viagens, encontros e histórias que só nós dois sabemos.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-080808?style=flat-square&logo=next.js&logoColor=D4AF37)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-080808?style=flat-square&logo=typescript&logoColor=D4AF37)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-080808?style=flat-square&logo=tailwindcss&logoColor=D4AF37)](https://tailwindcss.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL-080808?style=flat-square&logo=mapbox&logoColor=D4AF37)](https://www.mapbox.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-080808?style=flat-square&logo=cloudinary&logoColor=D4AF37)](https://cloudinary.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-080808?style=flat-square&logo=framer&logoColor=D4AF37)](https://www.framer.com/motion/)
[![Sentry](https://img.shields.io/badge/Sentry-10-080808?style=flat-square&logo=sentry&logoColor=D4AF37)](https://sentry.io/)

**[our-journey-cm.vercel.app/map](https://our-journey-cm.vercel.app/map)**

Um presente pessoal para a Marina — e, ao mesmo tempo, um showcase técnico de produto end-to-end: design system próprio, integrações com APIs externas, pipeline de CI completa e arquitetura pensada para agentes de IA manterem consistência.

---

## Visão Geral

Our Journey é uma aplicação web interativa que transforma memórias de viagem em uma experiência geo-espacial imersiva. O usuário desbloqueia o app com um PIN, atravessa uma intro cinematográfica com globo 3D, e passa a explorar **38 locais catalogados** — cada um com fotos reais, coordenadas GPS, copywriting personalizado e trilha sonora ambiente.

O projeto nasceu como presente de Dia dos Namorados, mas evoluiu para demonstrar engenharia front-end moderna: Next.js App Router com React 19, mapa WebGL persistente, CDN de imagens com transformações on-the-fly, autenticação em camadas e animações cinematográficas — tudo com tipagem estrita e validação Zod em runtime.

### Memory as Editorial

A filosofia editorial **"Memory as Editorial"** trata cada memória como uma peça de conteúdo, não como um registro de banco de dados. Cada local tem uma **foto hero dominante** (primeira imagem do array, renderizada em full-bleed com gradiente), **copywriting íntimo** em tom de primeira pessoa do plural, **data formatada em pt-BR** com tipografia serifada, e **galeria masonry** para as fotos secundárias. Pins especiais (◆) marcam viagens e marcos que merecem destaque visual no mapa.

As fotos vivem no Cloudinary; as coordenadas e metadados em `memories-source.json`, versionados no repositório. Um script TypeScript (`pnpm run generate`) sincroniza pastas do Cloudinary com o JSON final validado por Zod.

---

## Features Principais

**Mapa interativo com pins de memória**
O quê: Globo/map dark com 38 pins clicáveis, fly-to automático no modo história e exploração livre no modo livre.
Como: Mapbox GL JS via `react-map-gl` com estilo `dark-v11`, token obtido via BFF (`/api/mapbox-token`). Pins customizados em SVG (`MemoryPin`, `SpecialPinSVG`). Overlay radial escurece bordas para atmosfera editorial. `reuseMaps` evita recriar contexto WebGL.

**Modal de memória com foto hero + galeria**
O quê: Bottom sheet no mobile (75vh, drag-to-dismiss) ou sidebar no desktop (max-w-md, slide-in). Hero image em full-bleed, título sobre gradiente, descrição editorial, galeria masonry e link para timeline.
Como: `Overlay.tsx` com variantes mobile/desktop. `CldImage` do `next-cloudinary` com `crop="fill"`, `gravity="auto"`, `dpr="auto"`. Primeira imagem = hero; restante = `MasonryGallery`.

**Player de música ambiente**
O quê: Trilha sonora discreta (pill flutuante no mapa, strip no overlay) com play/pause e capa rotativa.
Como: Dual-mode via Zustand (`useLocalAudio`): HTML5 Audio com `/audio/background.mp3` como fallback, ou Spotify Web Playback SDK quando OAuth está ativo. `GlobalAudio` inicializa o backend de áudio; `useAudioPlayer` expõe toggle unificado.

**Timeline cronológica sincronizada com o mapa**
O quê: Scroll vertical agrupado por ano, cards editoriais com parallax na foto hero, linha dourada animada e scroll automático até a memória ativa.
Como: `TimelinePage` consome o mesmo `memoryService` e `activeMemoryId` do Zustand. `groupMemoriesByYear()` em `@/lib/memory-grouping`. Navegação mapa → timeline preserva `activeMemoryId`.

**Lightbox de fotos com navegação**
O quê: Visualizador fullscreen com swipe horizontal (navegar), swipe vertical (fechar), botões prev/next e contador.
Como: Framer Motion `drag` com thresholds de offset. `CldImage` com `object-contain` e shimmer de loading. [TODO: navegação por teclado (←/→/Esc) ainda não implementada]

**Autenticação por PIN com UX personalizada**
O quê: Lock screen com mapa de fundo, input de 4 dígitos, mensagens de erro contextuais (ex: "Sério? Essa é a primeira que todo mundo tenta.") e escolha de modo de áudio (local vs Spotify).
Como: Server Action `validatePin()` com rate limiting server-side. Estado `isPinValidated` no Zustand. Shake animation CSS em erro; fade-out em sucesso.

**Intro cinematográfica com globo 3D**
O quê: Globo Mapbox rotacionando lentamente, modal glassmorphism com copy sequencial animada, botão "Vamos lá" que dispara fly-to de 7s até a primeira memória.
Como: `IntroScreen` com `projection="globe"`, rotação via `requestAnimationFrame` no bearing, Framer Motion `AnimatePresence` para entrada/saída. Flag `intro-seen` em `sessionStorage`.

**Organização de fotos via metadata**
O quê: Pipeline para manter centenas de fotos organizadas por local, com alt text automático e validação de schema.
Como: `memories-source.json` define metadados + `cloudinaryFolder` por memória. `scripts/generate-memories.ts` busca imagens via Cloudinary API (Dynamic Folder Mode), gera `memories.json` validado por Zod, preservando entradas existentes. Coordenadas GPS são curadas manualmente em `memories-source.json`. [TODO: automação via Google Photos Takeout + Nominatim não está no repositório]

---

## Stack Técnica

### Frontend Core

| Tecnologia   | Versão | Por que foi escolhida                                                                                   |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| Next.js      | 16.2.6 | App Router para BFF nativo (Route Handlers), RSC onde faz sentido, e deploy zero-config na Vercel       |
| React        | 19.2.4 | Concurrent features e ecossistema maduro para mapa WebGL + overlays simultâneos                         |
| TypeScript   | ^5     | `strict: true` — contratos Zod inferidos como types eliminam drift entre JSON e componentes             |
| Tailwind CSS | ^4     | Tokens via `@theme inline` em `globals.css`; sem arquivo de config separado, co-localizado com CSS vars |
| Zod          | ^4.4.3 | Validação runtime de `memories.json` e env vars — falha cedo se dados ou config estiverem corrompidos   |

### Animação e Interação

| Tecnologia    | Versão   | Por que foi escolhida                                                                                         |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| Framer Motion | ^12.40.0 | Gestos (drag, pan), `AnimatePresence` para mount/unmount de overlays, parallax via `useScroll`/`useTransform` |
| Lucide React  | ^1.16.0  | Ícones tree-shakeable para controles de player e lightbox, consistentes com peso visual minimalista           |

### Mapa e Geolocalização

| Tecnologia   | Versão  | Por que foi escolhida                                                                        |
| ------------ | ------- | -------------------------------------------------------------------------------------------- |
| Mapbox GL JS | ^3.24.0 | WebGL nativo, projeção globe, flyTo com easing customizado — impossível replicar com Leaflet |
| react-map-gl | ^8.1.1  | Wrapper React declarativo com `MapRef` para controle imperativo de câmera                    |

### Storage e Backend

| Tecnologia | Versão                                    | Por que foi escolhida                                                                         |
| ---------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Cloudinary | ^2.10.0 (SDK) / ^6.17.5 (next-cloudinary) | CDN com transformações on-the-fly (crop, dpr, format); repositório leve sem binários          |
| next-auth  | 5.0.0-beta.31                             | OAuth Spotify com refresh token; BFF pattern para client secret                               |
| Zustand    | ^5.0.13                                   | Estado global client-side minimalista (activeMemoryId, audio, PIN) sem boilerplate de Context |
| Sentry     | ^10                                       | Error tracking e source maps em produção via `@sentry/nextjs`                                 |

### Tooling e DX

| Tecnologia          | Versão           | Por que foi escolhida                                           |
| ------------------- | ---------------- | --------------------------------------------------------------- |
| pnpm                | 9 (CI)           | Lockfile determinístico, installs rápidos, enforced no CI       |
| Vitest              | ^3.2.6           | Testes unitários com coverage thresholds (75%+ statements)      |
| Playwright          | ^1.60.0          | E2E smoke tests (PIN, mapa, timeline) no CI                     |
| Husky + lint-staged | ^9.1.7 / ^17.0.5 | Pre-commit: Prettier + ESLint; commit-msg: Conventional Commits |
| ESLint              | ^9               | `eslint-config-next` com core-web-vitals                        |

---

## Design System

### Paleta de Cores

Extraída de `src/app/globals.css`:

| Token                | Valor                      | Uso                                          |
| -------------------- | -------------------------- | -------------------------------------------- |
| `--bg-void`          | `#080808`                  | Fundo principal, body                        |
| `--bg-panel`         | `#101010`                  | Painéis, overlays, player                    |
| `--bg-surface`       | `#161616`                  | Cards, placeholders                          |
| `--bg-elevated`      | `#1c1c1c`                  | Elementos elevados (strip do player)         |
| `--gold`             | `#d4af37`                  | Acento principal: pins, botões, links, datas |
| `--gold-dim`         | `rgba(212, 175, 55, 0.12)` | Backgrounds sutis dourados                   |
| `--gold-line`        | `rgba(212, 175, 55, 0.18)` | Linhas divisórias                            |
| `--gold-glow`        | `rgba(212, 175, 55, 0.25)` | Glows e sombras douradas                     |
| `--text-warm`        | `#f2ede4`                  | Texto principal (body, títulos)              |
| `--text-muted`       | `#6e6860`                  | Descrições, corpo secundário                 |
| `--text-ghost`       | `#2e2a28`                  | Datas discretas, placeholders                |
| `--color-brand-rose` | `#e8a598`                  | Acento secundário (reservado)                |
| `--color-brand-deep` | `#2d1b0e`                  | Tom profundo (reservado)                     |

### Tipografia

| Papel              | Fonte                               | Variável CSS                         | Source                       |
| ------------------ | ----------------------------------- | ------------------------------------ | ---------------------------- |
| UI / Body          | DM Sans (300, 400, 500)             | `--font-dm-sans` / `--font-ui`       | Google Fonts via `next/font` |
| Display / Headings | Playfair Display (400, 600, italic) | `--font-playfair` / `--font-display` | Google Fonts via `next/font` |
| Editorial / Intro  | Lora (400, 500, italic)             | `--font-lora` / `--font-editorial`   | Google Fonts via `next/font` |

Hierarquia típica: títulos de memória em Playfair 26–32px/400; datas em Playfair 11–12px italic; descrições em DM Sans 14px/1.7 em `--text-muted`; labels UI em DM Sans 11px uppercase tracking.

### Espaçamento e Border Radius

| Contexto            | Valor                                             | Onde                              |
| ------------------- | ------------------------------------------------- | --------------------------------- |
| Botão primário      | `border-radius: 14px`, `height: 52px`, full-width | `.btn-primary`                    |
| Modal intro         | `border-radius: 24px`                             | `IntroScreen`                     |
| Bottom sheet mobile | `border-radius: 28px 28px 0 0`                    | `Overlay` mobile                  |
| Galeria / cards     | `border-radius: 12px`                             | `MasonryGallery`, `GalleryImage`  |
| Timeline hero       | `border-radius: 16px` (top)                       | `CardPhotoHero` (`rounded-t-2xl`) |
| Lightbox foto       | `border-radius: 6px`                              | `Lightbox`                        |
| Player pill         | `border-radius: 9999px` (full)                    | `AudioPlayer` variant pill        |

Padding padrão de painéis: 24px mobile, 32px desktop.

### Filosofia Visual

Dark-first com `--bg-void` como canvas infinito. Dourado (`--gold`) como único acento de ação e destaque — nunca como fundo dominante. Textura de noise sutil (3% opacity) via pseudo-elemento no body. Glassmorphism nos modais (blur 24px, border dourado 15% opacity). Editorial sobre funcional: a foto manda, a UI recua.

---

## Arquitetura

### Estrutura de Pastas

```
src/
├── app/                          # App Router — pages, API routes, server actions
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler (Spotify OAuth)
│   │   ├── mapbox-token/         # BFF — token Mapbox nunca exposto ao client
│   │   └── spotify-token/        # BFF — access token Spotify
│   ├── actions/auth.ts           # Server Action validatePin() com rate limiting
│   ├── map/page.tsx              # Página principal — mapa + overlays (client)
│   ├── timeline/page.tsx         # Timeline cronológica (client)
│   ├── page.tsx                  # Lock screen / entry point
│   ├── layout.tsx                # Root layout — fonts, Providers, lang="pt-BR"
│   └── globals.css               # Design tokens, animações, .btn-primary
├── components/
│   ├── features/
│   │   ├── auth/LockScreen.tsx   # PIN lock + escolha de áudio
│   │   ├── map/                  # MapView, MemoryPin, NavigationOverlay, SVGs
│   │   ├── overlay/              # Overlay, MemoryContent, MasonryGallery, Lightbox
│   │   ├── player/AudioPlayer.tsx
│   │   ├── timeline/             # TimelinePage, MemoryCard, CardPhotoHero, GoldLine
│   │   └── IntroScreen/          # IntroScreen (globo 3D), HeadphonesScreen
│   ├── ui/                       # CompassRose, ViewToggle
│   ├── GlobalAudio.tsx           # Inicializa Spotify ou HTML5 audio
│   └── Providers.tsx             # SessionProvider + GlobalAudio
├── hooks/
│   ├── useAppStore.ts            # Zustand — estado global client
│   ├── useAudioPlayer.ts         # Toggle unificado local/Spotify
│   ├── useMapFlyTo.ts            # Fly-to sincronizado com activeMemoryId
│   ├── useIsMobile.ts            # Breakpoint 768px
│   └── useWebGLSupport.ts        # Detecção WebGL
├── lib/                          # cn(), env, memory-grouping, pin-validation, navigation-utils
├── services/
│   ├── memoryService.ts          # Carrega + valida memories.json via Zod
│   ├── spotifyService.ts         # Spotify Web Playback SDK wrapper
│   └── html5AudioService.ts      # Fallback HTML5 Audio
├── types/index.ts                # MemorySchema, ImageSchema, AppState (Zod + TS)
├── data/
│   ├── memories.json             # JSON gerado e validado (38 memórias)
│   └── memories-source.json      # Source of truth — metadados + cloudinaryFolder
└── __tests__/                    # Vitest — hooks, services, lib, components
scripts/
└── generate-memories.ts          # Sync Cloudinary → memories.json
```

### Fluxo de Dados

1. **Memórias**: `memories-source.json` → `pnpm run generate` → `memories.json` → `memoryService.getMemories()` → Zod parse → componentes.
2. **Mapa**: `MapView` recebe `memories[]` como prop, renderiza `MemoryPin` por coordenada. Token via fetch `/api/mapbox-token`.
3. **Cloudinary**: `CldImage` com `publicId` do schema. Transforms declarativos (`crop`, `gravity`, `dpr`, `sizes`). Lazy loading na galeria; `priority` no hero.
4. **Estado global**: Zustand (`useAppStore`) — `activeMemoryId`, `selectedMemoryId`, `viewMode`, audio state, PIN validation. Sem Context API.
5. **Server vs Client**: Pages interativas são `'use client'`. Server Actions para PIN. Route Handlers para tokens. Layout root é Server Component.

---

## Decisões Técnicas Notáveis

**Decisão: Cloudinary vs armazenamento local de fotos**
Contexto: Centenas de fotos em alta resolução tornariam o repositório inviável e o build lento.
Escolha: Cloudinary como CDN com Dynamic Folder Mode; `publicId` no JSON, transforms on-the-fly via `next-cloudinary`.
Trade-off: Dependência de serviço externo e credenciais no CI. Valeu a pena: repo < 1MB, imagens otimizadas automaticamente (WebP, dpr, crop).

**Decisão: Client-side rendering para o mapa**
Contexto: Mapbox WebGL precisa de `window`, token fetch client-side, e gestos interativos.
Escolha: `'use client'` em `/map` e `/timeline`. Mapa montado uma vez com `reuseMaps`; overlays renderizam por cima.
Trade-off: Sem SSR do mapa (flash de loading). Valeu a pena: fly-to fluido, zero remount de contexto WebGL, 60fps nas transições.

**Decisão: Framer Motion vs CSS puro**
Contexto: Overlays, intro e lightbox precisam de gestos (drag, swipe), mount/unmount animado e parallax.
Escolha: Framer Motion para overlays, lightbox, intro e parallax. CSS `@keyframes` para loops (pin-pulse, compass-rotate, shimmer, shake).
Trade-off: ~50KB gzip a mais. Valeu a pena: API declarativa para gestos complexos que CSS puro exigiria centenas de linhas.

**Decisão: JSON versionado vs CMS/banco**
Contexto: 38 memórias com copywriting curado; não há necessidade de CRUD em runtime.
Escolha: `memories.json` versionado no Git, validado por Zod, gerado por script a partir de `memories-source.json`.
Trade-off: Adicionar memória exige commit + deploy. Valeu a pena: zero infra de banco, diffs reviewáveis, tipagem garantida.

**Decisão: Dual-mode de áudio (HTML5 + Spotify)**
Contexto: Spotify exige Premium + OAuth; a experiência não pode depender disso para funcionar.
Escolha: HTML5 Audio local como default; Spotify como upgrade opcional via NextAuth.
Trade-off: Dois code paths de áudio. Valeu a pena: app funciona offline/no CI sem credenciais Spotify reais.

**Decisão: PIN server-side vs client-only**
Contexto: PIN no client seria trivialmente bypassável inspecionando o bundle.
Escolha: Server Action `validatePin()` com rate limiting (5 tentativas/60s).
Trade-off: Latência de rede a cada tentativa. Valeu a pena: segurança real contra brute-force casual.

---

## Como Rodar Localmente

```bash
git clone https://github.com/claytonsouza/our-journey.git
cd our-journey
pnpm install
cp .env.example .env.local
# Edite .env.local com suas credenciais
pnpm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000) — o dev server usa `127.0.0.1` (não `localhost`) para compatibilidade com redirect URIs do Spotify.

### Variáveis de Ambiente

| Variável                                              | Descrição                                              |
| ----------------------------------------------------- | ------------------------------------------------------ |
| `SECRET_PIN`                                          | PIN de 4 dígitos para desbloquear o app                |
| `AUTH_SECRET`                                         | Secret do NextAuth (`openssl rand -base64 32`)         |
| `AUTH_URL` / `NEXTAUTH_URL`                           | URL canônica (ex: `https://our-journey-cm.vercel.app`) |
| `SPOTIFY_CLIENT_ID`                                   | Client ID do Spotify Developer Dashboard               |
| `SPOTIFY_CLIENT_SECRET`                               | Client Secret (server-only)                            |
| `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`                    | URI da playlist (`spotify:playlist:…`)                 |
| `MAPBOX_TOKEN`                                        | Access token Mapbox (server-only, proxied via BFF)     |
| `CLOUDINARY_CLOUD_NAME`                               | Cloud name do Cloudinary                               |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`                   | Cloud name público (para `CldImage`)                   |
| `CLOUDINARY_API_KEY`                                  | API key (server-only, para script de geração)          |
| `CLOUDINARY_API_SECRET`                               | API secret (server-only)                               |
| `NEXT_PUBLIC_SENTRY_DSN`                              | DSN do Sentry (opcional)                               |
| `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` | Config de source maps (opcional)                       |

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

## Roadmap

- [x] Mapa interativo com pins e fly-to
- [x] Overlay editorial (hero + masonry + lightbox)
- [x] Timeline cronológica com parallax
- [x] Autenticação PIN + Spotify OAuth
- [x] Intro cinematográfica com globo 3D
- [x] Pipeline CI (lint, format, unit, coverage, build, E2E)
- [x] Sentry com source maps
- [ ] Navegação por teclado no lightbox (←/→/Esc)
- [ ] Integração Spotify completa (shuffle, skip, progress bar)
- [ ] Modo surpresa / Easter eggs por memória
- [ ] Sincronização bidirecional timeline ↔ mapa (highlight ao scroll)
- [ ] Versão mobile PWA (offline, install prompt)
- [ ] Automação GPS via Google Photos Takeout + geocoding

---

## Créditos e Contexto

Our Journey nasceu como presente de Dia dos Namorados para a Marina — uma forma de dizer, em código e em fotos, que cada lugar que visitamos juntos importa. Cada pin no mapa é real; cada foto foi tirada por nós; cada descrição foi escrita pensando na pessoa que ia abrir isso.

Tecnicamente, o projeto representa a exploração de um stack moderno aplicado a um produto com alma: design system dark-first com tokens CSS, arquitetura BFF para segredos, validação Zod end-to-end, testes automatizados com coverage, e documentação pensada para manutenção assistida por IA. Não é um tutorial — é um produto real, deployado, usado.

Desenvolvido por [Clayton Souza](https://github.com/claytonsouza).
