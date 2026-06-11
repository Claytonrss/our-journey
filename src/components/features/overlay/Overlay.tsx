'use client';

import { CldImage } from 'next-cloudinary';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { MemoryContent } from './MemoryContent';
import { MasonryGallery } from './MasonryGallery';
import { CompassRose } from '@/components/ui/CompassRose';
import { AudioPlayer } from '@/components/features/player/AudioPlayer';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { Memory } from '@/types';

interface OverlayProps {
  memory: Memory | null;
  onClose: () => void;
  onNavigateToTimeline: (id: string) => void;
  isMobile: boolean;
}

export function Overlay({
  memory,
  onClose,
  onNavigateToTimeline,
  isMobile,
}: OverlayProps) {
  if (!memory) return null;

  if (isMobile) {
    return (
      <MobileOverlay
        memory={memory}
        onClose={onClose}
        onNavigateToTimeline={onNavigateToTimeline}
      />
    );
  }

  return (
    <DesktopOverlay
      memory={memory}
      onClose={onClose}
      onNavigateToTimeline={onNavigateToTimeline}
    />
  );
}

interface OverlayContentProps {
  memory: Memory;
  onClose: () => void;
  onNavigateToTimeline: (id: string) => void;
}

function MobileOverlay({
  memory,
  onClose,
  onNavigateToTimeline,
}: OverlayContentProps) {
  const dragControls = useDragControls();
  const { isPlaying, togglePlay } = useAudioPlayer();

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const heroImage = memory.images[0];
  const galleryImages = memory.images.slice(1);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-20"
        style={{ background: 'rgba(8,8,8,0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 shadow-2xl flex flex-col overflow-hidden"
        style={{
          height: '75vh',
          background: 'var(--bg-panel)',
          borderRadius: '28px 28px 0 0',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <div className="relative shrink-0" style={{ height: '220px' }}>
          {heroImage ? (
            <CldImage
              src={heroImage.publicId}
              alt={heroImage.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              crop="fill"
              gravity="auto"
              dpr="auto"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'var(--bg-void)' }}
            >
              <CompassRose
                size={160}
                opacity={0.15}
                className="pointer-events-none"
              />
            </div>
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, transparent 35%, transparent 55%, rgba(16,16,16,1) 100%)',
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center pt-4 pb-2 z-10"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div
              className="cursor-grab active:cursor-grabbing"
              style={{
                width: '36px',
                height: '4px',
                background: 'rgba(212,175,55,0.5)',
                borderRadius: '2px',
              }}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 transition-colors z-10 rounded-full"
            style={{
              color: 'var(--text-primary)',
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Fechar painel"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6 z-10">
            <div className="relative inline-block mb-1">
              <div
                className="absolute -inset-1 rounded-md pointer-events-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              />
              <p
                className="relative drop-shadow-md"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--gold)',
                  letterSpacing: '0.02em',
                }}
              >
                {new Date(memory.date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '28px',
                fontWeight: 400,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}
            >
              {memory.isSpecialPin && (
                <span style={{ color: 'var(--gold)', marginRight: '6px' }}>
                  ◆
                </span>
              )}
              {memory.title}
            </h2>
          </div>
        </div>

        <div
          className="relative flex-1 overflow-y-auto space-y-6 pt-5"
          style={{ padding: '0 24px 24px' }}
        >
          <MemoryContent memory={memory} hideTitle={true} />
          {galleryImages.length > 0 && (
            <MasonryGallery images={memory.images} startIndex={1} />
          )}
          <TimelineButton
            memoryId={memory.id}
            onNavigateToTimeline={onNavigateToTimeline}
          />
        </div>

        <AudioPlayer
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          variant="strip"
        />
      </motion.div>
    </>
  );
}

function DesktopOverlay({
  memory,
  onClose,
  onNavigateToTimeline,
}: OverlayContentProps) {
  const heroImage = memory.images[0];
  const galleryImages = memory.images.slice(1);
  const { isPlaying, togglePlay } = useAudioPlayer();

  return (
    <>
      <motion.div
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(8,8,8,0.4)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed top-0 right-0 z-40 h-full w-full max-w-md shadow-2xl"
        style={{ background: 'var(--bg-panel)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="relative shrink-0" style={{ height: '260px' }}>
            {heroImage ? (
              <CldImage
                src={heroImage.publicId}
                alt={heroImage.alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 400px"
                crop="fill"
                gravity="auto"
                dpr="auto"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'var(--bg-void)' }}
              >
                <CompassRose
                  size={180}
                  opacity={0.15}
                  className="pointer-events-none"
                />
              </div>
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 35%, transparent 55%, rgba(16,16,16,1) 100%)',
              }}
            />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 transition-colors z-10 rounded-full"
              style={{
                color: 'var(--text-primary)',
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="Fechar painel"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-6 left-8 right-8 z-10">
              <div className="relative inline-block mb-1.5">
                <div
                  className="absolute -inset-1 rounded-md pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                />
                <p
                  className="relative drop-shadow-md"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                    color: 'var(--gold)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {new Date(memory.date).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '32px',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                }}
              >
                {memory.isSpecialPin && (
                  <span style={{ color: 'var(--gold)', marginRight: '6px' }}>
                    ◆
                  </span>
                )}
                {memory.title}
              </h2>
            </div>
          </div>

          <div
            className="relative flex-1 overflow-y-auto space-y-8 pt-6"
            style={{ padding: '0 32px 32px' }}
          >
            <MemoryContent memory={memory} hideTitle={true} />
            {galleryImages.length > 0 && (
              <MasonryGallery images={memory.images} startIndex={1} />
            )}
            <TimelineButton
              memoryId={memory.id}
              onNavigateToTimeline={onNavigateToTimeline}
            />
          </div>
          <AudioPlayer
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            variant="strip"
          />
        </div>
      </motion.div>
    </>
  );
}

interface TimelineButtonProps {
  memoryId: string;
  onNavigateToTimeline: (id: string) => void;
}

function TimelineButton({
  memoryId,
  onNavigateToTimeline,
}: TimelineButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigateToTimeline(memoryId)}
      className="group flex items-center gap-1 self-start text-[13px] transition-all cursor-pointer"
      style={{
        color: 'var(--gold)',
        fontFamily: 'var(--font-ui)',
        letterSpacing: '0.02em',
        opacity: 0.7,
        background: 'none',
        border: 'none',
        padding: 0,
      }}
    >
      <span className="group-hover:opacity-100 transition-opacity">
        Ver na timeline
      </span>
      <span className="group-hover:translate-x-1 transition-transform">→</span>
    </button>
  );
}
