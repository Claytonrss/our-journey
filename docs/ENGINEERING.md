# Engineering Guidelines

Este guia define os guardrails práticos para evoluir o Our Journey com previsibilidade. Use junto com `docs/ARCHITECTURE.md`: a arquitetura explica as decisões; este documento transforma essas decisões em hábitos de trabalho.

## Princípios

- Simplicidade primeiro: o projeto é um portfólio interativo, não uma plataforma genérica.
- Segredos ficam no servidor.
- O mapa é a superfície principal e deve permanecer estável durante a experiência.
- Falhas externas precisam degradar a UX, não quebrar a aplicação.
- Mudanças pequenas, verificáveis e bem nomeadas valem mais do que refactors amplos.

## Fluxo de Trabalho

Antes de alterar:

- Leia `docs/ARCHITECTURE.md` quando a mudança tocar auth, mapa, player, dados ou integrações externas.
- Verifique se a mudança exige segredo, estado global, route handler ou schema novo.
- Preserve mudanças existentes no worktree que não fazem parte da tarefa.

Durante a alteração:

- Use pnpm para qualquer comando do projeto.
- Mantenha o escopo próximo da feature ou correção.
- Prefira padrões existentes em `src/app`, `src/components/features`, `src/hooks`, `src/services` e `src/types`.
- Atualize documentação quando uma decisão arquitetural mudar.

Antes de entregar:

- Rode os comandos adequados ao risco da mudança.
- Faça smoke test manual dos fluxos afetados.
- Confirme que nenhuma variável privada foi exposta no client.

## Comandos Oficiais

```bash
pnpm run dev
pnpm run lint
pnpm run format:check
pnpm run build
```

Regras:

- `pnpm run build` é obrigatório para mudanças em tipos, rotas, config, dados, auth, Mapbox, Spotify ou Cloudinary.
- `pnpm run lint` e `pnpm run format:check` devem passar antes de PR.
- `pnpm run format` pode ser usado, mas evite formatar arquivos fora do escopo sem necessidade.
- Não usar npm ou yarn.

## Checklist de PR

Use este checklist para qualquer mudança relevante:

- A mudança preserva o fluxo de PIN e sessão?
- Nenhum segredo foi movido para código client?
- O mapa continua montado durante navegação/overlay?
- Estados de loading, erro e vazio foram considerados?
- Dados novos ou alterados passam por schema Zod?
- O fallback de Spotify/áudio continua funcional?
- Mobile foi verificado quando há alteração visual?
- `pnpm run lint` passou?
- `pnpm run format:check` passou ou a pendência está documentada?
- `pnpm run build` passou quando aplicável?
- Documentação foi atualizada quando houve mudança de contrato ou arquitetura?

## Client e Server

Use server components por padrão. Adicione `'use client'` somente quando o arquivo precisar de:

- estado React ou efeitos;
- hooks client, como Zustand ou `useSession`;
- browser APIs, como `window`, `sessionStorage`, WebGL e áudio;
- animações/interações que dependem do client.

Guardrails:

- Componentes client não devem ler env privada.
- Código server-only não deve importar serviços que dependem de `window` ou `document`.
- Dados sensíveis devem cruzar a fronteira via route handler, server action ou sessão.

## Estado

Use Zustand apenas para estado compartilhado entre áreas da experiência:

- memória ativa;
- memória selecionada;
- modo de visualização;
- player;
- PIN;
- fallback de áudio.

Evite colocar no store:

- dados derivados que podem ser calculados;
- respostas de API sem necessidade global;
- estado temporário de componente;
- objetos grandes ou instâncias de SDK.

## BFF e Integrações Externas

Toda integração com segredo deve passar pelo servidor.

Env vars devem ser acessadas pelos módulos centrais:

- `src/lib/env.ts` para valores privados/server-side.
- `src/lib/publicEnv.ts` para valores públicos permitidos no client.

Padrões esperados:

- Route handlers retornam respostas pequenas e previsíveis.
- Erros esperados usam status HTTP correto.
- Tokens e secrets nunca aparecem em logs.
- Serviços externos devem ter fallback, timeout ou erro controlado quando forem parte de uma jornada crítica.

Integrações atuais:

- Spotify OAuth e refresh token em `src/auth.ts`.
- Access token Spotify exposto ao client somente por `/api/spotify-token`.
- Token Mapbox exposto ao client por `/api/mapbox-token`.
- Imagens servidas por Cloudinary e restringidas em `next.config.ts`.

## Mapa e Experiência

O mapa é tratado como superfície persistente.

Guardrails:

- Não criar navegação por rota para cada memória se isso desmontar `MapView`.
- Preferir overlays, sheets e painéis sobre o mapa.
- Preservar `reuseMaps`.
- Manter fallback explícito para erro de WebGL ou token Mapbox.
- Testar desktop e mobile quando mexer em overlay, pin ou navegação.

## Dados de Memórias

Fonte de verdade:

- `src/data/memories.json`
- `src/types/index.ts`
- `scripts/generate-memories.ts`

Ao alterar dados:

- mantenha `date` em `YYYY-MM-DD`;
- valide coordenadas;
- mantenha `images` com `publicId`, `alt`, `width` e `height`;
- atualize schemas e consumidores se o contrato mudar;
- rode `pnpm run build` para passar pela geração e validação.

## Resiliência

Para qualquer chamada externa ou dependência de browser:

- defina estado de loading;
- defina estado de erro;
- evite bloquear a experiência principal;
- degrade para fallback quando possível;
- registre erro no servidor sem dados sensíveis.

Exemplos:

- Spotify falha: mapa continua e áudio local pode assumir.
- Mapbox token falha: exibir fallback do mapa.
- `memories.json` inválido: retornar lista vazia hoje, mas tratar como falha de conteúdo durante desenvolvimento.

## Testes

Hoje não há suíte automatizada. A direção aprovada está em `docs/ARCHITECTURE.md`.

Quando a base for criada, a expectativa será:

- unitários para schemas, env, helpers e route handlers;
- testes de componentes para UI com decisão lógica;
- Playwright para PIN, mapa mockado, overlay, fallback e responsividade;
- mocks para Spotify, Mapbox e Cloudinary nos testes automatizados.

Não adicionar testes que dependam de contas reais, tokens reais ou estado externo instável.

## Documentação

Atualize documentação quando:

- uma fronteira client/server mudar;
- uma env var for adicionada, removida ou renomeada;
- um contrato de dados mudar;
- uma integração externa mudar;
- um novo guardrail virar necessário;
- uma decisão arquitetural alterar o comportamento esperado.

Documentos principais:

- `docs/ARCHITECTURE.md`: arquitetura operacional e plano técnico.
- `docs/HLD.md`: visão de alto nível.
- `docs/features/`: decisões e escopo por feature.
- `.env.example`: contrato público de configuração local.

## Commits

O projeto usa Conventional Commits.

Exemplos:

```text
docs: add architecture guide
feat: add map fallback state
fix: handle spotify token refresh failure
test: cover memory schema validation
chore: update formatting config
```

Commits devem ser pequenos o suficiente para revisão objetiva. Evite misturar refactor, feature e formatação ampla no mesmo commit.
