import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CLASSROOM, type ModalKey } from "../data";
import DustParticles from "./DustParticles";
import {
  BoardIllustration,
  ClipboardIllustration,
  GiftIllustration,
  MirrorIllustration,
  PolaroidsIllustration,
  TvIllustration,
} from "./Illustrations";

interface ClassroomProps {
  onOpen: (key: ModalKey) => void;
}

const OBJECTS: { key: ModalKey; art: ReactNode; className?: string }[] = [
  { key: "report", art: <ClipboardIllustration /> },
  { key: "gallery", art: <PolaroidsIllustration /> },
  { key: "projector", art: <TvIllustration /> },
  { key: "mirror", art: <MirrorIllustration /> },
  { key: "gift", art: <GiftIllustration /> },
  { key: "board", art: <BoardIllustration /> },
];

export default function Classroom({ onOpen }: ClassroomProps) {
  return (
    <motion.section
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #33302f 0%, #262325 45%, #17151a 100%)" }}
      initial={{ opacity: 0, scale: 1.12 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 40, damping: 18, delay: 0.35 }}
    >
      {/* Atmosphäre: Textur, Fensterlicht, Lichtstrahlen, Staub */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="bg-noise absolute inset-0 opacity-[0.09] mix-blend-overlay" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% -8%, rgba(255,224,170,0.38), rgba(255,210,150,0.08) 55%, transparent 75%)",
          }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        {[-18, 0, 16].map((skew, i) => (
          <motion.div
            key={skew}
            className="absolute -top-10 h-[75%] w-[18%] origin-top bg-gradient-to-b from-amber-100/15 to-transparent blur-xl"
            style={{ left: `${24 + i * 20}%`, skewX: skew }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
        <DustParticles />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center gap-10 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:gap-14">
        {/* Tafel mit Gruß */}
        <motion.header
          className="w-full max-w-xl rounded-lg border-[10px] border-[#5b3b22] bg-[#24392d] px-5 py-6 text-center shadow-[0_25px_50px_-15px_rgba(0,0,0,0.85),inset_0_0_40px_rgba(0,0,0,0.45)] sm:px-10 sm:py-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.8 }}
        >
          <p className="font-hand text-2xl text-white/85 sm:text-3xl">{CLASSROOM.greeting}</p>
          <p className="font-hand text-5xl font-bold leading-tight text-amber-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] sm:text-6xl">
            {CLASSROOM.name}
          </p>
          <p className="mt-3 text-xs text-white/50 sm:text-sm">{CLASSROOM.subline}</p>
        </motion.header>

        {/* Die klickbaren Objekte */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-6">
          {OBJECTS.map((obj, i) => {
            const { label, hint } = CLASSROOM.objects[obj.key];
            return (
              <motion.button
                key={obj.key}
                type="button"
                onClick={() => onOpen(obj.key)}
                aria-label={`${label} öffnen`}
                className={`group flex flex-col items-center gap-3 rounded-2xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60 ${obj.className ?? ""}`}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 80, damping: 14, delay: 1.1 + i * 0.15 }}
                whileHover={{
                  scale: 1.07,
                  rotate: [0, -2.5, 2, -1, 0],
                  transition: {
                    scale: { type: "spring", stiffness: 260, damping: 16 },
                    rotate: { duration: 0.6, ease: "easeInOut" },
                  },
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Sanftes Schweben signalisiert auch auf Touch-Geräten Interaktivität */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                >
                  {obj.art}
                </motion.div>
                <span className="text-center">
                  <span className="block font-serif text-base text-stone-100 sm:text-lg">{label}</span>
                  <span className="block text-xs text-amber-200/70 transition-colors group-hover:text-amber-200">
                    {hint}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
