import fs from 'fs';
import path from 'path';
import os from 'os';

const SOURCE_DIR = path.join(
  process.env.HOME || os.homedir(),
  'Downloads',
  'cidades',
);
const DEST_DIR = path.join(
  process.env.HOME || os.homedir(),
  'Downloads',
  'cidades_organizadas',
);
const JSON_FILE = path.join(
  process.cwd(),
  'src',
  'data',
  'memories-source.json',
);

// Coordenadas base (São Paulo, SP) para o cálculo de distância
const SP_COORDS = { lat: -23.5505, lng: -46.6333 };

interface RawCityData {
  lat: number;
  lng: number;
  title: string;
}

interface MemoryEntry {
  id: string;
  title: string;
  date: string;
  coordinates: { lat: number; lng: number };
  isSpecialPin: boolean;
  description: string;
  cloudinaryFolder: string;
  distanceToSP?: number;
}

// Lista completa baseada nas pastas
const cityData: Record<string, RawCityData> = {
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
  'faro-pt': { lat: 37.0194, lng: -7.9322, title: 'Faro, Portugal' },
  'flecheiras-ce': { lat: -3.2217, lng: -39.2635, title: 'Flecheiras, CE' },
  'gramado-rs': { lat: -29.3807, lng: -50.8736, title: 'Gramado, RS' },
  'guaruja-sp': { lat: -23.9931, lng: -46.2562, title: 'Guarujá, SP' },
  'guarulhos-sp': { lat: -23.4628, lng: -46.5333, title: 'Guarulhos, SP' },
  'joanopolis-sp': { lat: -22.93, lng: -46.2758, title: 'Joanópolis, SP' },
  'jundiai-sp': { lat: -23.1857, lng: -46.8978, title: 'Jundiaí, SP' },
  'lagos-pt': { lat: 37.1028, lng: -8.6728, title: 'Lagos, Portugal' },
  'lindoia-sp': { lat: -22.5239, lng: -46.6517, title: 'Lindóia, SP' },
  'lisboa-pt': { lat: 38.7223, lng: -9.1393, title: 'Lisboa, Portugal' },
  'logoinha-ce': { lat: -3.2981, lng: -39.0668, title: 'Lagoinha, CE' },
  'maceio-al': { lat: -9.6658, lng: -35.7353, title: 'Maceió, AL' },
  'madrid-es': { lat: 40.4168, lng: -3.7038, title: 'Madrid, Espanha' },
  'mairipora-sp': { lat: -23.3188, lng: -46.5866, title: 'Mairiporã, SP' },
  'paranapiacaba-sp': {
    lat: -23.7781,
    lng: -46.3039,
    title: 'Paranapiacaba, SP',
  },
  'paris-fr': { lat: 48.8566, lng: 2.3522, title: 'Paris, França' },
  'porto-pt': { lat: 41.1579, lng: -8.6291, title: 'Porto, Portugal' },
  'praia-grande-sp': {
    lat: -24.0058,
    lng: -46.4028,
    title: 'Praia Grande, SP',
  },
  'pratinha-ba': { lat: -12.3541, lng: -41.5361, title: 'Pratinha, BA' },
  'roma-it': { lat: 41.9028, lng: 12.4964, title: 'Roma, Itália' },
  'santo-andre-sp': { lat: -23.6661, lng: -46.5322, title: 'Santo André, SP' },
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
  'sevilha-es': { lat: 37.3891, lng: -5.9845, title: 'Sevilha, Espanha' },
  'sorocaba-sp': { lat: -23.5015, lng: -47.4581, title: 'Sorocaba, SP' },
  'ubajara-ce': { lat: -3.834, lng: -40.9255, title: 'Ubajara, CE' },
  'votorantim-sp': { lat: -23.5358, lng: -47.4435, title: 'Votorantim, SP' },
};

// Fórmula de Haversine para calcular a distância em KM
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Inverte o nome da pasta de "cidade-uf" para "uf-cidade"
function formatFolderName(originalFolder: string): string {
  const parts = originalFolder.split('-');
  if (parts.length < 2) return originalFolder;
  const uf = parts.pop();
  const city = parts.join('-');
  return `${uf}-${city}`;
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

  const outputData: MemoryEntry[] = [];
  const folders = fs
    .readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map((dirent) => dirent.name);

  for (const folderName of folders) {
    const sourceFolder = path.join(SOURCE_DIR, folderName);

    // Calcula o novo nome invertido (ex: sp-sao-paulo)
    const newFolderName = formatFolderName(folderName);
    const destFolder = path.join(DEST_DIR, newFolderName);

    if (!fs.existsSync(destFolder))
      fs.mkdirSync(destFolder, { recursive: true });

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

    files.sort((a, b) => a.localeCompare(b));

    let count = 0;
    for (const file of files) {
      count++;
      const sourceFile = path.join(sourceFolder, file);
      const ext =
        path.extname(file).toLowerCase() === '.jpeg'
          ? '.jpg'
          : path.extname(file).toLowerCase();
      const newName = `${newFolderName}_${count.toString().padStart(2, '0')}${ext}`;
      const destFile = path.join(destFolder, newName);

      fs.copyFileSync(sourceFile, destFile);
    }

    console.log(`✅ ${newFolderName}: ${count} arquivo(s) organizado(s).`);

    const geo = cityData[folderName] || { lat: 0, lng: 0, title: folderName };
    const distance = getDistanceFromLatLonInKm(
      SP_COORDS.lat,
      SP_COORDS.lng,
      geo.lat,
      geo.lng,
    );

    // Adiciona preenchimento automático para viagens recorrentes
    let description = '';
    if (['santos-sp', 'flecheiras-ce', 'serra-negra-sp'].includes(folderName)) {
      description = `Viagem com a Marina, Barry e Jonh.`;
    }

    outputData.push({
      id: newFolderName,
      title: geo.title,
      date: '2023-01-01', // Placeholder
      coordinates: { lat: geo.lat, lng: geo.lng },
      isSpecialPin: false,
      description: description,
      cloudinaryFolder: `memories/${newFolderName}`,
      distanceToSP: distance,
    });
  }

  // Ordena o array pelo cálculo de distância
  outputData.sort((a, b) => (a.distanceToSP || 0) - (b.distanceToSP || 0));

  // Remove a propriedade temporária de distância antes de salvar
  const finalJSON = outputData.map(({ distanceToSP, ...rest }) => rest);

  fs.writeFileSync(JSON_FILE, JSON.stringify(finalJSON, null, 2));
  console.log(
    `\n✨ memories-source.json gerado e ordenado com sucesso em: ${JSON_FILE}`,
  );
}

organizePhotos().catch((err) => {
  console.error(err);
  process.exit(1);
});
