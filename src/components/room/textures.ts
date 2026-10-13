import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture } from "three";

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Erzeugt eine Textur, die per Canvas-2D gezeichnet wird. */
export function createCanvasTexture(w: number, h: number, draw: Draw, repeat?: [number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!, w, h);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  return texture;
}

/** Wie createCanvasTexture, zeichnet aber neu, sobald die Webfonts geladen sind. */
export function useCanvasTexture(w: number, h: number, draw: Draw, fonts: string[] = []) {
  const texture = useMemo(() => createCanvasTexture(w, h, draw), [w, h, draw]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(fonts.map((f) => document.fonts.load(f)))
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        const canvas = texture.image as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h);
        texture.needsUpdate = true;
      });
    return () => {
      cancelled = true;
    };
    // fonts ist eine Konstante pro Aufrufer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, draw, w, h]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Schneidet eine Foto-Textur mittig zu wie "object-fit: cover" (aspect = Breite / Höhe der Fläche) */
export function coverTexture(texture: Texture, aspect: number) {
  const img = texture.image as { width: number; height: number };
  const imgAspect = img.width / img.height;
  if (imgAspect > aspect) {
    texture.repeat.set(aspect / imgAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, imgAspect / aspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
  texture.needsUpdate = true;
}

/** Lädt ein Foto als Textur; liefert null, solange es lädt oder wenn es fehlschlägt. */
export function usePhotoTexture(src: string, coverAspect?: number) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let active = true;
    let loaded: Texture | null = null;
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      src,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        if (coverAspect) coverTexture(t, coverAspect);
        loaded = t;
        if (active) setTexture(t);
        else t.dispose();
      },
      undefined,
      () => active && setTexture(null),
    );
    return () => {
      active = false;
      loaded?.dispose();
    };
  }, [src, coverAspect]);

  return texture;
}

// ---------- Prozedurale Materialien ----------------------------------------

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function woodFloorTexture() {
  return createCanvasTexture(
    1024,
    1024,
    (ctx, w, h) => {
      const planks = 8;
      const pw = w / planks;
      for (let i = 0; i < planks; i++) {
        let y = -rand(0, h * 0.6);
        while (y < h) {
          const len = rand(h * 0.45, h * 0.9);
          const l = rand(30, 40);
          ctx.fillStyle = `hsl(${rand(24, 32)}, ${rand(38, 48)}%, ${l}%)`;
          ctx.fillRect(i * pw, y, pw, len);
          // Maserung
          for (let g = 0; g < 14; g++) {
            ctx.strokeStyle = `rgba(40,20,8,${rand(0.05, 0.16)})`;
            ctx.lineWidth = rand(0.6, 2);
            const gx = i * pw + rand(4, pw - 4);
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.bezierCurveTo(gx + rand(-6, 6), y + len * 0.3, gx + rand(-6, 6), y + len * 0.7, gx + rand(-4, 4), y + len);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(20,10,4,0.55)";
          ctx.fillRect(i * pw, y + len - 2, pw, 3);
          y += len;
        }
        ctx.fillStyle = "rgba(20,10,4,0.6)";
        ctx.fillRect(i * pw, 0, 3, h);
      }
    },
    [2.5, 2.5],
  );
}

export function plasterTexture(base: string, repeat: [number, number] = [4, 2]) {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
        ctx.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3));
      }
    },
    repeat,
  );
}

export function corkTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#a8794c";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) {
        const l = rand(22, 62);
        ctx.fillStyle = `hsla(${rand(22, 34)}, ${rand(35, 55)}%, ${l}%, ${rand(0.35, 0.8)})`;
        ctx.beginPath();
        ctx.arc(rand(0, w), rand(0, h), rand(0.6, 2.4), 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [2, 1.3],
  );
}

export function skyTexture() {
  return createCanvasTexture(256, 320, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#9cc8ee");
    g.addColorStop(0.65, "#fde7c3");
    g.addColorStop(1, "#ffd59a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.filter = "blur(8px)";
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(rand(0, w), rand(20, h * 0.45), rand(30, 60), rand(10, 18), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = "blur(2px)";
    ctx.fillStyle = "rgba(70,95,60,0.85)";
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(rand(-10, w + 10), h - rand(0, 20), rand(30, 55), 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Weicher Verlauf für Lichtstrahlen (additiv geblendet) */
export function lightShaftTexture() {
  return createCanvasTexture(256, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(255,240,210,1)");
    g.addColorStop(1, "rgba(255,240,210,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const edge = ctx.createLinearGradient(0, 0, 0, h);
    edge.addColorStop(0, "rgba(0,0,0,1)");
    edge.addColorStop(0.3, "rgba(0,0,0,0)");
    edge.addColorStop(0.7, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, w, h);
  });
}

export function softSpotTexture() {
  return createCanvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,236,200,1)");
    g.addColorStop(1, "rgba(255,236,200,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

export { chalkify } from "../../chalk";
