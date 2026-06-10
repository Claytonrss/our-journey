import fs from 'fs';
import path from 'path';

const SOURCE_DIR = path.join(
  process.env.HOME || '/Users/clayton',
  'Downloads',
  'cidades',
);
const DEST_DIR = path.join(
  process.env.HOME || '/Users/clayton',
  'Downloads',
  'cidades_organizadas',
);
const DRAFT_FILE = path.join(
  process.cwd(),
  'src',
  'data',
  'memories-source-draft.json',
);

interface DraftMemory {
  id: string;
  title: string;
  date: string;
  coordinates: { lat: number; lng: number };
  isSpecialPin: boolean;
  description: string;
  cloudinaryFolder: string;
}

const cityData: Record<string, { lat: number; lng: number; title: string }> = {
  'abaira-ba': { lat: -13.2514, lng: -41.6636, title: 'Abaíra, BA' },
  'atibaia-sp': { lat: -23.1182, lng: -46.5501, title: 'Atibaia, SP' },
  'canela-rs': { lat: -29.3664, lng: -50.8117, title: 'Canela, RS' },
  'cotia-sp': { lat: -23.6033, lng: -46.9192, title: 'Cotia, SP' },
  'curitiba-pr': { lat: -25.4284, lng: -49.2733, title: 'Curitiba, PR' },
  'embu-das-artes-sp': {
    lat: -23.6496,
    lng: -46.8524,
    title: 'Embu das Artes, SP',
  },
  'flecheiras-ce': { lat: -3.2217, lng: -39.2635, title: 'Flecheiras, CE' },
  'gramado-rs': { lat: -29.3807, lng: -50.8736, title: 'Gramado, RS' },
  'guaruja-sp': { lat: -23.9931, lng: -46.2562, title: 'Guarujá, SP' },
  'guarulhos-sp': { lat: -23.4628, lng: -46.5333, title: 'Guarulhos, SP' },
  'lisboa-pt': { lat: 38.7223, lng: -9.1393, title: 'Lisboa, Portugal' },
  'logoinha-ce': { lat: -3.2981, lng: -39.0668, title: 'Lagoinha, CE' },
  'maceio-al': { lat: -9.6658, lng: -35.7353, title: 'Maceió, AL' },
  'mairipora-sp': { lat: -23.3188, lng: -46.5866, title: 'Mairiporã, SP' },
  paris: { lat: 48.8566, lng: 2.3522, title: 'Paris, França' },
  portugal: { lat: 39.3999, lng: -8.2245, title: 'Portugal' },
  'praia-grande-sp': {
    lat: -24.0058,
    lng: -46.4028,
    title: 'Praia Grande, SP',
  },
  'pratinha-ba': { lat: -12.3541, lng: -41.5361, title: 'Pratinha, BA' },
  'santo-andre': { lat: -23.6661, lng: -46.5322, title: 'Santo André, SP' },
  'santos-sp': { lat: -23.9618, lng: -46.3322, title: 'Santos, SP' },
  'sao-bernado-sp': {
    lat: -23.6976,
    lng: -46.5621,
    title: 'São Bernardo do Campo, SP',
  },
  'sao-caetano-sp': {
    lat: -23.6226,
    lng: -46.5517,
    title: 'São Caetano do Sul, SP',
  },
  'sao-paulo-sp': { lat: -23.5505, lng: -46.6333, title: 'São Paulo, SP' },
  'sao-pedro-sp': { lat: -22.5488, lng: -47.913, title: 'São Pedro, SP' },
  'serra-negra-sp': { lat: -22.6105, lng: -46.7027, title: 'Serra Negra, SP' },
  'sorocaba-sp': { lat: -23.5015, lng: -47.4581, title: 'Sorocaba, SP' },
  'ubajara-ce': { lat: -3.834, lng: -40.9255, title: 'Ubajara, CE' },
  'votorantim-sp': { lat: -23.5358, lng: -47.4435, title: 'Votorantim, SP' },
};

function formatTitle(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function organizePhotos() {
  console.log(`Verificando pasta de origem: ${SOURCE_DIR}`);
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('Pasta de origem não encontrada!');
    process.exit(1);
  }

  if (!fs.existsSync(DEST_DIR)) {
    console.log(`Criando pasta de destino: ${DEST_DIR}`);
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const draftData: DraftMemory[] = [];
  const folders = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map((dirent) => dirent.name);

  for (const folderName of folders) {
    const sourceFolder = path.join(SOURCE_DIR, folderName);
    const destFolder = path.join(DEST_DIR, folderName);

    // Criar pasta de destino para a cidade
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    // Listar fotos (jpg, jpeg, png, etc.)
    const files = fs.readdirSync(sourceFolder).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.heic',
        '.mov',
        '.mp4',
      ].includes(ext);
    });

    // Tentar ordenar (pode ser pelo nome, que geralmente preserva os timestamps das câmeras e WhatsApp)
    files.sort((a, b) => a.localeCompare(b));

    let count = 0;
    for (const file of files) {
      count++;
      const sourceFile = path.join(sourceFolder, file);
      const ext =
        path.extname(file).toLowerCase() === '.jpeg'
          ? '.jpg'
          : path.extname(file).toLowerCase();
      // Gerar formato: folderName_01.jpg
      const newName = `${folderName}_${count.toString().padStart(2, '0')}${ext}`;
      const destFile = path.join(destFolder, newName);

      fs.copyFileSync(sourceFile, destFile);
    }

    console.log(`✅ ${folderName}: ${count} arquivo(s) organizado(s).`);

    // Criar entrada no Draft
    const geo = cityData[folderName] || {
      lat: 0,
      lng: 0,
      title: formatTitle(folderName),
    };

    // Default date, we can try to guess from folder or leave empty/placeholder
    const draftMemory = {
      id: folderName,
      title: geo.title,
      date: '2023-01-01', // Placeholder
      coordinates: { lat: geo.lat, lng: geo.lng },
      isSpecialPin: false,
      description: '',
      cloudinaryFolder: `memories/${folderName}`,
    };

    draftData.push(draftMemory);
  }

  // Escrever o memories-source-draft.json
  fs.writeFileSync(DRAFT_FILE, JSON.stringify(draftData, null, 2));
  console.log(`\n✨ rascunho de source gerado em: ${DRAFT_FILE}`);
  console.log('Agora você pode:');
  console.log(
    '1. Subir as pastas de "cidades_organizadas" para o Cloudinary (em memories/).',
  );
  console.log(
    '2. Editar as descrições no memories-source-draft.json e salvá-lo como memories-source.json.',
  );
  console.log(
    '3. Rodar "pnpm run generate-memories" ou "npx tsx scripts/generate-memories.ts" para finalizar.',
  );
}

organizePhotos().catch((err) => {
  console.error(err);
  process.exit(1);
});
