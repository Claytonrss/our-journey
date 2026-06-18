import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Image as ImageType } from '@/types';

vi.mock('next-cloudinary', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    CldImage: (props: Record<string, unknown>) => {
      const { alt, onLoad } = props;
      if (onLoad) (onLoad as () => void)();
      return React.createElement('img', { alt: alt as string });
    },
  };
});

vi.mock('framer-motion', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: React.forwardRef(function MotionDiv(
        props: Record<string, unknown>,
        ref: React.Ref<HTMLDivElement>,
      ) {
        const { children, ...rest } = props;
        return React.createElement('div', { ...rest, ref }, children);
      }),
    },
  };
});

import { Lightbox } from '@/components/features/overlay/Lightbox';

function createImage(overrides: Partial<ImageType> = {}): ImageType {
  return {
    publicId: 'test/photo',
    alt: 'Test photo',
    width: 800,
    height: 600,
    ...overrides,
  };
}

describe('Lightbox keyboard navigation', () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    onNavigate = vi.fn();
  });

  it('navigates to next image on ArrowRight', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowRight}');
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('navigates to previous image on ArrowLeft', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={1}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  it('closes on Escape', async () => {
    const images = [createImage()];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not navigate past the first image', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate past the last image', async () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    render(
      <Lightbox
        images={images}
        currentIndex={1}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    await userEvent.keyboard('{ArrowRight}');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('renders photo counter with aria-live for screen readers', () => {
    const images = [
      createImage({ publicId: 'test/a' }),
      createImage({ publicId: 'test/b' }),
    ];

    const { container } = render(
      <Lightbox
        images={images}
        currentIndex={0}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );

    const counter = container.querySelector('[aria-live="polite"]');
    expect(counter).toBeTruthy();
    expect(counter?.textContent).toContain('1 / 2');
  });
});
