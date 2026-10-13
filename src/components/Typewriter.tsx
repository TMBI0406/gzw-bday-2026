import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TypewriterProps {
  lines: string[];
  /** Millisekunden pro Zeichen */
  speed?: number;
  /** Pause zwischen zwei Sätzen */
  lineDelay?: number;
  startDelay?: number;
  skipHint?: string;
  className?: string;
}

const PUNCTUATION = /[.,!?…:;–]/;

/** Tippt die Sätze nacheinander. Ein Tipp/Klick zeigt sofort alles an. */
export default function Typewriter({
  lines,
  speed = 38,
  lineDelay = 700,
  startDelay = 600,
  skipHint,
  className = "",
}: TypewriterProps) {
  const reduceMotion = useReducedMotion();
  // Array.from, damit Emojis nicht in halbe Zeichen zerfallen
  const chars = useMemo(() => lines.map((line) => Array.from(line)), [lines]);
  const [started, setStarted] = useState(false);
  const [lineIdx, setLineIdx] = useState(reduceMotion ? lines.length : 0);
  const [charIdx, setCharIdx] = useState(0);
  const done = lineIdx >= lines.length;

  useEffect(() => {
    const t = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started || done) return;
    const line = chars[lineIdx];

    if (charIdx < line.length) {
      const prev = line[charIdx - 1] ?? "";
      const base = PUNCTUATION.test(prev) ? speed * 7 : speed;
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), base * (0.6 + Math.random() * 0.8));
      return () => window.clearTimeout(t);
    }

    const t = window.setTimeout(() => {
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, lineDelay);
    return () => window.clearTimeout(t);
  }, [started, done, chars, lineIdx, charIdx, speed, lineDelay]);

  const skip = () => setLineIdx(lines.length);

  return (
    <div className={`relative ${className}`} onClick={done ? undefined : skip}>
      {chars.map((line, i) => {
        if (i > lineIdx) return null;
        const visible = i < lineIdx ? line.join("") : line.slice(0, charIdx).join("");
        const isCurrent = i === lineIdx || (done && i === lines.length - 1);
        return (
          <p key={i} className="mb-3 min-h-[1.5em] last:mb-0">
            {visible}
            {isCurrent && (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] bg-current"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              />
            )}
          </p>
        );
      })}

      {/* Vollständiger Text für Screenreader */}
      <span className="sr-only">{lines.join(" ")}</span>

      {skipHint && !done && started && (
        <motion.button
          type="button"
          onClick={skip}
          className="mt-4 text-xs uppercase tracking-widest opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
        >
          {skipHint}
        </motion.button>
      )}
    </div>
  );
}
