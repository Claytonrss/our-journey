# **PRD: Projeto Dia dos Namorados (Codinome: Our Journey)**

## **1. Visão Geral**

Uma aplicação web interativa desenvolvida para celebrar o Dia dos Namorados, focada em reviver memórias através de uma jornada geo-espacial e visual. O projeto também atua como um showcase técnico de arquitetura Front-end avançada, consumo seguro de APIs e design de interações.

## **2. Público-Alvo**

- **Primário:** Marina, focando em uma experiência emocional, fluida e intuitiva, especialmente em dispositivos móveis.
- **Secundário:** Tech Recruiters e Engenheiros avaliando o portfólio, focando na organização do código, performance, segurança e domínio do ecossistema React.

## **3. Escopo Funcional (Features)**

### **Autenticação em Duas Etapas**

- **Passo 1 - Autenticação Spotify (OAuth 2.0):** Tela inicial com botão para login seguro no Spotify, garantindo que o usuário Premium libere o uso do player nativo na aplicação antes de prosseguir.
- **Passo 2 - Lock Screen (PIN):** Tela minimalista com input para um PIN de 4 dígitos (data de início). Feedback visual de erro (shake animation) e sucesso (fade out transition).

### **Mapa Interativo e Navegação (Core)**

- **Renderização:** Globo ou mapa 3D/2D estilizado em harmonia com a paleta de cores da interface.
- **Modo História (Navegação Cronológica Automática):** Após o sucesso do PIN, a aplicação inicia como padrão a navegação por data, realizando um "fly-to" automático para o primeiro local visitado.
- **Painel de Memórias (Overlay):** A exibição do contexto do local ocorre através de um painel sobreposto (Bottom Sheet no mobile / Sidebar no desktop). O painel contém botões de "Próximo" e "Anterior" para navegar cronologicamente acionando novos "fly-tos".
- **Modo Livre:** O usuário pode fechar o painel de memórias a qualquer momento para explorar o mapa de forma livre.
- **Pins Especiais:** Marcadores com destaque visual para viagens marcantes (ex: Serra Negra, Guarujá) ou marcos importantes.

### **Galeria Dinâmica (Masonry & Lightbox)**

- Exibição de fotos em formato Masonry dentro do painel de cada local.
- Visualizador de imagens (Lightbox) interativo com suporte a gestos de swipe no mobile e navegação por teclado no desktop.

### **Trilha Sonora Integrada**

- Player de música fixo e discreto na interface consumindo o **Spotify Web Playback SDK**.
- Controle de play/pause e gerenciamento de faixas diretamente pela interface.

## **4. Diretrizes de UI/UX**

- **Mood e Atmosfera:** Minimalista, moderno, imersivo e romântico. A interface deve ser o palco para as fotos e para o mapa, sem poluição visual.
- **Paleta de Cores:** Dark Mode elegante como base (tons profundos de cinza/chumbo ou azul noturno) com acentos em Dourado para os pins especiais e botões de ação principal, criando um contraste sofisticado.
- **Tipografia:**
  - **Títulos/Datas:** Fonte serifada elegante (ex: Playfair Display ou Lora) para trazer um toque clássico e editorial às memórias.
  - **UI/Corpo de Texto:** Fonte sem serifa geométrica e limpa (ex: Inter ou Roboto) para máxima legibilidade nos painéis e botões.
- **Interações:** Transições suaves, aproveitando o Framer Motion para garantir que modais e bottom sheets não apareçam de forma brusca.

## **5. Requisitos Não-Funcionais e Arquitetura**

### **Stack Tecnológico e Scaffolding**

- **Framework:** Next.js (App Router) com React e TypeScript.
- **Estrutura Otimizada:** Scaffolding inicial configurado de forma previsível (ex: separação clara de /components, /lib, /hooks, /services) visando facilitar a geração de código e manutenção assistida por agentes de IA.
- **Autenticação:** NextAuth.js.
- **Estilização:** Tailwind CSS.
- **Animações:** Framer Motion.
- **Mapa:** Mapbox GL JS (via react-map-gl).

### **Segurança e Performance**

- **Proteção de Chaves:** Chaves de API (Mapbox, Spotify Client Secret) isoladas no server-side usando Route Handlers do Next.js.
- **Storage e CDN (Cloudinary):** Armazenamento externo de fotos para manter o repositório leve. Integração com next/image para otimizações (WebP, resizing) on-the-fly.
- **Contexto WebGL:** Preservação da renderização do mapa em background sob os painéis de navegação, evitando desmontagem de componentes para garantir transições de câmera fluidas e sem quedas de FPS.

## **6. Estratégia de Deploy**

- **Plataforma:** Vercel (plano Hobby).
- **Segurança:** Variáveis de ambiente configuradas diretamente no painel da Vercel.
- **CI/CD:** Deploy automático a cada push na branch main.

## **7. Quebra de Épicos (Agent-Ready Specification)**

Esta seção define as diretrizes rigorosas de implementação para garantir que agentes autônomos compreendam os contratos de dados, a arquitetura e os padrões de qualidade exigidos.

### **Épico 0: Setup, Infraestrutura e Padrões de Qualidade**

**Descrição:** Estabelecer a fundação absoluta do projeto. Nenhuma feature funcional deve ser desenvolvida antes da conclusão deste épico.

