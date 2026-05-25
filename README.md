# Our Journey 🌍✨

Projeto interativo de mapa e galeria de memórias com integração ao Spotify Web Playback SDK.

## 🚀 Como Começar (Setup Local)

1. Instale as dependências: `pnpm install`
2. Configure o arquivo `.env.local` baseado no `.env.example`
3. Execute em modo de desenvolvimento: `pnpm run dev`

## 🗂️ Arquitetura de Pastas

- `/src/app`: Rotas e páginas do Next.js (App Router).
- `/src/components`: Componentes visuais e de UI reutilizáveis.
- `/src/hooks`: Custom React hooks para lógica reutilizável.
- `/src/lib`: Funções utilitárias e configurações de bibliotecas externas.
- `/src/services`: Integrações com APIs externas (ex: Spotify, Cloudinary, Firebase).

## 🛠️ Scripts Úteis

- `pnpm run dev`: Inicia ambiente local
- `pnpm run build`: Valida tipagem e gera build de produção
- `pnpm run lint`: Executa análise estática do código
- `pnpm run format:check`: Verifica a formatação do código com Prettier
