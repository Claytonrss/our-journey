# Changelog — Our Journey

## 2026-06-14

- **docs:** reorganização completa da documentação — roadmap, backlog, changelog, arquitetura consolidada
- **feat:** integração híbrida Superpowers + ECC com hooks mínimos e bridge skills
- **feat:** memória persistente para IA em markdown (`docs/superpowers/memory/`)
- **docs:** AGENTS.md trimado para 108 linhas com ponteiros para arquivos de memória

## 2026-06-13

- **chore:** upgrade Vitest para v3 corrigindo advisories críticas e altas
- **feat:** headers de segurança em `next.config.ts` (X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy)
- **feat:** rate limiting na validação do PIN — 5 tentativas, 60 segundos de lockout
- **feat:** validação Zod de env pública (`NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI`)
- **fix:** resolução de todos os warnings do ESLint
- **ci:** upgrade pipeline — pnpm v4, caching, coverage upload
- **feat:** logger estruturado com redação de campos sensíveis
- **fix:** `memoryService` lança erro em dev quando `memories.json` falha validação
- **test:** implementação da suíte de testes unitários com Vitest (88 testes, 14 arquivos)
