'use client';

import { useMemo } from 'react';

export function useWebGLSupport(): boolean | null {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }, []);
}
