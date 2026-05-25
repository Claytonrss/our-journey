# FDD: Integração do Spotify e Resiliência de Áudio (Épico 5)

**Versão:** 1.0

**Data:** 25/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

A componente de imersão e nostalgia da aplicação baseia-se em associar cada memória espacial a uma música marcante. A integração com o Spotify Web Playback SDK permite controlar a reprodução de áudio diretamente no browser. Contudo, devido a restrições técnicas do SDK (exigência de conta Premium) e potenciais falhas de rede ou expiração de tokens, a arquitetura exige uma estratégia rigorosa de resiliência. O sistema deve alternar de forma transparente para a API nativa de áudio do HTML5 (MP3 local) caso o ambiente do Spotify não esteja disponível.

## 2. Objetivos técnicos

- Injetar e inicializar o Spotify Web Playback SDK dinamicamente no lado do cliente.
- Criar o hook customizado useAudioPlayer para unificar o controlo de reprodução (Play, Pause, Troca de Faixa) independente do provedor ativo.
- Implementar o mecanismo de transição automática (_fallback_) para áudio nativo HTML5 (ficheiro MP3 local) se a inicialização do Spotify falhar ou se o utilizador optar pelo modo offline.
- Desenvolver uma interface visual de leitor (Player UI) minimalista e flutuante sobreposta ao mapa.

## 3. Escopo e exclusões

### Dentro do escopo:

- Injeção do script oficial do Spotify via next/script ou carregador dinâmico.
- Implementação da lógica de ligação entre o ciclo de vida do SDK do Spotify e a _store_ do Zustand.
- Abstração completa do leitor de áudio com suporte a comandos unificados de reprodução.
- Criação do componente visual do Player (botão play/pause, exibição de título e artista).
- Mapeamento de caminhos de áudio locais (/public/audio/\*.mp3) para servir de contingência.

### Fora do escopo:

- Controlo avançado de áudio, como equalizadores ou ajuste fino de volume.
- Barra de progresso clicável com navegação temporal (_seeking_).
- Exibição de letras de músicas ou download de faixas.

## 4. Fluxos e cenários de uso

### Cenário 1: Fluxo Nominal (Spotify Ativo)

1. A aplicação deteta que a sessão do Spotify está ativa e o modo useLocalAudio é falso.
2. O SDK do Spotify é inicializado usando o token do NextAuth.
3. Ao selecionar uma memória, o hook invoca player.play({ uris: [memory.spotifyUri] }).
4. A interface do leitor é atualizada com o nome da faixa e o estado de reprodução obtidos diretamente dos eventos do SDK.

### Cenário 2: Ativação do Modo de Resiliência (Fallback Automático)

1. O SDK do Spotify falha ao inicializar (ex: conta não é Premium ou ocorreu um erro de autenticação).
2. O sistema captura o erro e altera o estado global useLocalAudio para true de forma silenciosa.
3. O hook useAudioPlayer instancia internamente o objeto new Audio() apontando para a faixa local de fallback configurada no memories.json.
4. A experiência de áudio continua a funcionar normalmente através do player nativo do browser, sem interrupção visível para o utilizador.

## 5. Contratos e interfaces públicas

### Atualização do Esquema de Dados (Memory):

```typescript
interface Memory {
  id: string;
  title: string;
  // ... campos anteriores
  audioConfig: {
    spotifyUri: string; // ex: 'spotify:track:4PTG3Z6ehGkBF3zI7YgR7u'
    localFallbackPath: string; // ex: '/audio/viagem-santos.mp3'
  };
}
```

### Interface do Hook useAudioPlayer:

```typescript
interface AudioPlayerHook {
  isPlaying: boolean;
  currentTrack: {
    title: string;
    artist: string;
  } | null;
  togglePlay: () => Promise<void>;
  playTrack: (spotifyUri: string, localPath: string) => Promise<void>;
}
```

## 6. Tratamento de erros e resiliência

- **Erro de Token Expirado (401):** Se as chamadas à API do Spotify retornarem erro de autenticação durante o runtime, o hook deve intercetar a falha e acionar imediatamente o player local de contingência.
- **Falha de Rede com Áudio Local:** Caso o ficheiro MP3 local falhe ao carregar (erro de rede), o player desativa o botão de reprodução e exibe discretamente "Áudio indisponível", mantendo as restantes funcionalidades do mapa intactas.

## 7. Observabilidade

- **Logs de Runtime:** Emissões de console.info detalhando a transição de provedor de áudio (ex: "Spotify SDK failed. Swapping to HTML5 Audio Fallback") para facilitar a validação em ambiente de staging e desenvolvimento.

## 8. Dependências e compatibilidade

| Componente               | Versão mínima         | Observações                                               |
| ------------------------ | --------------------- | --------------------------------------------------------- |
| Spotify Web Playback SDK | v1.x (Script externo) | Carregado assincronamente via browser                     |
| HTML5 Audio API          | Nativo                | Suporte universal em browsers modernos (Mobile e Desktop) |

## 9. Critérios de aceitação técnicos

- A interface do Player deve atualizar os estados de Play/Pause em perfeita sincronia com o estado real do áudio emitido.
- A troca de memórias no mapa deve interromper imediatamente a música anterior e iniciar a reprodução da faixa correspondente ao novo ponto selecionado.
- Contas do Spotify sem suporte a streaming (contas Free) não devem travar a aplicação; o comportamento deve desviar de forma transparente para o MP3 local.

## 10. Riscos e mitigação

### Bloqueio de Autoplay pelos Browsers

- **Probabilidade:** Alta.
- **Impacto:** A música não toca automaticamente quando a aplicação carrega ou quando o primeiro pin é selecionado sem uma interação direta.
- **Mitigação:** Garantir que a primeira reprodução de som seja obrigatoriamente vinculada a um gesto explícito do utilizador (ex: o clique no botão de confirmar o PIN na Lock Screen do Épico 2 servirá como o gatilho de interação inicial exigido pelos navegadores).
