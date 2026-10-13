import { useId, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Download, RotateCcw } from "lucide-react";
import { MIRROR } from "../data";
import ModalShell from "./ModalShell";

export interface Selfie {
  /** Object-URL für <img> und die 3D-Textur */
  url: string;
  /** Für "Teilen/Sichern" (iOS braucht das File sofort im Klick-Handler) */
  file: File;
}

interface MirrorModalProps {
  selfie: Selfie | null;
  onSelfie: (selfie: Selfie) => void;
  onClose: () => void;
}

/** Max. Kantenlänge: iPhone-Fotos (12+ MP) sind als WebGL-Textur zu groß */
const MAX_SIZE = 1280;

/** Verkleinert das Kamerafoto (EXIF-Drehung wendet der Browser beim Zeichnen an) */
async function shrinkPhoto(file: File): Promise<File> {
  const src = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) throw new Error("toBlob fehlgeschlagen");
    return new File([blob], "selfie-herr-gazwan.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(src);
  }
}

const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function MirrorModal({ selfie, onSelfie, onClose }: MirrorModalProps) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // gleiches Foto nochmal auswählbar
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      const small = await shrinkPhoto(file);
      if (selfie) URL.revokeObjectURL(selfie.url);
      onSelfie({ url: URL.createObjectURL(small), file: small });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!selfie) return;
    const data = { files: [selfie.file] };
    if (navigator.canShare?.(data)) {
      // iOS: Teilen-Menü mit "Bild sichern"
      await navigator.share(data).catch(() => undefined);
      return;
    }
    const a = document.createElement("a");
    a.href = selfie.url;
    a.download = selfie.file.name;
    a.click();
  };

  return (
    <ModalShell label={MIRROR.title} onClose={onClose} className="bg-[#0d0f12]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(214,230,240,0.13), transparent 70%)" }}
      />

      {/* Verstecktes Kamera-Feld: capture="user" öffnet am Handy direkt die Frontkamera */}
      <input id={inputId} type="file" accept="image/*" capture="user" className="sr-only" onChange={handleFile} />

      <div className="relative flex min-h-full flex-col items-center justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20">
        <motion.header
          className="mb-5 max-w-md text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-3xl text-stone-100 sm:text-4xl">{MIRROR.title}</h2>
          <p className="mt-1 font-hand text-xl text-amber-100/80">{MIRROR.subline}</p>
        </motion.header>

        {/* Spiegel mit Goldrahmen; das ganze Glas ist tippbar */}
        <motion.label
          htmlFor={inputId}
          className="group relative block aspect-[3/4] w-[min(78vw,22rem,calc((100dvh-17rem)*0.75))] min-w-[12rem] cursor-pointer rounded-t-[50%_32%] rounded-b-2xl bg-gradient-to-br from-[#f0d9a6] via-[#c9a46a] to-[#7d5a2c] p-3 shadow-[0_40px_80px_-25px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,240,200,0.6)]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative h-full overflow-hidden rounded-t-[50%_30%] rounded-b-xl bg-gradient-to-br from-[#d5e1e7] via-[#93a8b2] to-[#56666f] shadow-[inset_0_0_30px_rgba(0,0,0,0.45)]">
            <AnimatePresence mode="wait">
              {selfie ? (
                <motion.img
                  key={selfie.url}
                  src={selfie.url}
                  alt="Dein Selfie im Spiegel"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, filter: "blur(18px) brightness(1.8)" }}
                  animate={{ opacity: 1, filter: "blur(0px) brightness(1)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              ) : (
                <motion.div
                  key="empty"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
                  exit={{ opacity: 0 }}
                >
                  <motion.span
                    className="grid h-16 w-16 place-items-center rounded-full bg-white/25 text-white shadow-lg backdrop-blur-sm"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Camera className="h-7 w-7" />
                  </motion.span>
                  <span className="font-hand text-2xl text-white drop-shadow">{MIRROR.emptyText}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glanzstreifen auf dem Glas */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -top-1/4 h-[150%] w-16 rotate-[30deg] bg-white/25 blur-md"
                initial={{ left: "-30%" }}
                animate={{ left: ["-30%", "130%"] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
              />
              <div className="absolute left-[12%] top-0 h-full w-3 -skew-x-12 bg-white/15 blur-sm" />
            </div>

            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-black/35 text-sm text-white backdrop-blur-sm">
                {MIRROR.processing}
              </div>
            )}
          </div>
        </motion.label>

        <AnimatePresence>
          {selfie && !busy && (
            <motion.p
              className="mt-4 font-hand text-2xl text-amber-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {MIRROR.caption}
            </motion.p>
          )}
        </AnimatePresence>

        {error && <p className="mt-3 text-sm text-red-300">{MIRROR.error}</p>}

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <motion.label
            htmlFor={inputId}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-[#2b1a10] shadow-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            {selfie ? <RotateCcw className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {selfie ? MIRROR.retakeButton : MIRROR.takeButton}
          </motion.label>
          {selfie && (
            <motion.button
              type="button"
              onClick={save}
              className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm text-stone-100 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              {MIRROR.shareButton}
            </motion.button>
          )}
        </div>

        {!isTouch && <p className="mt-3 text-xs text-stone-500">{MIRROR.desktopHint}</p>}
      </div>
    </ModalShell>
  );
}
