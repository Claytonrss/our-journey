import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {
  MapErrorBoundary,
  MapFallback,
} from '@/components/features/map/MapErrorBoundary';

describe('MapFallback', () => {
  it('renders default message when no message prop', () => {
    render(<MapFallback />);
    expect(
      screen.getByText('Mapa indisponível no momento.'),
    ).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<MapFallback message="Erro ao carregar o mapa." />);
    expect(screen.getByText('Erro ao carregar o mapa.')).toBeInTheDocument();
  });
});

describe('MapErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <MapErrorBoundary>
        <div>Map content</div>
      </MapErrorBoundary>,
    );
    expect(screen.getByText('Map content')).toBeInTheDocument();
  });

  it('renders fallback when child throws', () => {
    const ThrowComponent = (): JSX.Element => {
      throw new Error('Test error');
    };

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MapErrorBoundary>
        <ThrowComponent />
      </MapErrorBoundary>,
    );

    expect(screen.getByText('Erro ao carregar o mapa.')).toBeInTheDocument();
    spy.mockRestore();
  });
});
