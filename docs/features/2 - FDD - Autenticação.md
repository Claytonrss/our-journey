# FDD: Autenticação e Resiliência (OAuth + PIN Lock Screen) (Épico 2)

**Versão:** 1.0

**Data:** 24/05/2026

**Status:** Aprovado

## 1. Contexto e motivação técnica

A aplicação exige uma barreira de acesso híbrida e resiliente. Por um lado, requer autenticação preferencial via OAuth 2.0 do Spotify para obter o _access token_ necessário para o Web Playback SDK. Por outro lado, para manter a componente emocional, necessita de um bloqueio no ecrã (Lock Screen) baseado num PIN estático de 4 dígitos. Para garantir que a surpresa não seja arruinada por instabilidades em serviços de terceiros, o fluxo de login do Spotify deve ser opcional, permitindo um _fallback_ para um leitor de áudio local (MP3).

## 2. Objetivos técnicos

- Configurar o NextAuth.js utilizando o SpotifyProvider com os _scopes_ necessários.
- Implementar a interface da Lock Screen com validação do PIN através de uma _Server Action_, mantendo o segredo seguro no servidor.
- Criar uma rota de _bypass_ ("Entrar sem Spotify") que defina o estado da aplicação para utilizar o ficheiro MP3 local como _fallback_.
- Integrar animações de _feedback_ visual com o Framer Motion (animação de "shake" em caso de erro e transição de _fade out_ no sucesso).
- Estabelecer a proteção de rotas no Next.js, garantindo que o mapa e os dados só são carregados após a validação bem-sucedida do PIN.

## 3. Escopo e exclusões

### Dentro do escopo

- Instalação e configuração do next-auth com o provedor do Spotify.
- Criação do componente visual da Lock Screen (input de 4 dígitos e botões de login/skip).
- Lógica de validação do PIN via _Server Action_ (use server).
- Integração das animações de erro/sucesso usando Framer Motion.
- Gestão de estado (no Zustand ou _cookies_) sinalizando se a sessão atual usa o Spotify ou o _fallback_ local (useLocalAudio).

### Fora do escopo

- Implementação do leitor de áudio em si (interface e lógica de reprodução, que pertence ao Épico 5).
- Renderização do mapa e marcadores do Mapbox (Épico 3).
- Autenticação com base de dados (o PIN será lido exclusivamente de uma variável de ambiente).

## 4. Fluxos e cenários de uso

### Cenário 1: Autenticação Spotify (Caminho Feliz)

- Acesso à página inicial (/). A aplicação apresenta a opção "Conectar com Spotify" ou "Entrar sem Spotify".
- O utilizador escolhe "Conectar com Spotify" e conclui o fluxo OAuth.
- Após o redirecionamento, a Lock Screen (PIN) é exibida.
- O utilizador digita o PIN correto. A _Server Action_ valida o PIN.
- O acesso é concedido e a _store_ regista que o Spotify está ativo.

### Cenário 2: Validação do PIN (Erro e Resiliência)

- Na Lock Screen, o utilizador insere 4 dígitos incorretos.
- A _Server Action_ retorna false.
- A interface aciona a animação de "shake" (vibração lateral) através do Framer Motion e limpa o input automaticamente.

### Cenário 3: Bypass e Fallback (Modo Offline/Sem Spotify)

- Na página inicial, o utilizador clica em "Entrar sem Spotify".
- A aplicação ignora o fluxo do NextAuth e exibe imediatamente a Lock Screen do PIN.
- Após a validação correta do PIN, a _store_ regista useLocalAudio: true.
- A aplicação liberta o acesso à rota protegida, indicando aos futuros componentes que devem usar o ficheiro MP3 local em vez do SDK do Spotify.

## 5. Contratos e interfaces públicas

### Server Action de Validação (src/app/actions/auth.ts)

```typescript
'use server';

export async function validatePin(pin: string): Promise<boolean> {
  const secretPin = process.env.SECRET_PIN;
  // Prevenção de timing attacks simples e validação de existência
  if (!secretPin || pin.length !== 4) return false;
  return pin === secretPin;
}
```

### Atualização da Store (Zustand)

```typescript
interface AppState {
  // ... estados anteriores (activeMemoryId, etc)
  isPinValidated: boolean;
  useLocalAudio: boolean;
  setPinValidated: (status: boolean) => void;
  setUseLocalAudio: (status: boolean) => void;
}
```

## 6. Tratamento de erros e resiliência

- **Falha na API do Spotify:** Se a autenticação OAuth falhar por _timeout_ ou erro de credenciais, a aplicação exibe um _toast_ suave ("Não foi possível conectar ao Spotify") e destaca a opção de entrar com o código (Fallback).
- **Proteção contra Força Bruta:** Embora seja um projeto pessoal, a interface pode aplicar um _debounce_ ou bloqueio temporário (ex: 2 segundos) no input caso ocorram 3 tentativas seguidas de PIN incorreto.

## 7. Observabilidade

- **Logs de Servidor:** Registar avisos (console.warn) na _Server Action_ em caso de ausência da variável de ambiente SECRET*PIN durante o \_startup*, para evitar _lockout_ não intencional em produção.

## 8. Dependências e compatibilidade

| Componente    | Versão mínima        | Observações                               |
| ------------- | -------------------- | ----------------------------------------- |
| NextAuth.js   | v4.x ou v5 (Auth.js) | Gestão do fluxo OAuth do Spotify          |
| Framer Motion | v11.x                | Animações fluidas de UI (_shake_, _fade_) |

## 9. Critérios de aceitação técnicos

- A aplicação deve impedir o acesso ao componente principal (Mapa/Galeria) se o estado isPinValidated for falso.
- O PIN não pode, em nenhuma circunstância, estar visível (hardcoded) nos ficheiros do lado do cliente ("use client").
- Se o PIN inserido for incorreto, o componente visual deve executar a animação de erro e apagar os dígitos.
- O utilizador deve conseguir aceder à aplicação com sucesso contornando completamente o login do Spotify, devendo o estado useLocalAudio refletir essa escolha como verdadeira.

## 10. Riscos e mitigação

### Latência da Server Action na validação do PIN

- **Probabilidade:** Baixa (em infraestrutura Edge/Serverless otimizada).
- **Impacto:** Sensação de lentidão na UI (_lag_ entre digitar o 4º dígito e a transição).
- **Mitigação:** Utilizar o hook useTransition do React para gerir o estado pendente, exibindo um _spinner_ ou _feedback_ visual imediato enquanto o servidor processa a validação.

### Expiração da Sessão do Spotify

- **Probabilidade:** Alta (tokens expiram rapidamente).
- **Impacto:** O leitor de música para de funcionar a meio da utilização se o _token_ não for renovado.
- **Mitigação:** (Será abordado no Épico 5) Se a renovação do _token_ falhar, o estado da aplicação deve alterar silenciosamente para useLocalAudio = true, transitando para a versão em MP3 para evitar que o ecrã feche subitamente.
