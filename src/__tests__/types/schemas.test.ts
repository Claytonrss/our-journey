import { describe, it, expect } from 'vitest';
import { ImageSchema, MemorySchema } from '@/types';

describe('ImageSchema', () => {
  const validImage = {
    publicId: 'memories/test/image_01_abc',
    alt: 'Foto de Test 1: memories/test/image_01_abc',
    width: 1920,
    height: 1080,
  };

  it('validates a correct image object', () => {
    expect(ImageSchema.parse(validImage)).toEqual(validImage);
  });

  it('rejects image with publicId as number', () => {
    expect(() => ImageSchema.parse({ ...validImage, publicId: 123 })).toThrow();
  });

  it('rejects image with zero width', () => {
    expect(() => ImageSchema.parse({ ...validImage, width: 0 })).toThrow();
  });

  it('rejects image with negative height', () => {
    expect(() => ImageSchema.parse({ ...validImage, height: -10 })).toThrow();
  });

  it('rejects image with non-integer width', () => {
    expect(() => ImageSchema.parse({ ...validImage, width: 1.5 })).toThrow();
  });

  it('rejects image missing alt field', () => {
    const { alt, ...noAlt } = validImage;
    expect(() => ImageSchema.parse(noAlt)).toThrow();
  });
});

describe('MemorySchema', () => {
  const validMemory = {
    id: 'sp-sao-paulo',
    title: 'São Paulo, SP',
    date: '2018-03-02',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    isSpecialPin: false,
    description: 'Nosso canto.',
    images: [
      {
        publicId: 'test/img_01',
        alt: 'Foto 1: test/img_01',
        width: 100,
        height: 100,
      },
    ],
  };

  it('validates a correct memory object', () => {
    expect(MemorySchema.parse(validMemory)).toEqual(validMemory);
  });

  it('rejects memory with invalid date format', () => {
    expect(() =>
      MemorySchema.parse({ ...validMemory, date: '03-02-2018' }),
    ).toThrow();
    expect(() =>
      MemorySchema.parse({ ...validMemory, date: '2018/03/02' }),
    ).toThrow();
    expect(() =>
      MemorySchema.parse({ ...validMemory, date: 'not-a-date' }),
    ).toThrow();
  });

  it('accepts memory with empty images array', () => {
    const result = MemorySchema.parse({ ...validMemory, images: [] });
    expect(result.images).toEqual([]);
  });

  it('rejects memory with missing id', () => {
    const { id, ...noId } = validMemory;
    expect(() => MemorySchema.parse(noId)).toThrow();
  });

  it('rejects memory with missing coordinates', () => {
    const { coordinates, ...noCoords } = validMemory;
    expect(() => MemorySchema.parse(noCoords)).toThrow();
  });

  it('rejects memory with isSpecialPin as non-boolean', () => {
    expect(() =>
      MemorySchema.parse({ ...validMemory, isSpecialPin: 'yes' }),
    ).toThrow();
  });

  it('accepts memory with isSpecialPin true', () => {
    const result = MemorySchema.parse({
      ...validMemory,
      isSpecialPin: true,
    });
    expect(result.isSpecialPin).toBe(true);
  });

  it('rejects memory with missing lat in coordinates', () => {
    expect(() =>
      MemorySchema.parse({
        ...validMemory,
        coordinates: { lng: -46.6333 },
      }),
    ).toThrow();
  });

  it('rejects memory with missing lng in coordinates', () => {
    expect(() =>
      MemorySchema.parse({
        ...validMemory,
        coordinates: { lat: -23.5505 },
      }),
    ).toThrow();
  });

  it('rejects memory with description as non-string', () => {
    expect(() =>
      MemorySchema.parse({ ...validMemory, description: 123 }),
    ).toThrow();
  });
});
