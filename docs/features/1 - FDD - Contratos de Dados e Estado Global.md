# FDD: Contratos de Dados e Estado Global (Épico 1)

**Versão:** 1.0

**Data:** 24/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

A aplicação exige um controlo rigoroso de estado e de dados para garantir a sincronização em tempo real entre o mapa 3D (WebGL), a galeria de imagens e o leitor do Spotify. A utilização do Zustand é motivada pela necessidade de atualizações de estado atómicas (evitando _re-renders_ globais que prejudicariam a performance do Mapbox) e pela necessidade de contratos de dados estritos (TypeScript) que garantam previsibilidade no consumo das memórias a partir de um ficheiro de origem estática.

## 2. Objetivos técnicos

- Definir e tipar rigorosamente a interface de dados das memórias (ex: Memory, Image) utilizando TypeScript.
- Criar e estruturar o ficheiro JSON _mock_ (memories.json) que servirá como fonte de verdade (_Single Source of Truth_) nesta fase.
- Implementar a _store_ global com Zustand para gerir o estado de navegação (activeMemoryId, viewMode) e o estado de sincronização do leitor de áudio (isPlaying, currentTrack).
- Criar uma camada de serviço de abstração (memoryService.ts) para o consumo do JSON, garantindo que os componentes front-end não acedam diretamente ao ficheiro.

## 3. Escopo e exclusões

### Dentro do escopo

- Criação das interfaces de tipagem estática no diretório src/types/.
- Criação do ficheiro memories.json contendo o contrato estrito no diretório src/data/.
- Implementação do memoryService.ts para ler os dados do ficheiro JSON de forma assíncrona.
- Configuração e instanciação da _store_ global do Zustand no diretório src/hooks/useAppStore.ts.

### Fora do escopo

- Desenho e implementação de componentes visuais do interface de utilizador (UI).
- Integração real com as APIs do Mapbox ou do Spotify.
- Lógica de animação de transição entre memórias.

## 4. Fluxos e cenários de uso

### Cenário 1: Inicialização dos Dados e Estado

- A aplicação é carregada pelo utilizador.
- O componente invoca de forma assíncrona o memoryService.getMemories().
- O serviço analisa o memories.json e retorna o array de memórias tipado.
- A _store_ do Zustand é inicializada, definindo o viewMode para 'story' e o activeMemoryId com o ID do primeiro item do array.

### Cenário 2: Interação de Mudança de Memória

- Um evento de clique ocorre na interface (ex: botão "Próximo").
- A ação invoca setActiveMemoryId(novoId) na _store_ do Zustand.
- Apenas os componentes explicitamente subscritos a activeMemoryId (como o mapa e o painel de contexto) sofrem _re-render_.

## 5. Contratos e interfaces públicas

### Interface de Dados (Memory)

```typescript
interface Image {
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface Memory {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  coordinates: { lat: number; lng: number };
  isSpecialPin: boolean;
  description: string;
  images: Image[];
}
```

### Interface do Estado Global (Zustand Store)

```typescript
interface AppState {
  activeMemoryId: string | null;
  viewMode: 'story' | 'free';
  isPlaying: boolean;
  currentTrack: Record<string, any> | null;

  // Ações
  setActiveMemoryId: (id: string | null) => void;
  setViewMode: (mode: 'story' | 'free') => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: any) => void;
}
```

## 6. Tratamento de erros e resiliência

- **Falha na leitura ou conversão dos dados:** O memoryService deve implementar um bloco try/catch. Caso ocorra uma falha na leitura do ficheiro JSON ou o contrato não seja cumprido, o serviço deve registar o erro na consola (ambiente de desenvolvimento) e retornar um _array_ vazio ([]). Esta degradação graciosa impede que a aplicação bloqueie completamente.

## 7. Observabilidade

**Logs:**

- Registos no nível error da consola (console.error) caso haja uma falha estrutural no processamento do ficheiro JSON, facilitando o rastreio local para o programador.

## 8. Dependências e compatibilidade

| Componente | Versão mínima | Observações                         |
| ---------- | ------------- | ----------------------------------- |
| Zustand    | v4.x          | Biblioteca leve de gestão de estado |
| Next.js    | v14.x         | App Router                          |
| TypeScript | v5.x          | Suporte a tipagem estrita           |

## 9. Critérios de aceitação técnicos

- A _store_ do Zustand deve ser instanciada sem erros e os seus valores padrão devem estar acessíveis através dos componentes clientes ("use client").
- O ficheiro memories.json deve respeitar 100% da interface Memory, validada de forma estática pelo compilador do TypeScript (se importado diretamente) ou pelo serviço de abstração.
- A alteração de propriedades no Zustand (ex: setActiveMemoryId) deve ser atómica e não deve provocar o _re-render_ de componentes que não consumam esse campo específico.
- Em caso de ausência ou corrupção do ficheiro memories.json, o serviço deve devolver uma lista vazia, evitando a quebra da página.

## 10. Riscos e mitigação

### Mismatch de Hidratação no Next.js (Server/Client)

- **Probabilidade:** Alta
- **Impacto:** Erros de hidratação visuais no ecrã e estado inconsistente no primeiro carregamento.
- **Mitigação:** Garantir que a leitura do Zustand não ocorre antes de o componente ser montado no cliente. Utilizar a diretiva "use client" rigorosamente nos componentes que subscrevem o Zustand e prever um estado de carregamento inicial, se necessário.

### Crescimento descontrolado do ficheiro estático

- **Probabilidade:** Baixa (devido ao escopo e curadoria do projeto)
- **Impacto:** Aumento excessivo do tamanho do pacote (_bundle size_) enviado para o cliente.
- **Mitigação:** Manter no ficheiro JSON estritamente os campos necessários. As imagens reais serão armazenadas na Cloudinary (CDN), não penalizando o carregamento do ficheiro de dados.
- **Plano de contingência:** Avaliar a migração para chamadas a um CMS _headless_ no futuro, caso o volume de viagens/memórias cresça muito.
