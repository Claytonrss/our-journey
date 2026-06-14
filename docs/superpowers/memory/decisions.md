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
