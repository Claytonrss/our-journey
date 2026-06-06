# Plano: Integração Cloudinary — Build-Time Sync

## Visão Geral

Metadados das memórias (título, data, coordenadas, descrição) continuam sendo editados manualmente em um arquivo-fonte (`memories-source.json`). As **imagens** são buscadas automaticamente no Cloudinary durante o build e mescladas no `memories.json`. O JSON final continua versionado porque contém os metadados manuais.

---

## 1. Convenção de Pastas no Cloudinary

```
📁 memories/
  📁 01-sao-paulo/
    📄 01-praia.jpg
    📄 02-jantar.jpg
    📄 03-passeio.webp
  📁 02-rio-de-janeiro/
    📄 01-cristo.jpg
    📄 02-ipanema.jpg
  📁 03-gramado/
    ...
```

### Regras de nomeação sugeridas:

- Prefixo numérico para controlar ordem: `01-`, `02-`, `03-`
- Use hífens, não espaços: `jantar-romantico.jpg` (não `jantar romantico.jpg`)
- Extensões comuns: `.jpg`, `.png`, `.webp`
- O nome do arquivo (sem extensão) vira o `alt` automático: `"jantar romantico"`

---

## 2. Arquivos de Dados

### `src/data/memories-source.json` (NOVO — editado manualmente)

```json
[
  {
    "id": "1",
    "title": "São Paulo",
    "date": "2024-05-15",
    "coordinates": { "lat": -23.5505, "lng": -46.6333 },
    "isSpecialPin": false,
    "description": "São Paulo",
    "cloudinaryFolder": "memories/01-sao-paulo"
  }
]
```

- **Controlado manualmente:** título, data, coordenadas, descrição, pasta no Cloudinary
- **NÃO controlado manualmente:** lista de imagens (vem do Cloudinary automaticamente)

### `src/data/memories.json` (GERADO — não editar manualmente)

```json
[
  {
    "id": "1",
    "title": "São Paulo",
    "date": "2024-05-15",
    "coordinates": { "lat": -23.5505, "lng": -46.6333 },
    "isSpecialPin": false,
    "description": "São Paulo",
    "images": [
      {
        "publicId": "memories/01-sao-paulo/01-praia",
        "alt": "Foto de São Paulo 1: praia",
        "width": 3024,
        "height": 4032
      }
    ]
  }
]
```

- **Versionado no git** porque contém metadados manuais
- **Regenerado** toda vez que o build é executado

---

## 3. Dependências a Instalar

```bash
pnpm add next-cloudinary
pnpm add -D cloudinary tsx
```

| Pacote            | Função                                                 |
| ----------------- | ------------------------------------------------------ |
| `next-cloudinary` | Componente `CldImage` para renderização otimizada      |
| `cloudinary`      | SDK Node.js para o script de build acessar a Admin API |
| `tsx`             | Executar scripts TypeScript diretamente                |

---

## 4. Variáveis de Ambiente (novas)

Adicionar ao `.env.example` e configurar no `.env.local`:

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret
```

> O `API_SECRET` fica **somente server-side** — usado apenas pelo script de build.

---

## 5. Script de Build (`scripts/generate-memories.ts`)

### Fluxo do script:

1. Lê `src/data/memories-source.json`
2. Para cada memória, chama a Admin API do Cloudinary:
   ```
   GET /resources?prefix=memories/01-sao-paulo&max_results=100&type=upload
   ```
3. Extrai de cada asset: `public_id`, `width`, `height`
4. Ordena alfabeticamente pelo `public_id` (respeita `01-`, `02-`, etc.)
5. Gera `alt` automático: `"Foto de {title} {index+1}: {nome-do-arquivo}"`
6. Valida com o Zod `MemorySchema`
7. Salva `src/data/memories.json`

### Rate limit:

500 reqs/hora no plano Free. Com 30 memórias = 30 chamadas. ✅

---

## 6. Atualização do Schema (`src/types/index.ts`)

```ts
export const ImageSchema = z.object({
  publicId: z.string(), // ← antes era url
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
```

O `MemorySchema` permanece o mesmo (já utiliza `ImageSchema`).

---

## 7. Atualização dos Componentes

### `Overlay.tsx`

- Trocar `Image` do `next/image` por `CldImage` do `next-cloudinary`
- Hero image: `<CldImage src={heroImage.publicId} ... />`

### `MasonryGallery.tsx`

- Gallery thumbnail: `<CldImage src={image.publicId} ... />`
- Lightbox: `<CldImage src={image.publicId} ... />` (mantém width/height reais)

### Props do `CldImage` ganhas automaticamente:

- `f_auto` (formato automático: WebP/AVIF se suportado)
- `q_auto` (qualidade automática)
- `srcset` responsivo

---

## 8. Configuração de Build (`package.json`)

```json
"scripts": {
  "generate": "tsx scripts/generate-memories.ts",
  "prebuild": "pnpm run generate",
  "build": "next build"
}
```

> Ao rodar `pnpm run build`, o script executa primeiro, sincroniza as imagens, e depois o Next.js compila.

---

## 9. Resumo de Alterações no Projeto

| Arquivo                                              | Ação                                             |
| ---------------------------------------------------- | ------------------------------------------------ |
| `package.json`                                       | Adicionar `cloudinary`, `next-cloudinary`, `tsx` |
| `.env.example`                                       | Adicionar vars do Cloudinary                     |
| `src/types/index.ts`                                 | Trocar `url` → `publicId` no `ImageSchema`       |
| `src/data/memories-source.json`                      | Criar (editado manualmente)                      |
| `src/data/memories.json`                             | Passa a ser gerado automaticamente               |
| `scripts/generate-memories.ts`                       | Criar script de build-time                       |
| `src/components/features/overlay/Overlay.tsx`        | Trocar `Image` → `CldImage`                      |
| `src/components/features/overlay/MasonryGallery.tsx` | Trocar `Image` → `CldImage`                      |

---

## 10. Workflow do Dia a Dia

1. Editar `src/data/memories-source.json` para adicionar/editar memórias e pastas
2. Subir fotos nas pastas corretas do Cloudinary
3. Rodar `pnpm run build` (ou `pnpm run generate && pnpm run build`)
4. Verificar o `memories.json` gerado
5. Deploy
