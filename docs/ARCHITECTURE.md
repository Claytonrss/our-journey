# Architecture

Este documento descreve a arquitetura atual do Our Journey e os guardrails para evoluir o projeto sem quebrar suas decisões centrais. O `docs/HLD.md` continua sendo a visão de alto nível; este arquivo é o guia operacional para entender onde cada coisa vive, como os fluxos passam pelo sistema e quais limites devem ser preservados.

## Objetivos Arquiteturais

- Preservar uma experiência interativa fluida, com o mapa WebGL como superfície principal.
- Manter segredos de Spotify, Mapbox e Cloudinary fora do client bundle.
- Concentrar integrações externas em camadas pequenas e fáceis de auditar.
- Validar contratos de dados estáticos antes que eles cheguem à UI.
- Favorecer uma estrutura simples de portfólio: legível, demonstrável e resiliente sem virar uma plataforma maior do que o problema.

## Stack

- Next.js 16 com App Router.
- React 19 e TypeScript.
- Tailwind CSS 4.
- NextAuth v5 beta com Spotify OAuth.
- Zustand para estado global leve.
- Mapbox GL via `react-map-gl`.
- Zod para contratos de dados.
- Cloudinary para imagens remotas.
- pnpm 9 como package manager.

## Visão Geral

O projeto é um monolito Next.js com padrão BFF. O mesmo app entrega a UI, server actions e route handlers que protegem credenciais de terceiros.

```mermaid
flowchart TB
  Browser["Browser"]
  NextApp["Next.js 16 App Router"]
  ServerPage["Server page: src/app/page.tsx"]
  ClientFeatures["Client features: LockScreen, MapPage, TimelinePage, Overlay, Player"]
  Zustand["Zustand store: useAppStore"]
  ServerActions["Server action: validatePin"]
  RouteMapbox["GET /api/mapbox-token"]
  RouteSpotify["GET /api/spotify-token"]
  NextAuth["NextAuth v5 Spotify provider"]
  MemoryService["memoryService + Zod validation"]
  MemoriesJson["src/data/memories.json"]
  Mapbox["Mapbox GL / styles / tiles"]
  Spotify["Spotify OAuth, Web API and Web Playback SDK"]
  Cloudinary["Cloudinary CDN via next-cloudinary"]
  Env["Server env validation: src/lib/env.ts"]

  Browser --> NextApp
  NextApp --> ServerPage
  ServerPage --> NextAuth
  NextApp --> ClientFeatures
  ClientFeatures <--> Zustand
  ClientFeatures --> ServerActions
  ServerActions --> Env
  ClientFeatures --> RouteMapbox
  ClientFeatures --> RouteSpotify
  RouteMapbox --> Env
  RouteMapbox --> Mapbox
  RouteSpotify --> NextAuth
  NextAuth --> Spotify
  ClientFeatures --> MemoryService
  MemoryService --> MemoriesJson
  MemoryService --> ClientFeatures
  ClientFeatures --> Mapbox
  ClientFeatures --> Spotify
  ClientFeatures --> Cloudinary
```

## Diretórios e Responsabilidades

| Caminho                    | Responsabilidade                                                               |
| -------------------------- | ------------------------------------------------------------------------------ |
| `src/app/`                 | Rotas App Router, páginas, route handlers e server actions.                    |
| `src/app/api/`             | BFF para dados sensíveis ou dependentes da sessão.                             |
| `src/components/features/` | Componentes agrupados por domínio de tela: auth, map, overlay, player e intro. |
| `src/components/ui/`       | Primitivos visuais compartilhados e sem regra de negócio específica.           |
| `src/hooks/`               | Estado global, integração de browser APIs e hooks de comportamento.            |
| `src/services/`            | Integrações e serviços reusáveis, como Spotify, áudio local e memórias.        |
| `src/types/`               | Schemas Zod e tipos derivados.                                                 |
| `src/data/`                | Conteúdo estático versionado. `memories.json` é gerado e validado em runtime.  |
| `scripts/`                 | Automação local, como geração de dados de memórias.                            |
| `docs/`                    | Produto, arquitetura, FDDs e planos técnicos.                                  |

## Fluxos Principais

### Entrada, Sessão e PIN

1. O usuário acessa `/`.
2. `src/app/page.tsx` roda no servidor e consulta `auth()`.
3. `LockScreen` recebe `hasSession` e decide se apresenta login Spotify ou validação de PIN.
4. O PIN é validado por `src/app/actions/auth.ts`, comparando com `SECRET_PIN`.
5. Depois do PIN validado, o estado `isPinValidated` no Zustand permite navegar para `/map`.

Guardrails:

- O PIN nunca deve ser validado no client.
- `SECRET_PIN` deve continuar privado e lido apenas no servidor.
- Qualquer nova camada de acesso deve compor com o fluxo atual, não substituí-lo silenciosamente.

### Autenticação Spotify

`src/auth.ts` concentra a configuração do NextAuth. Ele:

