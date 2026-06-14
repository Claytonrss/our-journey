# Arquitetura Geral

Este diagrama representa o estado atual do Our Journey: um monolito Next.js App Router com UI client-heavy para mapa, timeline, overlay e audio, mais route handlers/server actions protegendo segredos de Spotify, Mapbox e PIN.

```mermaid
flowchart TB
  Browser["Browser"]
  NextApp["Next.js 16 App Router"]
  ServerPage["Server page: src/app/page.tsx"]
  ClientFeatures["Client features: LockScreen, MapPage, TimelinePage, Overlay, Player"]
  Zustand["Zustand store: useAppStore"]
  ServerActions["Server action: validatePin"]
  RouteMapbox["GET /api/mapbox-token"]
  RouteSpotify["GET /api/spotify-token"]
  NextAuth["NextAuth v5 Spotify provider"]
  MemoryService["memoryService + Zod validation"]
  MemoriesJson["src/data/memories.json"]
  Mapbox["Mapbox GL / styles / tiles"]
  Spotify["Spotify OAuth, Web API and Web Playback SDK"]
  Cloudinary["Cloudinary CDN via next-cloudinary"]
  Env["Server env validation: src/lib/env.ts"]

  Browser --> NextApp
  NextApp --> ServerPage
  ServerPage --> NextAuth
  NextApp --> ClientFeatures
  ClientFeatures <--> Zustand
  ClientFeatures --> ServerActions
  ServerActions --> Env
  ClientFeatures --> RouteMapbox
  ClientFeatures --> RouteSpotify
  RouteMapbox --> Env
  RouteMapbox --> Mapbox
  RouteSpotify --> NextAuth
  NextAuth --> Spotify
  ClientFeatures --> MemoryService
  MemoryService --> MemoriesJson
  MemoryService --> ClientFeatures
  ClientFeatures --> Mapbox
  ClientFeatures --> Spotify
  ClientFeatures --> Cloudinary
```

Pontos importantes:

- Nao ha Supabase no codigo atual. O modelo persistido e `src/data/memories.json`, gerado a partir de `src/data/memories-source.json` e Cloudinary.
- Mapbox e Spotify sao integrados por um padrao BFF: segredos ficam em env server-side e sao acessados por route handlers ou NextAuth.
- O mapa principal fica no client e usa `reuseMaps`; overlays e controles sao renderizados sobre a superficie WebGL.
