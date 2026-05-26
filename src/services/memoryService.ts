import { Memory } from '@/types';

export const memoryService = {
  getMemories: async (): Promise<Memory[]> => {
    try {
      // Aqui simulamos uma chamada assíncrona ou carregamento de módulo.
      // Em Next.js (App Router), podemos importar o JSON estaticamente no cliente/servidor
      // ou utilizar 'fetch' caso estivesse na pasta 'public'.
      // Como optamos pela pasta src/data, faremos um dynamic import ou importação direta.
      const data = await import('@/data/memories.json');
      return data.default as Memory[];
    } catch (error) {
      console.error('Erro ao carregar o arquivo memories.json', error);
      return [];
    }
  },
};