- **Tarefas:**
  - Inicializar o Next.js (App Router) com TypeScript, Tailwind CSS, ESLint e Prettier.
  - **Git Hooks & CI:** Configurar Husky + lint-staged para garantir formatação e tipagem antes do commit. Adicionar Commitlint (padrão Conventional Commits).
  - **Templates de Repositório:** Criar .github/pull_request_template.md exigindo evidências visuais de alterações de UI.
  - **Arquitetura de Pastas:** Implementar a estrutura de diretórios base: /src/app, /src/components/ui (primitivos), /src/components/features, /src/hooks, /src/lib (utils), /src/types, /src/services.
  - **Tailwind & Design Tokens:** Configurar tailwind.config.ts com a paleta de cores (ex: brand-gold: '#D4AF37', bg-dark: '#121212') e tipografia (variáveis do Next/Font para Inter e Playfair Display).
  - **Configuração de CDN:** Configurar remotePatterns no next.config.mjs para permitir o domínio do Cloudinary.

### **Épico 1: Contratos de Dados e Estado Global**

**Descrição:** Definir a modelagem JSON e as interfaces TypeScript que alimentarão o mapa e a galeria, garantindo tipagem forte em toda a aplicação.

- **Tarefas:**
  - Criar /src/types/memory.types.ts contendo a interface principal.
  - Estruturar o JSON mock inicial em /src/data/memories.json.
  - Criar um arquivo de serviço (/src/services/memoryService.ts) com chamadas assíncronas simuladas para ler o JSON, permitindo futura migração para um CMS sem refatorar componentes.
  - Configurar gerenciador de estado (Context API ou Zustand) para rastrear o activeMemoryId e a viewMode (story ou free).
- **Template do JSON (Contrato Exigido):**

```json
{
  "memories": [
    {
      "id": "memory-01",
      "title": "Fim de semana em Serra Negra",
      "date": "2026-03-16",
      "coordinates": { "lng": -46.7006, "lat": -22.6126 },
      "isSpecialPin": true,
      "description": "Nossa viagem relaxante para o interior.",
      "images": [
        {
          "url": "https://res.cloudinary.com/seu-id/image/upload/v1/serra-negra-1.jpg",
          "alt": "Foto da pousada",
          "width": 1080,
          "height": 1350
        }
      ]
    }
  ]
}
```

### **Épico 2: Autenticação (OAuth + PIN Lock Screen)**

**Descrição:** Implementar a barreira de segurança e autorização utilizando NextAuth para o Spotify e verificação client-side para o PIN.

- **Tarefas:**
  - Instalar next-auth e configurar o SpotifyProvider.
  - Definir scopes obrigatórios: streaming, user-read-email, user-read-private.
  - Criar a UI da Lock Screen (input de 4 dígitos).
  - Integrar Framer Motion: Animação de sucesso (fade out) e erro (shake, keyframes de translação X).
  - Criar a lógica de proteção de rota: o acesso ao mapa só é renderizado se session.status === 'authenticated' E isPinValid === true.

### **Épico 3: Motor Geo-Espacial (Mapbox GL JS)**

**Descrição:** Renderização do mapa interativo e lógica de movimentação de câmera (Fly-to), mantendo o contexto WebGL persistente.

- **Tarefas:**
  - Instalar react-map-gl e mapbox-gl.
  - Renderizar o componente base do mapa passando o Mapbox Token via variável de ambiente NEXT_PUBLIC_MAPBOX_TOKEN (Configurar restrições de URL no painel do Mapbox para segurança).
  - Mapear o array de memories e renderizar componentes Marker.
  - Implementar estilização condicional dos Pins: Se isSpecialPin for true, aplicar classes Tailwind para glow dourado e ícone diferenciado.
  - Implementar a função flyToMemory(id): Acionar a API do Mapbox flyTo com duração de ~2500ms e curva de animação suave, atualizando o estado global activeMemoryId.

### **Épico 4: Modo História, Painel de Memórias e Galeria**

**Descrição:** Desenvolvimento da interface sobreposta (Overlay) e navegação do conteúdo visual, sincronizada com as animações do mapa.

- **Tarefas:**
  - Criar componente MemoryPanel (Bottom Sheet mobile via Framer Motion drag="y" / Sidebar desktop).
  - Implementar botões "Anterior" e "Próximo" que iteram sobre o array de memórias, acionando automaticamente a função flyToMemory do Épico 3.
  - Criar componente MasonryGallery. Usar next/image passando os parâmetros width e height obrigatórios do JSON mock.
  - Instalar biblioteca de Lightbox (ex: yet-another-react-lightbox) e conectar ao clique nas fotos do Masonry.

### **Épico 5: Integração de Áudio (Spotify Web Playback SDK)**

**Descrição:** Criar um player customizado que controle nativamente o playback do Spotify do usuário logado.

- **Tarefas:**
  - Carregar o script do Web Playback SDK dinamicamente no client.
  - Inicializar o player utilizando o access_token retornado pelo NextAuth.
  - Lidar com os listeners do SDK (ready, player_state_changed) para atualizar o estado do React.
  - Criar UI de controle (Minimalista e fixa na borda da tela) contendo Play/Pause, capa do álbum em miniatura e nome da faixa.
  - Transferir o playback automaticamente para este novo "Device" quando a aplicação carregar.
