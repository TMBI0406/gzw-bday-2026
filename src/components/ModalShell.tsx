import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalShellProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
  /** Hintergrund des bildschirmfüllenden Modals */
  className?: string;
  /** Wird bei Escape statt onClose aufgerufen (z.B. um erst ein Foto zu schließen) */
  onEscape?: () => void;
}

/** Bildschirmfüllende Hülle für alle Modals: Ein-/Ausblenden, Escape, Scroll-Lock. */
export default function ModalShell({ label, onClose, children, className = "", onEscape }: ModalShellProps) {
  const escapeRef = useRef(onEscape ?? onClose);
  escapeRef.current = onEscape ?? onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") escapeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`fixed inset-0 z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        layoutScroll
        className="h-full overflow-y-auto overflow-x-hidden overscroll-contain"
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ type: "spring", stiffness: 190, damping: 24 }}
      >
        {children}
      </motion.div>

      <motion.button
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6 sm:top-6"
        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}
