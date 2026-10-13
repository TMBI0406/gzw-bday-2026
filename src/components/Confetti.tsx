import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#e4572e", "#f3a712", "#29a19c", "#4c6ef5", "#d6336c", "#a9e34b", "#fff3bf"];
const PIECES = 90;

interface ConfettiProps {
  /** Jede neue Zahl löst eine neue Salve aus (0 = aus) */
  burst: number;
}

/** Konfetti-Salve aus der Bildschirmmitte */
export default function Confetti({ burst }: ConfettiProps) {
  if (burst === 0) return null;
  return <ConfettiBurst key={burst} />;
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const power = 140 + Math.random() * 260;
        return {
          id: i,
          color: COLORS[i % COLORS.length],
          x: Math.cos(angle) * power,
          y: Math.sin(angle) * power * 0.7 - 160,
          fall: 380 + Math.random() * 420,
          rotate: (Math.random() - 0.5) * 900,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 10,
          round: Math.random() > 0.7,
          duration: 2.4 + Math.random() * 1.4,
        };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-[45%]"
          style={{
            width: p.w,
            height: p.round ? p.w : p.h,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{
            x: [0, p.x, p.x * 1.15],
            y: [0, p.y, p.y + p.fall],
            rotate: p.rotate,
            opacity: [1, 1, 0],
            scale: 1,
          }}
          transition={{ duration: p.duration, times: [0, 0.25, 1], ease: ["easeOut", "easeIn"] }}
        />
      ))}
    </div>
  );
}
