# Estrutura de Rotas

Este diagrama lista as rotas App Router e endpoints encontrados no codigo atual.

```mermaid
flowchart TB
  App["src/app"]
  Root["/"]
  Map["/map"]
  Timeline["/timeline"]
  Api["/api"]
  AuthApi["/api/auth/[...nextauth]"]
  MapboxApi["/api/mapbox-token"]
  SpotifyApi["/api/spotify-token"]
  ServerAction["src/app/actions/auth.ts"]

  App --> Root
  App --> Map
  App --> Timeline
  App --> Api
  Api --> AuthApi
  Api --> MapboxApi
  Api --> SpotifyApi
  App --> ServerAction

  Root --> RootBehavior["Server: auth() then LockScreen"]
  Map --> MapBehavior["Client: PIN gate, headphones intro, map, overlay, audio controls"]
  Timeline --> TimelineBehavior["Client: PIN gate, grouped memory timeline, audio controls"]
  AuthApi --> AuthBehavior["NextAuth handlers for Spotify OAuth"]
  MapboxApi --> MapboxBehavior["Returns MAPBOX_TOKEN as JSON"]
  SpotifyApi --> SpotifyBehavior["Requires session, returns Spotify accessToken"]
  ServerAction --> PinBehavior["validatePin(pin) compares with SECRET_PIN"]
```

Observacoes:

- `/` e dinamica no build por depender de `auth()`.
- `/map` e `/timeline` foram prerenderizadas como estaticas no build, mas executam guardas client-side em runtime.
- `/api/mapbox-token` nao exige PIN ou sessao; ele entrega o token Mapbox para qualquer chamada ao endpoint.
- `/api/spotify-token` exige sessao NextAuth valida.
