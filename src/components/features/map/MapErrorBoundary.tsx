'use client';

import React from 'react';
import { CompassRose } from '@/components/ui/CompassRose';

interface MapErrorBoundaryProps {
  children: React.ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends React.Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <MapFallback message="Erro ao carregar o mapa." />;
    }

    return this.props.children;
  }
}

interface MapFallbackProps {
  message?: string;
}

export function MapFallback({ message }: MapFallbackProps) {
  return (
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center bg-void text-primary relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <CompassRose size={400} opacity={0.03} />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <CompassRose size={48} opacity={0.4} className="mb-6" />
        <p
          className="text-sm italic"
          style={{
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)',
          }}
        >
          {message || 'Mapa indisponível no momento.'}
        </p>
      </div>
    </div>
  );
}
