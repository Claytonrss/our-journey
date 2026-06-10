import dotenv from 'dotenv';
import fs from 'fs';

// Carregar .env.local explicitamente
dotenv.config({ path: '.env.local' });
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { MemorySchema } from '../src/types';
import { getCloudinaryEnv } from '../src/lib/env';

let cloudinaryEnv: ReturnType<typeof getCloudinaryEnv>;

try {
  cloudinaryEnv = getCloudinaryEnv();
} catch {
  console.log('⚠️  Cloudinary env not configured, skipping generation.');
  console.log('   memories.json will be used as-is from the repository.');
  process.exit(0);
}

// Configurar o SDK do Cloudinary
cloudinary.config({
  cloud_name: cloudinaryEnv.CLOUDINARY_CLOUD_NAME,
  api_key: cloudinaryEnv.CLOUDINARY_API_KEY,
  api_secret: cloudinaryEnv.CLOUDINARY_API_SECRET,
});

const SourceSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    isSpecialPin: z.boolean(),
    description: z.string(),
    cloudinaryFolder: z.string(),
  }),
);

async function fetchImagesFromFolder(folder: string) {
  try {
    // Dynamic Folder Mode: buscar todos e filtrar por asset_folder
    const result = await cloudinary.api.resources({
      max_results: 500,
    });

    const allResources = result.resources as Array<{
      public_id: string;
      width: number;
      height: number;
      format: string;
      asset_folder?: string;
    }>;

    // Filtrar apenas os recursos que estão na pasta correta
    const folderImages = allResources.filter(
      (resource) => resource.asset_folder === folder,
    );

    const images = folderImages.map((resource) => {
      // No Dynamic Folder Mode, public_id é apenas o nome do arquivo
      // A pasta (asset_folder) é separada e não faz parte da URL de delivery
      const fileName = resource.public_id;

      return {
        publicId: fileName,
        width: resource.width,
        height: resource.height,
        fileName,
      };
    });

    // Ordenar alfabeticamente pelo publicId
    images.sort((a, b) => a.publicId.localeCompare(b.publicId));

    return images;
  } catch (error) {
    console.error(`Erro ao buscar imagens da pasta ${folder}:`, error);
    return [];
  }
}

async function generateMemories() {
  const sourcePath = path.join(
    process.cwd(),
    'src',
    'data',
    'memories-source.json',
  );
  const outputPath = path.join(process.cwd(), 'src', 'data', 'memories.json');

  // Ler o arquivo source
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  const sourceMemories = SourceSchema.parse(sourceData);

  console.log(`🚀 Gerando ${sourceMemories.length} memória(s)...`);

  const memories = [];

  for (const source of sourceMemories) {
    console.log(`📁 Buscando imagens em: ${source.cloudinaryFolder}`);

    const images = await fetchImagesFromFolder(source.cloudinaryFolder);

    if (images.length === 0) {
      console.warn(
        `⚠️  Nenhuma imagem encontrada em ${source.cloudinaryFolder}`,
      );
    } else {
      console.log(
        `✅ ${images.length} imagem(ns) encontradas em ${source.cloudinaryFolder}`,
      );
    }

    const formattedImages = images.map((img, index) => {
      // Gerar alt automático: "Foto de {title} {index+1}: {nome-do-arquivo}"
      const altText = `Foto de ${source.title} ${index + 1}: ${img.fileName}`;

      return {
        publicId: img.publicId,
        alt: altText,
        width: img.width,
        height: img.height,
      };
    });

    memories.push({
      id: source.id,
      title: source.title,
      date: source.date,
      coordinates: source.coordinates,
      isSpecialPin: source.isSpecialPin,
      description: source.description,
      images: formattedImages,
    });
  }

  // Validar com Zod
  const listSchema = z.array(MemorySchema);
  const validated = listSchema.parse(memories);

  // Salvar o arquivo gerado
  fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));

  console.log(`\n✨ memories.json gerado com sucesso em: ${outputPath}`);
  console.log(`📊 Total de memórias: ${validated.length}`);
  console.log(
    `📷 Total de imagens: ${validated.reduce((acc, m) => acc + m.images.length, 0)}`,
  );
}

generateMemories().catch((error) => {
  console.error('❌ Erro ao gerar memories.json:', error);
  process.exit(1);
});
