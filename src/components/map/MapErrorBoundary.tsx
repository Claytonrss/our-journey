'use client';

import React from 'react';
import { MapIcon } from 'lucide-react';

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
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <MapIcon size={64} className="text-gray-600 mb-4" />
      <p className="text-lg text-gray-400">
        {message || 'Mapa indisponível no momento.'}
      </p>
    </div>
  );
}
