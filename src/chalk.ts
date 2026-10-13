/* Tafel: Kreide-Gruß zeichnen + gemeinsamer Speicher für das Gekritzel.
   Ohne Three.js, damit auch das Tafel-Modal es nutzen kann. */
import { CLASSROOM } from "./data";

/** Auflösung der Tafel-Textur in Pixeln */
export const BOARD_PX = { w: 2048, h: 784 };
export const CHALK_FONTS = ['700 200px "Caveat"', '500 100px "Caveat"'];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Kreide-Look: radiert zufällige Pünktchen aus dem zuletzt Gezeichneten */
export function chalkify(ctx: CanvasRenderingContext2D, w: number, h: number, density = 0.012) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  const count = Math.floor(w * h * density);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand(0.2, 0.7)})`;
    ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 2));
  }
  ctx.restore();
}

/** Tafelgrün mit Wischspuren und dem Kreide-Gruß */
export function drawChalkboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#24392d";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 120 + Math.random() * 220);
    g.addColorStop(0, "rgba(255,255,255,0.05)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Kreidetext auf eigener Ebene, damit "chalkify" nur die Schrift anraut
  const layer = document.createElement("canvas");
  layer.width = w;
  layer.height = h;
  const c = layer.getContext("2d")!;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "rgba(245,245,240,0.92)";
  c.font = '500 112px "Caveat", cursive';
  c.fillText(CLASSROOM.greeting, w / 2, h * 0.27);
  c.fillStyle = "rgba(255,236,190,0.96)";
  c.font = '700 215px "Caveat", cursive';
  c.fillText(CLASSROOM.name, w / 2, h * 0.58);

  // Unterstrich-Schwung, Sterne, Herz
  c.strokeStyle = "rgba(245,245,240,0.8)";
  c.lineWidth = 9;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(w * 0.28, h * 0.8);
  c.bezierCurveTo(w * 0.42, h * 0.86, w * 0.6, h * 0.76, w * 0.73, h * 0.82);
  c.stroke();
  const star = (x: number, y: number, r: number) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.45;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.stroke();
  };
  c.lineWidth = 6;
  star(w * 0.08, h * 0.2, 46);
  star(w * 0.92, h * 0.74, 38);
  star(w * 0.88, h * 0.18, 26);
  c.strokeStyle = "rgba(255,170,170,0.85)";
  c.beginPath();
  const hx = w * 0.1;
  const hy = h * 0.72;
  c.moveTo(hx, hy + 30);
  c.bezierCurveTo(hx - 60, hy - 10, hx - 25, hy - 55, hx, hy - 22);
  c.bezierCurveTo(hx + 25, hy - 55, hx + 60, hy - 10, hx, hy + 30);
  c.stroke();

  chalkify(c, w, h, 0.02);
  ctx.drawImage(layer, 0, 0);
}

/** Ein Kreidestrich-Stück mit rauem Rand. color = null → Schwamm (radieren) */
export function chalkSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string | null,
  width: number,
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  if (color === null) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
  } else {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.88;
  }
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  if (color !== null) {
    // Körnung: kleine Löcher im Strich
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    const len = Math.hypot(x1 - x0, y1 - y0);
    const specks = Math.ceil((len + 1) * width * 0.06);
    for (let i = 0; i < specks; i++) {
      const t = Math.random();
      ctx.fillStyle = `rgba(0,0,0,${rand(0.3, 0.8)})`;
      ctx.fillRect(
        x0 + (x1 - x0) * t + rand(-width / 2, width / 2),
        y0 + (y1 - y0) * t + rand(-width / 2, width / 2),
        rand(1, 3),
        rand(1, 2.5),
      );
    }
  }
  ctx.restore();
}

// ---------- Gemeinsamer Speicher fürs Gekritzel ---------------------------

let drawing: HTMLCanvasElement | null = null;
const subs = new Set<() => void>();

/** Durchsichtige Ebene mit allem, was auf die Tafel gekritzelt wurde */
export function getDrawing() {
  if (!drawing) {
    drawing = document.createElement("canvas");
    drawing.width = BOARD_PX.w;
    drawing.height = BOARD_PX.h;
  }
  return drawing;
}

/** Meldet allen (z.B. der 3D-Tafel), dass sich das Gekritzel geändert hat */
export function drawingChanged() {
  subs.forEach((fn) => fn());
}

export function subscribeDrawing(fn: () => void) {
  subs.add(fn);
  return () => void subs.delete(fn);
}
