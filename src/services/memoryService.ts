import { Memory, MemorySchema } from '@/types';
import { z } from 'zod';

const isProd = process.env.NODE_ENV === 'production';

export const memoryService = {
  getMemories: async (): Promise<Memory[]> => {
    try {
      const data = await import('@/data/memories.json');
      const listSchema = z.array(MemorySchema);
      return listSchema.parse(data.default);
    } catch (error) {
      if (!isProd) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      console.error(
        'Erro ao carregar e validar o arquivo memories.json',
        error,
      );
      return [];
    }
  },
};
