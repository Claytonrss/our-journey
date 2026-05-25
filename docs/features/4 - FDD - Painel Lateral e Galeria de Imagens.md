# FDD: Painel Lateral e Galeria de Imagens (Épico 4)

**Versão:** 1.0

**Data:** 24/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

Para preservar a instância do WebGL (Mapbox) e evitar recarregamentos pesados de interface, a exibição dos detalhes de cada memória deve ocorrer em uma camada sobreposta (_overlay_). A aplicação precisa de um painel responsivo que exiba a descrição do momento e uma galeria de fotos otimizada em formato Masonry, garantindo alta performance de carregamento e um aspeto visual elegante, sem comprometer a fluidez da navegação no mapa em segundo plano.

## 2. Objetivos técnicos

- Desenvolver um componente de _Overlay_ (Painel/Bottom Sheet) com animações fluidas de entrada e saída (Framer Motion).
- Sincronizar a visibilidade e o conteúdo do painel com o estado global (activeMemoryId do Zustand).
- Implementar a galeria _Masonry_ utilizando o componente next/image acoplado ao _loader_ do Cloudinary para otimização dinâmica (WebP/AVIF).
- Garantir suporte a gestos (_swipe down_) no mobile e comportamento fixo em monitores de grande formato (4K/32").

## 3. Escopo e exclusões

### Dentro do escopo:

- Componente de _Overlay_ adaptativo (_Bottom Sheet_ para mobile, painel lateral para desktop).
- Integração de animações com Framer Motion (_slide up/in_).
- Galeria estilo _Masonry_ integrada nativamente com next/image.
- Consumo reativo do Zustand para renderizar conteúdos da memória ativa.

### Fora do escopo:

- Controles de player de áudio (Épico 5).
- Funcionalidades de edição ou upload de imagens.
- _Lightbox_ (zoom em ecrã inteiro) das fotos.

## 4. Fluxos e cenários de uso

### Cenário 1: Abertura e Animação do Painel

O estado activeMemoryId é preenchido. O componente Overlay deteta a mudança, inicia a animação de entrada e carrega a galeria _Masonry_ de forma assíncrona, consumindo o array de imagens da memória ativa.

### Cenário 2: Navegação e Otimização

Durante o _scroll_ na galeria, o next/image utiliza o _lazy loading_ nativo para realizar requisições ao Cloudinary apenas das imagens dentro da _viewport_, otimizando a largura de banda.

### Cenário 3: Fecho do Painel

Gesto _swipe down_ ou clique fora da área ativa dispara a animação de saída e limpa o activeMemoryId na _store_, permitindo que o utilizador retome o modo de exploração livre no mapa.

## 5. Contratos e interfaces públicas

### Props do Overlay (src/components/Overlay/index.tsx):

```typescript
interface OverlayProps {
  memory: Memory | null;
  onClose: () => void;
  isMobile: boolean;
}
```

### Props da Galeria Masonry (src/components/MasonryGallery/index.tsx):

```typescript
interface MasonryGalleryProps {
  images: Image[];
  columns?: { mobile: number; desktop: number };
}
```

## 6. Tratamento de erros e resiliência

- **Falha no Carregamento de Imagem:** Utilização do evento onError do next/image para substituir imagens falhadas por um _placeholder_ discreto (surface-dark), mantendo a integridade do layout _Masonry_.
- **Dados Incompletos:** Memórias sem imagens exibem apenas texto (descrição/data), sem criar _layouts_ vazios ou quebrados.

## 7. Observabilidade

- **Métricas:** _Web Vitals_ focados em _Largest Contentful Paint_ (LCP) da galeria, medindo o tempo de carregamento das primeiras imagens via Cloudinary no painel.

## 8. Dependências e compatibilidade

| Componente    | Versão mínima | Observações                            |
| ------------- | ------------- | -------------------------------------- |
| Framer Motion | v11.x         | Animações complexas de interface       |
| Next.js Image | v14.x         | Otimização automática e _lazy loading_ |

## 9. Critérios de aceitação técnicos

- O painel deve abrir/fechar sem causar _re-render_ ou _flicker_ no componente WebGL do Mapbox.
- A galeria _Masonry_ deve ser responsiva e manter o alinhamento correto das fotos sem sobreposição.
- Em ecrãs 4K (desktop), o painel deve ter uma largura máxima (max-w-md) para manter a legibilidade do texto.

## 10. Riscos e mitigação

### Risco (Performance):

Layout _Masonry_ causar saltos de conteúdo (_Layout Shift_) ao carregar imagens.

- **Mitigação:** Definir dimensões explícitas ou _aspect-ratio_ nas imagens (next/image) para reservar o espaço antes mesmo da imagem carregar.
