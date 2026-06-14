'use client';

import { useSyncExternalStore } from 'react';

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => null,
  );
}
