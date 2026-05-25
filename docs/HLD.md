# HLD: Our Journey (Projeto Dia dos Namorados)

**Versão:** 1.0

**Data:** 2026-05-24

**Responsável:** Clayton Rafael dos Santos Souza

## Objetivo técnico

Criar uma aplicação web de alto desempenho e preservação de estado WebGL (Mapbox) durante a navegação interativa, unificando o desenvolvimento de frontend e backend utilizando Next.js. O projeto visa garantir a integração segura a serviços de terceiros (Spotify, Cloudinary, Mapbox) delegando a comunicação para camadas de backend (Route Handlers), evitando a exposição de chaves no lado do cliente.

### Dependências com outros sistemas

- API do Mapbox (Vector Tiles e GL JS para o mapa base)
- API do Spotify e Web Playback SDK (OAuth 2.0 e streaming de áudio)
- CDN do Cloudinary (Armazenamento e otimização de imagens)

## Arquitetura geral

Arquitetura baseada em um Monolito Serverless (Backend for Frontend), onde o Next.js atua tanto como cliente renderizador quanto como proxy de segurança para APIs externas. A interface é orientada a sobreposições (overlays) para evitar o desmonte do componente WebGL do mapa.

### Ambiente de implantação

- Cloud
- Implantação serverless e edge networking através do plano Hobby da Vercel.

### Tecnologias principais

- Next.js (App Router)
- React e TypeScript
- Tailwind CSS e Framer Motion
- Zustand (ou Context API) para estado global
- NextAuth.js
- Mapbox GL JS (via react-map-gl)
- Sentry (Observabilidade)

### Padrões adotados

- BFF (Backend for Frontend) via Route Handlers
- Feature Sliced Design para organização modular do repositório
- Lazy Loading para recursos pesados

## Componentes e responsabilidades

| Componente                 | Responsabilidades                                                                              | Dependências                            |
| -------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| Web Client                 | Renderiza UI, gerencia animações (Framer Motion), mantém o estado global ativo (mapa e player) | Route Handlers, Mapbox SDK, Spotify SDK |
| API Proxy (Route Handlers) | Isola segredos de API, atua como BFF e repassa dados de forma segura                           | Vercel Env, Mapbox API                  |
| NextAuth Service           | Gerencia o fluxo de OAuth 2.0, renovação de tokens (rotation) e sessão do usuário              | Spotify OAuth API                       |
| Mapbox Engine              | Mantém o contexto WebGL persistente em background para evitar gargalos de re-renderização      | WebGL, Mapbox Vector Tiles              |

## Fluxo de requisições e de dados

### Fluxo de requisição

- O usuário acessa a aplicação e o NextAuth valida a sessão do Spotify. Se não houver, redireciona para o OAuth.
- Após o OAuth bem-sucedido, a Lock Screen é exibida solicitando o PIN (4 dígitos) validado localmente.
- Com o PIN validado, o Web Client renderiza o Mapbox Engine, inicializa o Spotify Player SDK com o _access token_ da sessão e carrega a primeira memória, efetuando o _fly-to_.

### Fluxo de dados

- JSON estático (Local) → Web Client (Zustand/Context) → Mapbox (Markers) e Galeria Masonry (Imagens do Cloudinary).
- Client Player Action → Spotify Web Playback SDK → Spotify Desktop/Móvel (Execução do áudio).

## Modelo de dados (alto nível)

### Entidades principais

- Memory (Memória associada a um local e data)
- Image (Atributos visuais e dimensões da foto)

### Relações

- Uma Memory contém 1..N Images.

### Fonte de verdade

- Arquivo JSON estático e tipado, versionado junto ao repositório do código fonte (/src/data/memories.json).

## Interfaces públicas

| Nome                    | Tipo | Protocolo  | Exposição | SLAs/Limites                                 |
| ----------------------- | ---- | ---------- | --------- | -------------------------------------------- |
| Spotify Web API         | API  | REST/OAuth | Externa   | Limites do rate limit da API Spotify         |
| Mapbox API              | API  | HTTPS      | Externa   | 50.000 requisições/mês (Free Tier)           |
| Cloudinary CDN          | API  | HTTPS      | Externa   | Limite de largura de banda do plano gratuito |
| Internal Route Handlers | API  | REST       | Interna   | Latência controlada pela Vercel Edge         |

