import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import { INTRO } from "../data";

interface IntroProps {
  onEnter: () => void;
}

const DOOR_OPEN_MS = 750;
const softSpring = { type: "spring", stiffness: 60, damping: 18 } as const;

export default function Intro({ onEnter }: IntroProps) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleEnter = () => {
    if (opening) return;
    setOpening(true);
    // Erst öffnet sich die Tür, dann "fliegt" die Kamera hindurch (exit-Animation)
    timer.current = window.setTimeout(onEnter, DOOR_OPEN_MS);
  };

  return (
    <motion.section
      className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-hidden px-4 pb-[env(safe-area-inset-bottom)]"
      style={{
        transformOrigin: "50% 42%",
        background: "radial-gradient(ellipse 80% 60% at 50% 45%, #2a2130 0%, #141018 55%, #08070b 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        scale: 3.4,
        opacity: 0,
        filter: "blur(8px)",
        transition: { duration: 1.2, ease: [0.65, 0, 0.35, 1] },
      }}
      transition={{ duration: 1 }}
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

      {/* Tür samt Rahmen */}
      <motion.div
        className="relative"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...softSpring, delay: 0.2 }}
      >
        {/* Lichtschein auf dem Boden */}
        <motion.div
          className="absolute -bottom-10 left-1/2 h-16 w-[140%] -translate-x-1/2 rounded-[50%] bg-amber-300/25 blur-2xl"
          animate={{ opacity: opening ? 1 : [0.5, 0.8, 0.5] }}
          transition={opening ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="relative aspect-[3/5.4] w-[min(64vw,280px)] rounded-t-md bg-[#2b1a10] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:w-[300px]"
          style={{ perspective: 1200 }}
        >
          {/* Raum dahinter – sichtbar, wenn die Tür aufgeht */}
          <div className="absolute inset-2.5 overflow-hidden rounded-t-sm bg-gradient-to-b from-amber-100 via-amber-200 to-orange-300">
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: opening ? 0.7 : 0 }}
              transition={{ duration: 0.8 }}
            />
          </div>

          {/* Türblatt */}
          <motion.div
            className="relative h-full w-full rounded-t-sm"
            style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
            animate={{ rotateY: opening ? -105 : 0 }}
            transition={{ type: "spring", stiffness: 45, damping: 14 }}
          >
            <div className="absolute inset-0 rounded-t-sm bg-gradient-to-br from-[#7a4a2a] via-[#5e3820] to-[#3f2414] shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
              <div className="bg-noise absolute inset-0 opacity-20 mix-blend-multiply" />

              {/* Glasfenster oben */}
              <div className="absolute inset-x-[18%] top-[6%] h-[20%] rounded-sm border-4 border-[#3a2112] bg-gradient-to-b from-amber-200/70 to-amber-400/40 shadow-[inset_0_0_14px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#3a2112]" />
              </div>

              {/* Kassetten */}
              <div className="absolute inset-x-[14%] bottom-[6%] h-[30%] rounded-sm border border-black/30 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.45),inset_-1px_-1px_3px_rgba(255,220,180,0.12)]" />

              {/* Türschild */}
              <motion.div
                className="absolute inset-x-[10%] top-[33%] rounded-md border border-amber-900/40 bg-gradient-to-b from-[#f6ead0] to-[#e3cfa4] px-3 py-3 text-center text-[#3b2614] shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
                initial={{ rotate: -6, y: -10, opacity: 0 }}
                animate={{ rotate: -1.5, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 9, delay: 0.7 }}
              >
                <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-900/50" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-900/50" />
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">{INTRO.roomNumber}</p>
                <p className="mt-1 font-serif text-lg leading-tight sm:text-xl">{INTRO.signTitle}</p>
                <p className="font-hand text-2xl leading-none text-[#7a2e1a] sm:text-[1.7rem]">{INTRO.signName}</p>
              </motion.div>

              {/* Türklinke */}
              <div className="absolute right-[8%] top-[56%] h-3 w-9 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-[0_3px_6px_rgba(0,0,0,0.6)]" />
              <div className="absolute right-[7%] top-[54.5%] h-6 w-4 rounded-sm bg-gradient-to-b from-amber-300 to-amber-800 opacity-80" />
            </div>
          </motion.div>

          {/* Licht, das unter der Tür durchscheint */}
          <motion.div
            className="absolute inset-x-2.5 bottom-0 h-1 bg-amber-200"
            animate={{ opacity: [0.55, 1, 0.55], boxShadow: ["0 0 10px #fcd34d", "0 0 22px #fcd34d", "0 0 10px #fcd34d"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <motion.p
        className="mt-14 max-w-xs text-center text-sm text-stone-300/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: opening ? 0 : 1, y: 0 }}
        transition={{ duration: 0.8, delay: opening ? 0 : 1.1 }}
      >
        {INTRO.hint}
      </motion.p>

      {/* Pulsierender Eintreten-Button */}
      <motion.div
        className="relative mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: opening ? 0 : 1, scale: 1 }}
        transition={{ ...softSpring, delay: opening ? 0 : 1.4 }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-amber-300"
          animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-amber-300"
          animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
        />
        <motion.button
          type="button"
          onClick={handleEnter}
          disabled={opening}
          className="relative flex items-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-8 py-3.5 font-semibold text-[#2b1a10] shadow-[0_10px_30px_-5px_rgba(251,191,36,0.55)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/60"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <DoorOpen className="h-5 w-5" strokeWidth={2.2} />
          {INTRO.enterButton}
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
