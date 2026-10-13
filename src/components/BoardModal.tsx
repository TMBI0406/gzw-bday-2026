import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { Eraser, RotateCcw, Smartphone } from "lucide-react";
import { BOARD_PX, CHALK_FONTS, chalkSegment, drawChalkboard, drawingChanged, getDrawing } from "../chalk";
import { BOARD } from "../data";
import ModalShell from "./ModalShell";

interface BoardModalProps {
  onClose: () => void;
}

const COLORS = ["#f8f7f2", "#ffe27a", "#ffa8c5", "#9fd8ff", "#b4f0a8"];
/** Strichbreite in Bildschirm-Pixeln */
const CHALK_PX = 5;
const SPONGE_PX = 30;

export default function BoardModal({ onClose }: BoardModalProps) {
  const bg = useRef<HTMLCanvasElement>(null);
  const fg = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string | null>(COLORS[0]);
  const last = useRef<{ x: number; y: number } | null>(null);

  // Hintergrund (Tafel mit Gruß) + bisheriges Gekritzel
  useEffect(() => {
    const paintBg = () => {
      const ctx = bg.current?.getContext("2d");
      if (ctx) drawChalkboard(ctx, BOARD_PX.w, BOARD_PX.h);
    };
    paintBg();
    Promise.all(CHALK_FONTS.map((f) => document.fonts.load(f)))
      .catch(() => undefined)
      .then(paintBg);
    fg.current?.getContext("2d")?.drawImage(getDrawing(), 0, 0);
  }, []);

  const toCanvas = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = BOARD_PX.w / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale, scale };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }, scale: number) => {
    const width = (color ? CHALK_PX : SPONGE_PX) * scale;
    // sichtbares Canvas und gemeinsame Ebene (für die 3D-Tafel) gleich bemalen
    for (const ctx of [fg.current?.getContext("2d"), getDrawing().getContext("2d")]) {
      if (ctx) chalkSegment(ctx, from.x, from.y, to.x, to.y, color, width);
    }
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toCanvas(e);
    last.current = p;
    stroke(p, { x: p.x + 0.1, y: p.y + 0.1 }, p.scale);
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const p = toCanvas(e);
    stroke(last.current, p, p.scale);
    last.current = p;
  };

  const onUp = () => {
    if (!last.current) return;
    last.current = null;
    drawingChanged();
  };

  const clear = () => {
    for (const c of [fg.current, getDrawing()]) c?.getContext("2d")?.clearRect(0, 0, BOARD_PX.w, BOARD_PX.h);
    drawingChanged();
  };

  return (
    <ModalShell label={BOARD.title} onClose={onClose} className="bg-[#16120f]">
      <div className="relative flex min-h-full flex-col items-center justify-center gap-4 px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 sm:px-8">
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-3xl text-stone-100">{BOARD.title}</h2>
          <p className="mt-1 font-hand text-xl text-amber-100/80">{BOARD.subline}</p>
        </motion.header>

        {/* Tafel mit Holzrahmen */}
        <div className="w-full max-w-5xl rounded-lg bg-[#5b3b22] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] sm:p-3">
          <div className="relative" style={{ aspectRatio: `${BOARD_PX.w} / ${BOARD_PX.h}` }}>
            <canvas ref={bg} width={BOARD_PX.w} height={BOARD_PX.h} className="absolute inset-0 h-full w-full rounded" />
            <canvas
              ref={fg}
              width={BOARD_PX.w}
              height={BOARD_PX.h}
              className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>
        </div>

        <p className="flex items-center gap-2 text-xs text-stone-400 landscape:hidden sm:hidden">
          <Smartphone className="h-4 w-4 rotate-90" />
          {BOARD.rotateHint}
        </p>

        {/* Werkzeuge */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label="Kreidefarbe"
              onClick={() => setColor(c)}
              className={`h-9 w-9 rounded-full border-2 shadow transition-transform ${
                color === c ? "scale-110 border-amber-300" : "border-white/20"
              }`}
              style={{ background: c }}
            />
          ))}
          <button
            type="button"
            aria-label="Schwamm"
            onClick={() => setColor(null)}
            className={`grid h-9 w-9 place-items-center rounded-full border-2 bg-[#c49a52] text-[#3b2410] shadow transition-transform ${
              color === null ? "scale-110 border-amber-300" : "border-white/20"
            }`}
          >
            <Eraser className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clear}
            className="ml-1 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-stone-100 hover:bg-white/15"
          >
            <RotateCcw className="h-4 w-4" />
            {BOARD.clear}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-[#2b1a10] shadow-lg"
          >
            {BOARD.done}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
