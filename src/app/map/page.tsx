'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/hooks/useAppStore';
import { memoryService } from '@/services/memoryService';
import { Memory } from '@/types';

export default function MapPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const {
    activeMemoryId,
    setActiveMemoryId,
    viewMode,
    setViewMode,
    isPinValidated,
  } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isPinValidated) {
      router.push('/');
      return;
    }

    // Carregar memórias no mount
    memoryService.getMemories().then((data) => {
      setMemories(data);
      if (data.length > 0) {
        // Inicializar com a primeira memória por padrão
        setActiveMemoryId(data[0].id);
      }
    });
  }, [isPinValidated, router, setActiveMemoryId]);

  return (
    <main className="min-h-screen p-8 bg-(--background) text-(--foreground)">
      <h1 className="text-3xl font-serif text-[var(--color-brand-gold)] mb-4">
        Our Journey
      </h1>

      <section className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Estado Global (Zustand)</h2>
        <p>Memória Ativa (ID): {activeMemoryId || 'Nenhuma'}</p>
        <p>Modo de Visualização: {viewMode}</p>

        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setViewMode(viewMode === 'story' ? 'free' : 'story')}
          >
            Alternar Modo
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">
          Memórias Carregadas ({memories.length})
        </h2>
        <div className="flex gap-4 flex-wrap">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className={`p-4 border rounded cursor-pointer transition-colors ${activeMemoryId === memory.id ? 'border-[var(--color-brand-gold)] bg-gray-800' : 'border-gray-600'}`}
              onClick={() => setActiveMemoryId(memory.id)}
            >
              <h3 className="font-bold">{memory.title}</h3>
              <p className="text-sm text-gray-400">{memory.date}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
