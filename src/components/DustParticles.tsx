import { useState } from "react";
import { motion } from "framer-motion";

const PARTICLE_COUNT = 32;

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  drift: number;
  rise: number;
  duration: number;
  delay: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
    id,
    left: 15 + Math.random() * 70, // vor allem im Lichtkegel
    top: Math.random() * 85,
    size: 1.5 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
    rise: 30 + Math.random() * 60,
    duration: 12 + Math.random() * 14,
    delay: Math.random() * -20, // negativ: Partikel sind sofort "unterwegs"
  }));
}

/** Schwebende Staubkörner im Fensterlicht */
export default function DustParticles() {
  const [particles] = useState(createParticles);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            filter: p.size > 3.5 ? "blur(1px)" : undefined,
          }}
          animate={{
            x: [0, p.drift, p.drift * 0.4, 0],
            y: [0, -p.rise, -p.rise * 0.6, 0],
            opacity: [0, 0.7, 0.35, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
