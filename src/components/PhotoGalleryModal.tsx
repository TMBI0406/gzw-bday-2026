import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { asset } from "../asset";
import { GALLERY, PHOTOS, type Photo } from "../data";
import ModalShell from "./ModalShell";

interface PhotoGalleryModalProps {
  onClose: () => void;
}

const FALLBACK_ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4];
const zoomSpring = { type: "spring", stiffness: 170, damping: 24 } as const;

const rotationOf = (photo: Photo, index: number) =>
  photo.rotate ?? FALLBACK_ROTATIONS[index % FALLBACK_ROTATIONS.length];

interface Selection {
  /** Foto, aus dem heraus gezoomt wurde (Anker für die layoutId-Animation) */
  anchor: Photo;
  rotate: number;
  /** Aktuell angezeigtes Foto (ändert sich beim Wischen) */
  index: number;
  direction: 1 | -1;
}

export default function PhotoGalleryModal({ onClose }: PhotoGalleryModalProps) {
  const [selected, setSelected] = useState<Selection | null>(null);
  const closePhoto = () => setSelected(null);
  const step = (direction: 1 | -1) =>
    setSelected((s) => s && { ...s, direction, index: (s.index + direction + PHOTOS.length) % PHOTOS.length });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) step(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) step(-1);
  };

  const current = selected ? PHOTOS[selected.index] : null;

  return (
    <ModalShell
      label={GALLERY.title}
      onClose={onClose}
      onEscape={selected ? closePhoto : onClose}
      className="bg-[#2a1b10]"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center sm:p-8">
        {/* Holzrahmen + Kork */}
        <div className="w-full max-w-4xl border-[10px] border-[#5e3a1e] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-md sm:border-[14px]">
          <div className="bg-cork relative px-4 pb-12 pt-16 shadow-[inset_0_0_60px_rgba(0,0,0,0.45)] sm:px-10 sm:pt-10">
            <header className="mb-8 text-center">
              <h2 className="inline-block -rotate-1 bg-[#fdf6e3] px-5 py-2 font-hand text-3xl text-[#3d2a17] shadow-md sm:text-4xl">
                {GALLERY.title}
              </h2>
              <p className="mt-3 text-xs text-[#2b1a10]/80 sm:text-sm">{GALLERY.subline}</p>
            </header>

            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-10">
              {PHOTOS.map((photo, i) => {
                const rotate = rotationOf(photo, i);
                const isSelected = selected?.anchor.id === photo.id;
                return (
                  <motion.div
                    key={photo.id}
                    className="relative aspect-[4/5]"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.25 + i * 0.08 }}
                  >
                    {/* Platzhalter hält den Platz im Grid, solange das Foto vergrößert ist */}
                    {!isSelected && (
                      <motion.button
                        type="button"
                        layoutId={`photo-${photo.id}`}
                        onClick={() => setSelected({ anchor: photo, rotate, index: i, direction: 1 })}
                        aria-label={`Foto „${photo.caption}“ vergrößern`}
                        className="absolute inset-0 flex flex-col bg-[#fbf8f1] p-2 pb-0 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.7)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                        style={{ rotate }}
                        transition={zoomSpring}
                        whileHover={{ scale: 1.05, zIndex: 2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <PolaroidContent photo={photo} />
                      </motion.button>
                    )}
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -top-2 left-1/2 z-[3] h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-400 to-red-700 shadow-[0_3px_4px_rgba(0,0,0,0.5)]"
                      animate={{ opacity: isSelected ? 0 : 1 }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vergrößerte Ansicht – per Portal, damit sie nicht von transformierten Eltern beeinflusst wird */}
      {createPortal(
        <AnimatePresence>
          {selected && (
            <motion.div
              key="photo-backdrop"
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={closePhoto}
            />
          )}
          {selected && current && (
            <div key="photo-zoom" className="pointer-events-none fixed inset-0 z-[61] flex flex-col items-center justify-center gap-5 p-4">
              <motion.div
                layoutId={`photo-${selected.anchor.id}`}
                className="pointer-events-auto relative aspect-[4/5] overflow-hidden bg-[#fbf8f1] p-3 pb-0 shadow-[0_40px_80px_-10px_rgba(0,0,0,0.9)]"
                style={{ width: "min(90vw, 28rem, 58dvh)" }}
                initial={{ rotate: selected.rotate }}
                animate={{ rotate: 0 }}
                transition={zoomSpring}
              >
                <AnimatePresence initial={false} custom={selected.direction} mode="popLayout">
                  <motion.div
                    key={current.id}
                    custom={selected.direction}
                    className="flex h-full cursor-grab touch-pan-y flex-col active:cursor-grabbing"
                    variants={{
                      enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    drag={PHOTOS.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={onDragEnd}
                  >
                    <PolaroidContent photo={current} large />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {PHOTOS.length > 1 && (
                <motion.div
                  className="pointer-events-auto flex items-center gap-4 text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <NavButton label="Vorheriges Foto" onClick={() => step(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                  </NavButton>
                  <span className="min-w-12 text-center text-sm tabular-nums text-white/70">
                    {selected.index + 1} / {PHOTOS.length}
                  </span>
                  <NavButton label="Nächstes Foto" onClick={() => step(1)}>
                    <ChevronRight className="h-5 w-5" />
                  </NavButton>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </ModalShell>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.button>
  );
}

function PolaroidContent({ photo, large = false }: { photo: Photo; large?: boolean }) {
  return (
    <>
      <motion.img
        layout
        src={asset(photo.src)}
        alt={photo.caption}
        draggable={false}
        loading="lazy"
        className="min-h-0 w-full flex-1 bg-stone-300 object-cover"
      />
      <motion.span
        layout="position"
        className={`flex shrink-0 items-center justify-center font-hand text-[#3d2a17] ${
          large ? "h-16 text-3xl" : "h-9 text-lg sm:h-10 sm:text-xl"
        }`}
      >
        {photo.caption}
      </motion.span>
    </>
  );
}
