# FDD: Integração e Renderização do Mapbox (Épico 3)

**Versão:** 1.0

**Data:** 24/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

A experiência visual principal da aplicação é ancorada num mapa interativo em 3D. A integração do Mapbox GL JS (através do react-map-gl) é essencial para plotar as coordenadas espaciais das memórias. O maior desafio técnico desta etapa é garantir que o componente do mapa seja instanciado uma única vez, evitando a perda do contexto WebGL e quedas de _framerate_ (FPS) durante a navegação entre os pontos, o que exige um acoplamento preciso com o estado global (Zustand) e o uso de sobreposições (overlays) na UI.

## 2. Objetivos técnicos

- Integrar a biblioteca react-map-gl nativamente no ecossistema Next.js (App Router).
- Consumir a _store_ do Zustand para renderizar marcadores baseados nos dados do memories.json.
- Implementar a função de animação de câmara (flyTo) para transitar suavemente entre as coordenadas sempre que o activeMemoryId for alterado no estado global.
- Garantir que a chave pública do Mapbox seja carregada com segurança através de variáveis de ambiente.

## 3. Escopo e exclusões

### Dentro do escopo

- Configuração do componente base do mapa e injeção do _style_ visual do Mapbox.
- Criação de marcadores customizados (Pins) no mapa para cada memória.
- Lógica de escuta (_listener_) do Zustand para disparar a animação flyTo na alteração de memória ativa.
- Tratamento de _Error Boundary_ específico para falhas na renderização do WebGL.

### Fora do escopo

- Construção do painel lateral (Bottom Sheet) com a galeria de imagens (Épico 4).
- Lógica de reprodução do Spotify (Épico 5).
- Roteamento real de páginas (o mapa operará numa _Single Page Application_ por cima da rota principal).

## 4. Fluxos e cenários de uso

### Cenário 1: Inicialização do Mapa

- A página é carregada (após a passagem pela Lock Screen do Épico 2).
- O componente do Mapa lê as memórias a partir do Zustand.
- O Mapbox é inicializado e os marcadores são plotados.
- O mapa foca automaticamente (via flyTo inicial) nas coordenadas do activeMemoryId atual.

### Cenário 2: Animação e Interação (Fly-to)

- O estado global activeMemoryId é atualizado por uma ação externa.
- O componente do Mapa reage a esta mudança de estado.
- É invocada a API de câmara do Mapbox (map.flyTo({ center: [lng, lat], zoom: 15 })).
- A câmara transita suavemente sem que o mapa sofra um processo de desmontagem e montagem (_unmount/remount_).

## 5. Contratos e interfaces públicas

### Contrato de Props do Componente do Mapa

```typescript
import type { MapRef } from 'react-map-gl';

interface MapComponentProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  mapStyle?: string; // ex: 'mapbox://styles/mapbox/light-v11'
}
```

## 6. Tratamento de erros e resiliência

- **Ausência de Chave API / Token Inválido:** Se o NEXT*PUBLIC_MAPBOX_TOKEN não for detetado ou for rejeitado, o componente deve renderizar um bloco de \_fallback* visual amigável (ex: fundo com cor sólida e ícone discreto) em vez de um ecrã branco quebrado.
- **Dispositivos sem suporte WebGL:** Implementar uma validação prévia; se o navegador não suportar WebGL, exibir uma mensagem clara informando sobre a limitação do dispositivo.

## 7. Observabilidade

- **Métricas de Performance:** O Vercel Speed Insights capturará métricas de bloqueio da _main thread_ (TBT) durante o carregamento inicial dos _tiles_ pesados do Mapbox.

## 8. Dependências e compatibilidade

| Componente   | Versão mínima | Observações                                 |
| ------------ | ------------- | ------------------------------------------- |
| mapbox-gl    | v3.x          | Motor central WebGL                         |
| react-map-gl | v7.x          | Wrapper oficial do ecossistema React/Mapbox |

## 9. Critérios de aceitação técnicos

- O mapa deve preencher 100% do ecrã disponível visualmente e deve manter-se sempre no nível z-index mais baixo.
- A modificação do activeMemoryId no Zustand **não pode** disparar recarregamentos da página inteira ou remontar a árvore de componentes do WebGL.
- Os marcadores interativos devem representar as coordenadas lat/lng corretas carregadas do memories.json.

## 10. Riscos e mitigação

### Remontagem acidental do contexto WebGL (Flickering)

- **Probabilidade:** Média.
- **Impacto:** Quedas de FPS, ecrã piscando, má experiência visual.
- **Mitigação:** Utilizar React.memo nos marcadores, evitar passar objetos ou _arrays_ inline como dependências no componente do mapa e garantir que a estrutura DOM do mapa não esteja condicionalmente oculta na árvore React.