## Considerações de escalabilidade e disponibilidade

### Abordagem geral

- Aproveitar as otimizações estáticas e de cache na borda (Edge Network) fornecidas pela Vercel, mantendo as consultas a APIs externas estritamente controladas pelo BFF.

### Técnicas aplicadas

- Caching de imagens na borda via Cloudinary
- Opt-in em _lazy loading_ nativo para imagens do Next.js (next/image)
- Desacoplamento da renderização 3D do roteamento tradicional (usando overlays em vez de mudança de rota real).

### Meta de disponibilidade

- Uptime atrelado à infraestrutura da Vercel (estimado em 99.9% para rotas serverless).

## Segurança

### Autenticação

- Fluxo primário via OAuth 2.0 (NextAuth.js integrado ao Spotify Provider) garantindo acesso a tokens seguros. Fluxo secundário através de um PIN (desafio lógico via client-side).

### Autorização

- Acesso à interface do mapa e ao player concedido exclusivamente após resolução positiva da dupla autenticação (Spotify + PIN).

### Proteção de dados

- Prevenção contra vazamento configurando domínios estritos via remotePatterns no next.config.mjs para consumo de mídias.

### Gestão de segredos

- Segredos de clientes (Spotify, Mapbox) persistidos e gerenciados unicamente através das variáveis de ambiente na plataforma da Vercel (.env), inacessíveis para o _client bundle_.

## Observabilidade

### Logs

- Registros no Runtime da Vercel capturando avisos e falhas de requisição na camada de API.

### Métricas

- Acompanhamento de Core Web Vitals (LCP, FID, CLS) utilizando o Vercel Speed Insights.

### Tracing

- Sentry (Plano Developer) integrado via sentry/nextjs para capturar exceções silenciosas, erros de WebGL no client-side e tempo de transação nos Route Handlers.

### Dashboards e alertas

- Painel central do Sentry monitorando a saúde das integrações (ex: falhas de Playback ou tokens expirados do Spotify).

## Riscos arquiteturais e mitigação

### Queda de FPS e perda de performance no mapa

- **Probabilidade:** Média
- **Impacto:** Queda drástica na fluidez da navegação, comprometendo a experiência e a qualidade do portfólio.
- **Mitigação:** Desvincular a navegação da galeria do Next.js Router, utilizando modais e Bottom Sheets para garantir que o Mapbox nunca sofra re-mount.
- **Plano de contingência:** Desativar mapas 3D complexos (terreno/prédios) e utilizar o estilo _lightweight_ 2D nativo do Mapbox.

### Expiração do Token de Áudio (Spotify)

- **Probabilidade:** Alta (tokens duram 1 hora).
- **Impacto:** O player silencia ou trava caso o usuário navegue por um longo período contínuo.
- **Mitigação:** Implementar lógica nativa de _Refresh Token Rotation_ diretamente nos callbacks do NextAuth.js para atualizar o token silenciosamente no _background_.
- **Plano de contingência:** Acionar fallback visual solicitando um _re-login_ suave caso a rotação do token falhe.

### Abuso de Quota (Mapbox/Cloudinary)

- **Probabilidade:** Baixa
- **Impacto:** Interrupção do serviço (mapa indisponível ou quebra de links de imagens).
- **Mitigação:** Restringir por domínio (Whitelist HTTP) as chaves públicas dentro dos painéis do Mapbox e do Cloudinary, aceitando apenas conexões da origem de produção da Vercel e de localhost.
- **Plano de contingência:** Adotar temporariamente placeholders ou mapas _open-source_ se a cota gratuita estourar devido a exposição não intencional.

## ADRs e próximos passos

### ADRs associados

- ADR 001: Adoção do Sentry para Observabilidade Full-stack com custo zero.
- ADR 002: Gerenciamento de estado de navegação visual via Overlays sobrepostos em detrimento de roteamento via Next.js App Router para preservar instâncias do WebGL.
- ADR 003: Delegação de processamento e cache de assets visuais ao Cloudinary em vez de armazenamento no repositório.

### Decisões pendentes

- Necessidade de futura migração do modelo estático local (Mock JSON) para um CMS headless (ex: Sanity, Strapi).

### Próximos passos

- Concluir a inicialização técnica do projeto detalhada no Épico 0 (Setup do repositório, Tailwind e CI/CD).
