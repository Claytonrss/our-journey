# FDD: Setup, Infraestrutura e Padrões de Qualidade (Épico 0) V2

**Versão:** 1.0

**Data:** 24/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

O projeto necessita de uma fundação robusta que suporte o desenvolvimento ágil e automatizado, garantindo qualidade de código desde o primeiro commit. A configuração de ferramentas de automação (pre-commit hooks), a padronização da esteira de integração contínua (CI), o gerenciamento de repositório no GitHub e a padronização estrutural das convenções do Next.js App Router são essenciais para manter a consistência, servindo de alicerce para todas as integrações complexas previstas no HLD.

## 2. Objetivos técnicos

- Garantir 100% de tipagem estática no boilerplate inicial e nos arquivos de configuração.
- Automatizar a validação de formatação, padronização de commits e análise estática antes de permitir o envio de alterações ao repositório remoto.
- Garantir que nenhum código seja integrado à branch principal sem passar com sucesso pelas validações automáticas da esteira de CI (GitHub Actions).
- Prover documentação de onboarding clara e concisa via README.md para guiar agentes autônomos de desenvolvimento.

## 3. Escopo e exclusões

### Dentro do escopo

- Inicialização do Next.js (App Router) com suporte nativo a TypeScript.
- Configuração do Tailwind CSS, injetando os tokens de cores customizados (ex: brand-gold, bg-dark) e mapeamento das fontes de sistema (next/font para Inter e Playfair Display).
- Setup de qualidade: ESLint, Prettier, Husky, lint-staged e Commitlint (padrão _Conventional Commits_).
- **Configuração do Repositório GitHub e Esteira (CI):** Criação do workflow do GitHub Actions (.github/workflows/ci.yml) para execução de linters, testes de tipagem e validação de build em cada Pull Request direcionado à branch main.
- **Templates de PR:** Criação do arquivo .github/pull_request_template.md exigindo descrição técnica, checklist de qualidade e seção para evidências visuais de alteração na interface de UI.
- **Documentação Técnica Base:** Criação de um README.md detalhado com arquitetura, guia de setup local, gerenciamento de segredos/variáveis de ambiente e dicionário de scripts npm.
- Estruturação física dos diretórios do projeto sob a pasta src.
- Liberação de domínio seguro do Cloudinary no arquivo next.config.mjs.

### Fora do escopo

- Criação de componentes visuais reutilizáveis funcionais (ex: botões reais, modais, inputs).
- Configuração do NextAuth.js ou lógica de login com o provedor do Spotify.
- Inicialização do SDK do Mapbox ou renderização do mapa na tela.
- Integração de pacotes ou arquivos de configuração do Sentry.

## 4. Fluxos e cenários de uso

### Cenário 1: Validação Automatizada de Código Local (Pre-commit Hook)

- O desenvolvedor realiza alterações e executa git commit -m "feat: setup design tokens".
- O Husky intercepta a ação através do gatilho pre-commit.
- O lint-staged isola os arquivos modificados e executa a formatação via Prettier e análise via ESLint.
- O Husky intercepta o gatilho commit-msg para validar o padrão do texto via Commitlint.
- Se correto, o commit é consolidado localmente.

### Cenário 2: Validação na Esteira de Integração Contínua (GitHub CI)

- O desenvolvedor realiza o push de uma branch e abre um Pull Request para a main.
- O GitHub Actions dispara automaticamente o workflow de CI.
- A esteira realiza o checkout do código, instala as dependências via cache, valida a formatação, executa o linter e roda o comando de build estático do Next.js.
- O Pull Request só é liberado para merge se todas as verificações passarem com sucesso (Green Build).

## 5. Contratos e interfaces públicas

### Pipeline de CI (.github/workflows/ci.yml)

```yaml
name: Continuous Integration
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Check Formatting
        run: npm run format:check
      - name: Run Linter
        run: npm run lint
      - name: Verify TypeScript & Build
        run: npm run build
```

### Template de Pull Request (.github/pull_request_template.md)

```markdown
## 📝 Descrição

Forneça um resumo claro e conciso das alterações introduzidas por este PR.

## 🛠️ Tipo de Alteração

- [ ] feat: Nova funcionalidade
- [ ] fix: Correção de bug
- [ ] chore: Atualização de infraestrutura/configuração
- [ ] refactor: Refatoração de código sem alteração funcional

## 🔬 Checklist de Qualidade

- [ ] O código compila localmente sem erros de linter ou TypeScript?
- [ ] Segue os padrões arquiteturais estabelecidos no HLD?
- [ ] Nenhuma chave de API ou segredo foi exposto?

## 📸 Evidências Visuais (Se aplicável)

Insira screenshots ou gravações demonstrando as mudanças visuais (Mobile e Desktop).
```

### Estrutura do README.md Exigida

```markdown
# Our Journey 🌍✨

Projeto interativo de mapa e galeria de memórias com integração ao Spotify Web Playback SDK.

## 🚀 Como Começar (Setup Local)

1. Instale as dependências: `npm install`
2. Configure o arquivo `.env.local` baseado no `.env.example`
3. Execute em modo de desenvolvimento: `npm run dev`

## 🗂️ Arquitetura de Pastas

Explicação sucinta de `/src/app`, `/src/components`, `/src/hooks`, `/src/lib`, `/src/services`.

## 🛠️ Scripts Úteis

- `npm run dev`: Inicia ambiente local
- `npm run build`: Valida tipagem e gera build de produção
- `npm run lint`: Executa análise estática do código
```

## 6. Tratamento de erros e resiliência

- **Quebra de CI no GitHub:** Caso o build ou as tipagens falhem na esteira remota, a proteção de branch configurada no GitHub deve bloquear o merge na branch main, notificando o desenvolvedor através do status do Pull Request.
- **Falha de Linting Local:** O Husky aborta a operação antes do commit ser gerado, exibindo a linha exata e a regra do ESLint que foi violada.

## 7. Observabilidade

Nesta fase, restrita aos logs estruturados gerados no terminal durante o desenvolvimento e ao sumário de erros fornecido pelas Actions do GitHub no caso de quebra da esteira de CI.

## 8. Dependências e compatibilidade

| Componente     | Versão mínima       | Observações                                   |
| -------------- | ------------------- | --------------------------------------------- |
| Node.js        | v20.x ou superior   | Ambiente de execução estável para Next.js 14+ |
| GitHub Actions | v4 (checkout/setup) | Garante suporte a runners modernos do Ubuntu  |
| Husky          | v9.x                | Mecanismo de automação de githooks locais     |

## 9. Critérios de aceitação técnicos

- O arquivo .github/workflows/ci.yml deve disparar e concluir com sucesso em cenários de Pull Request válido.
- A execução do comando npm run build não pode emitir avisos de tipagem ou compilações quebradas.
- Tentativas de realizar commits com mensagens fora da convenção convencional devem falhar localmente.
- O repositório deve conter o arquivo README.md preenchido com as instruções de inicialização de ambiente local.

## 10. Riscos e mitigação

### Falhas de build intermitentes na esteira por problemas de cache de dependências

- **Probabilidade:** Baixa
- **Impacto:** Médio
- **Mitigação:** Utilizar a funcionalidade nativa de cache de pacotes fornecida pela action oficial actions/setup-node@v4 apontando para o gerenciador npm, reduzindo o tempo de instalação e mitigando timeouts.
