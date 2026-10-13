import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { FINALE } from "../data";

interface FinaleCardProps {
  onClose: () => void;
}

/** Abschlusskarte, sobald alle Gegenstände entdeckt wurden */
export default function FinaleCard({ onClose }: FinaleCardProps) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={FINALE.title}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#fbf3df] to-[#efdcb4] p-7 text-center text-[#3d2a17] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
        initial={{ scale: 0.7, rotate: -6, y: 40 }}
        animate={{ scale: 1, rotate: -1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-red-600 text-white shadow-lg"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="h-7 w-7" fill="currentColor" />
        </motion.div>
        <h2 className="font-serif text-3xl">{FINALE.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed">{FINALE.text}</p>
        <p className="mt-4 font-hand text-3xl text-[#1f3a6b]">{FINALE.signature}</p>
        <motion.button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-full bg-[#3d2a17] px-6 py-2.5 text-sm font-semibold text-[#fbf3df] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {FINALE.button}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