- normaliza `AUTH_URL` / `NEXTAUTH_URL`;
- força `127.0.0.1` em desenvolvimento quando necessário;
- configura o provider Spotify;
- renova access tokens expirados via refresh token;
- propaga `RefreshAccessTokenError` para a sessão.

Guardrails:

- Não acessar `SPOTIFY_CLIENT_SECRET` em componentes client.
- Não duplicar lógica de refresh token fora de `src/auth.ts` sem um motivo forte.
- Ao alterar redirect URI, validar desenvolvimento e produção.

### Mapa e Overlay

`src/app/map/page.tsx` é um componente client que orquestra:

- carregamento das memórias via `memoryService`;
- validação de WebGL;
- renderização de `MapView`;
- navegação entre memórias;
- overlay de conteúdo;
- player de áudio.

`MapView` é a instância WebGL principal e deve permanecer montada enquanto o usuário interage com memórias. O conteúdo entra como overlay sobre o mapa, evitando navegação baseada em rotas que remonte o Mapbox.

Guardrails:

- Não transformar cada memória em uma rota que desmonta o mapa.
- Preservar `reuseMaps` no Mapbox, salvo decisão arquitetural explícita.
- Novas experiências de conteúdo devem preferir overlay, sheet ou painel sobre o mapa.
- Falhas de Mapbox devem renderizar fallback visual, não tela quebrada.

### Áudio

`useAudioPlayer` escolhe entre Spotify Web Playback SDK e fallback HTML5:

- usa a sessão NextAuth para obter access token;
- inicializa `SpotifyService`;
- atualiza estado de faixa e play/pause no Zustand;
- quando há erro de autenticação ou inicialização, ativa áudio local via `HTML5AudioService`.

Guardrails:

- O player não deve bloquear a experiência principal do mapa.
- Erros de Spotify devem degradar para fallback local ou estado visual claro.
- Chamadas com access token devem passar por `/api/spotify-token` quando dependerem da sessão.

### Dados de Memórias

```mermaid
erDiagram
  MEMORY ||--o{ IMAGE : contains

  MEMORY {
    string id
    string title
    string date "YYYY-MM-DD"
    float coordinates_lat
    float coordinates_lng
    boolean isSpecialPin
    string description
  }

  IMAGE {
    string publicId
    string alt
    int width
    int height
  }

  MEMORY_SOURCE {
    string id
    string title
    string date
    float coordinates_lat
    float coordinates_lng
    boolean isSpecialPin
    string description
    string cloudinaryFolder
  }

  MEMORY_SOURCE ||--o{ MEMORY : generates
```

`src/data/memories.json` é a fonte de verdade consumida pela aplicação. `memoryService.getMemories()` importa o JSON e valida a lista com `MemorySchema`.

Contrato mínimo de cada memória:

- `id`
- `title`
- `date` no formato `YYYY-MM-DD`
- `coordinates.lat`
- `coordinates.lng`
- `isSpecialPin`
- `description`
- `images`

Guardrails:

- Atualizações de conteúdo devem passar pelo schema em `src/types/index.ts`.
- Alterações no formato do JSON devem atualizar schema, tipos, gerador e componentes consumidores.
- Falha de validação deve ser tratada como problema de conteúdo, não como erro silencioso aceitável.

## BFF e Segredos

Route handlers atuais:

| Rota                      | Responsabilidade                                    |
| ------------------------- | --------------------------------------------------- |
| `/api/mapbox-token`       | Entrega token Mapbox para o client.                 |
| `/api/spotify-token`      | Entrega access token Spotify da sessão autenticada. |
| `/api/auth/[...nextauth]` | Expõe handlers do NextAuth.                         |

Guardrails:

- Variáveis sem prefixo `NEXT_PUBLIC_` são privadas e não devem ser lidas por componentes client.
- `SPOTIFY_CLIENT_SECRET`, `MAPBOX_TOKEN`, `CLOUDINARY_API_SECRET` e `AUTH_SECRET` nunca devem aparecer no client bundle, logs de browser ou props serializadas.
- `/api/mapbox-token` deve usar somente `MAPBOX_TOKEN`; não criar fallback público para token de mapa.
- Novas integrações externas com segredo devem entrar por route handler, server action ou código server-only.

## Estado Global

O Zustand em `src/hooks/useAppStore.ts` guarda apenas estado de interação compartilhado:

- memória ativa;
- memória selecionada;
- modo de visualização;
- status do player;
- faixa atual;
- validação do PIN;
- uso de fallback local de áudio.

Guardrails:

- Não colocar dados derivados pesados no store.
- Não usar Zustand como cache genérico de API.
- Estado persistente no browser precisa ser deliberado e documentado.
- Quando o estado pertence a um componente isolado, preferir `useState` local.

## Client vs Server

Use componentes server por padrão em rotas e layouts. Use `'use client'` apenas quando houver:

- estado ou efeitos de browser;
- APIs como `window`, `sessionStorage`, WebGL ou áudio;
- hooks client, incluindo Zustand e `useSession`;
- animações e interações complexas.

