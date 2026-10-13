import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { GIFT } from "../data";
import { playChime, playPop } from "../sound";
import ModalShell from "./ModalShell";

interface GiftModalProps {
  /** Schon einmal ausgepackt → direkt den Gutschein zeigen */
  alreadyOpened: boolean;
  onUnwrap: () => void;
  onClose: () => void;
}

export default function GiftModal({ alreadyOpened, onUnwrap, onClose }: GiftModalProps) {
  const [open, setOpen] = useState(alreadyOpened);

  const unwrap = () => {
    if (open) return;
    setOpen(true);
    playPop();
    window.setTimeout(playChime, 350);
    onUnwrap();
  };

  return (
    <ModalShell label={GIFT.title} onClose={onClose} className="bg-[#140d12]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(255,200,120,0.18), transparent 70%)" }}
      />

      <div className="relative flex min-h-full flex-col items-center justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20">
        <motion.h2
          className="mb-8 text-center font-serif text-3xl text-stone-100 sm:text-4xl"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {GIFT.title}
        </motion.h2>

        <div className="relative grid min-h-[22rem] w-full place-items-center">
          <AnimatePresence mode="popLayout">
            {!open ? <WrappedBox key="box" onUnwrap={unwrap} /> : <Voucher key="voucher" onClose={onClose} />}
          </AnimatePresence>
        </div>
      </div>
    </ModalShell>
  );
}

function WrappedBox({ onUnwrap }: { onUnwrap: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onUnwrap}
      className="group flex flex-col items-center gap-6 focus:outline-none"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.25, opacity: 0, transition: { duration: 0.35 } }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
    >
      <motion.div
        className="relative h-48 w-48 sm:h-56 sm:w-56"
        animate={{ rotate: [0, -4, 4, -3, 3, 0], y: [0, -10, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
      >
        {/* Deckel */}
        <div className="absolute inset-x-[-6%] top-[14%] z-10 h-[20%] rounded-md bg-gradient-to-b from-[#f06595] to-[#c2255c] shadow-lg">
          <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-gradient-to-b from-[#ffe066] to-[#fab005]" />
        </div>
        {/* Schleife */}
        <div className="absolute left-1/2 top-[2%] z-20 flex -translate-x-1/2 gap-1">
          <span className="block h-10 w-14 -rotate-[25deg] rounded-[50%] border-[7px] border-[#fcc419]" />
          <span className="block h-10 w-14 rotate-[25deg] rounded-[50%] border-[7px] border-[#fcc419]" />
        </div>
        {/* Karton */}
        <div className="absolute inset-x-0 bottom-0 top-[32%] rounded-b-lg bg-gradient-to-br from-[#e64980] to-[#a61e4d] shadow-[0_30px_50px_-15px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-gradient-to-b from-[#ffd43b] to-[#f59f00]" />
        </div>
      </motion.div>
      <span className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-[#2b1a10] shadow-lg transition-transform group-hover:scale-105">
        {GIFT.tapHint}
      </span>
    </motion.button>
  );
}

function Voucher({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="flex w-full flex-col items-center"
      initial={{ y: 80, scale: 0.6, opacity: 0, rotate: -6 }}
      animate={{ y: 0, scale: 1, opacity: 1, rotate: -1.5 }}
      transition={{ type: "spring", stiffness: 120, damping: 13, delay: 0.15 }}
    >
      {/* Gutschein-Karte */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff6dc] via-[#fbe7b5] to-[#f1cf85] p-2 text-[#3b2410] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative rounded-xl border-2 border-dashed border-[#a8793a]/60 px-6 py-7 text-center sm:px-8">
          {/* seitliche Kerben wie bei einem Ticket */}
          <span className="absolute -left-5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#140d12]" />
          <span className="absolute -right-5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#140d12]" />

          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#8a5a1f]">
            <Utensils className="h-4 w-4" />
            {GIFT.voucherLabel}
          </p>
          <p className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">{GIFT.voucherTitle}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {GIFT.voucherLines.map((line, i) => (
              <motion.span
                key={line}
                className="font-hand text-3xl font-bold text-[#c2255c]"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.35, type: "spring", stiffness: 260, damping: 14 }}
              >
                {line}
              </motion.span>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-snug text-[#7a5428]">{GIFT.voucherFine}</p>
          <p className="mt-4 font-hand text-2xl text-[#3b2410]">{GIFT.from}</p>
        </div>

        {/* Glanz, der über die Karte zieht */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-1/2 h-[200%] w-20 rotate-[25deg] bg-white/50 blur-md"
          initial={{ left: "-30%" }}
          animate={{ left: "130%" }}
          transition={{ duration: 1.6, delay: 0.6, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
        />
      </div>

      <motion.button
        type="button"
        onClick={onClose}
        className="mt-8 rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-[#2b1a10] shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {GIFT.button}
      </motion.button>
    </motion.div>
  );
}