Guardrails:

- Não importar serviços client-only em módulos server.
- Não acessar `process.env` privado em componentes client.
- Se uma feature precisa de segredo, a fronteira deve ser server-side.

## Configuração

Variáveis obrigatórias em produção:

| Variável                            | Exposição           | Uso                                  |
| ----------------------------------- | ------------------- | ------------------------------------ |
| `SECRET_PIN`                        | Privada             | Validação local do PIN.              |
| `AUTH_SECRET`                       | Privada             | Criptografia/assinatura do NextAuth. |
| `AUTH_URL` / `NEXTAUTH_URL`         | Privada             | URL canônica de autenticação.        |
| `SPOTIFY_CLIENT_ID`                 | Privada no servidor | OAuth Spotify.                       |
| `SPOTIFY_CLIENT_SECRET`             | Privada             | OAuth Spotify.                       |
| `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`  | Pública             | Playlist usada pelo player.          |
| `MAPBOX_TOKEN`                      | Privada             | Token entregue via BFF.              |
| `CLOUDINARY_CLOUD_NAME`             | Privada             | Geração de conteúdo/imagens.         |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Pública             | Renderização de imagens Cloudinary.  |
| `CLOUDINARY_API_KEY`                | Privada             | Automação Cloudinary.                |
| `CLOUDINARY_API_SECRET`             | Privada             | Automação Cloudinary.                |

Validação central:

- `src/lib/env.ts` valida env server-side por domínio: PIN, auth/Spotify, Mapbox e Cloudinary.
- `src/lib/publicEnv.ts` valida env pública consumida no client.
- Novas env vars devem entrar nesses módulos antes de serem usadas por features.

## Resiliência Atual

O projeto já possui alguns mecanismos de degradação:

- `MapErrorBoundary` e `MapFallback` para problemas no mapa.
- `useWebGLSupport` antes de renderizar Mapbox.
- fallback para áudio local quando Spotify falha.
- refresh token no callback JWT do NextAuth.
- validação runtime de `memories.json`.

Lacunas conhecidas:

- falta timeout padronizado para chamadas externas;
- logs ainda são ad hoc com `console`;
- route handlers ainda não usam envelope de erro padronizado.

## Observabilidade

Estado atual:

- logs simples em falhas de token, Mapbox, Spotify e validação de memórias;
- sem camada centralizada de métricas, tracing ou error reporting.

Guardrails:

- Logs server-side não devem incluir tokens, secrets ou payloads sensíveis.
- Logs devem informar contexto suficiente: serviço, rota, status e ação que falhou.
- Erros esperados de serviços externos devem virar estados de UI ou respostas HTTP controladas.

## Qualidade e Verificação

Comandos oficiais:

```bash
pnpm run lint
pnpm run format:check
pnpm run build
```

O build executa a geração de memórias via `prebuild` e depois `next build`.

Guardrails:

- Usar sempre pnpm.
- Rodar `pnpm run build` antes de entregar mudanças que alterem tipos, rotas, dados ou build config.
- Rodar `pnpm run test` e `pnpm run test:coverage` para validar contratos e lógica.
- Ver `docs/ENGINEERING.md` para o fluxo completo de trabalho.

## Estratégia de Testes

O projeto possui suíte automatizada com Vitest (unitário) e Playwright (E2E). Ver `docs/superpowers/memory/patterns.md` para convenções detalhadas de teste.

### Suite Atual

| Camada    | Ferramenta                     | Cobertura                                     |
| --------- | ------------------------------ | --------------------------------------------- |
| Unitários | Vitest + React Testing Library | Schemas, env, route handlers, hooks, services |
| E2E       | Playwright                     | PIN flow, mapa mockado, timeline, mobile      |

Comandos:

```bash
pnpm run test           # Vitest unit tests
pnpm run test:coverage  # Vitest with coverage (thresholds enforced)
pnpm run test:e2e       # Playwright E2E
```

Guardrails:

- Testes unitários não devem chamar Spotify, Mapbox ou Cloudinary reais.
- Preferir fixtures pequenas e explícitas.
- Não tornar componentes server/client mais acoplados só para facilitar teste.

## Roadmap e Backlog

Ver [ROADMAP.md](ROADMAP.md) para as próximas fases e [BACKLOG.md](BACKLOG.md) para itens não agendados.

## Checklist Para Novas Features

Antes de implementar:

- A feature precisa de segredo? Se sim, ela deve passar pelo servidor.
- A feature desmonta ou substitui o mapa? Se sim, repensar como overlay.
- O estado precisa ser global? Se não, manter local.
- Existe contrato de dados novo? Se sim, criar schema Zod.
- Existe caminho de falha externo? Se sim, definir fallback visual ou funcional.
- A mudança afeta auth, PIN, mapa ou player? Se sim, rodar build e fazer smoke test manual.

---

> **Para IA:** `docs/superpowers/memory/architecture.md` contém um resumo enxuto em inglês da stack, comandos, diretórios e decisões arquiteturais para agentes de IA.
