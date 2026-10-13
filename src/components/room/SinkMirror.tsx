import { useMemo } from "react";
import { CLASSROOM } from "../../data";
import Hotspot from "./Hotspot";
import { MIRROR_Y, SINK_POS } from "./layout";
import { createCanvasTexture, usePhotoTexture } from "./textures";

interface Props {
  visited: boolean;
  showLabel: boolean;
  /** Selfie, das im Spiegel angezeigt wird (Object-URL) */
  selfie: string | null;
  onSelect: () => void;
}

const GLASS_W = 0.56;
const GLASS_H = 0.76;
const CERAMIC = "#f4f2ee";
const CHROME = { color: "#d8dde2", metalness: 0.9, roughness: 0.18 };

/** Glasreflexion: kühler Verlauf mit hellen Schlieren */
function mirrorTexture() {
  return createCanvasTexture(256, 348, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#c8d6dd");
    g.addColorStop(0.5, "#8fa3ad");
    g.addColorStop(1, "#5d6f78");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    sheen(ctx, w, h, 0.55);
  });
}

/** Halbtransparente Schlieren für über das Selfie */
function sheenTexture() {
  return createCanvasTexture(256, 348, (ctx, w, h) => sheen(ctx, w, h, 0.28));
}

function sheen(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.6);
  ctx.filter = "blur(6px)";
  for (const [x, width] of [
    [-60, 46],
    [10, 16],
    [48, 8],
  ]) {
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, -h, width, h * 2);
  }
  ctx.restore();
}

function tileTexture() {
  return createCanvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#b9c6c3";
    ctx.fillRect(0, 0, w, h);
    const s = 32;
    for (let y = 0; y < h; y += s)
      for (let x = 0; x < w; x += s) {
        ctx.fillStyle = (x / s + y / s) % 2 ? "#eef3f1" : "#e3ece9";
        ctx.fillRect(x + 1.5, y + 1.5, s - 3, s - 3);
      }
  });
}

/** Waschbecken mit Spiegel an der rechten Wand. Antippen → Selfie-Kamera. */
export default function SinkMirror({ visited, showLabel, selfie, onSelect }: Props) {
  const glass = useMemo(mirrorTexture, []);
  const tiles = useMemo(tileTexture, []);

  return (
    <Hotspot
      label={CLASSROOM.objects.mirror.label}
      hint={CLASSROOM.objects.mirror.hint}
      visited={visited}
      showLabel={showLabel}
      onSelect={onSelect}
      position={SINK_POS.toArray()}
      rotation={[0, -Math.PI / 2, 0]}
      labelPosition={[-0.4, MIRROR_Y + 0.62, 0.15]}
    >
      {/* Fliesenspiegel */}
      <mesh position={[0, 1.04, 0.02]}>
        <planeGeometry args={[1.0, 0.5]} />
        <meshStandardMaterial map={tiles} roughness={0.35} />
      </mesh>

      {/* Becken auf Standfuß */}
      <mesh position={[0, 0.79, 0.25]}>
        <boxGeometry args={[0.62, 0.14, 0.44]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.861, 0.27]} rotation-x={-Math.PI / 2} scale={[1, 0.72, 1]}>
        <circleGeometry args={[0.24, 32]} />
        <meshStandardMaterial color="#cdd6db" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.862, 0.28]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.02, 16]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.36, 0.18]}>
        <cylinderGeometry args={[0.07, 0.11, 0.72, 20]} />
        <meshStandardMaterial color={CERAMIC} roughness={0.25} />
      </mesh>

      {/* Wasserhahn */}
      <mesh position={[0, 0.92, 0.07]}>
        <cylinderGeometry args={[0.022, 0.028, 0.12, 14]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.97, 0.13]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.016, 0.016, 0.13, 12]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 1.0, 0.07]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 10]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>

      {/* Seifenspender */}
      <group position={[0.23, 0.86, 0.1]}>
        <mesh position-y={0.06}>
          <cylinderGeometry args={[0.032, 0.035, 0.12, 14]} />
          <meshStandardMaterial color="#f08cae" roughness={0.3} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.135, 0.015]}>
          <boxGeometry args={[0.02, 0.03, 0.05]} />
          <meshStandardMaterial color="#fafafa" />
        </mesh>
      </group>

      {/* Ablage mit Zahnputzbecher */}
      <mesh position={[0, MIRROR_Y - GLASS_H / 2 - 0.08, 0.07]}>
        <boxGeometry args={[0.5, 0.02, 0.1]} />
        <meshStandardMaterial color="#e9eef0" roughness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.16, MIRROR_Y - GLASS_H / 2 - 0.03, 0.07]}>
        <cylinderGeometry args={[0.03, 0.025, 0.08, 14]} />
        <meshStandardMaterial color="#4c6ef5" roughness={0.4} />
      </mesh>

      {/* Spiegel */}
      <mesh position={[0, MIRROR_Y, 0.03]}>
        <boxGeometry args={[GLASS_W + 0.08, GLASS_H + 0.08, 0.035]} />
        <meshStandardMaterial color="#c9a46a" metalness={0.65} roughness={0.35} />
      </mesh>
      <group position={[0, MIRROR_Y, 0.049]}>
        {selfie ? (
          <SelfieGlass key={selfie} src={selfie} />
        ) : (
          <mesh>
            <planeGeometry args={[GLASS_W, GLASS_H]} />
            <meshBasicMaterial map={glass} toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* Papierhandtuchspender */}
      <group position={[0.58, 1.38, 0.08]}>
        <mesh>
          <boxGeometry args={[0.3, 0.36, 0.13]} />
          <meshStandardMaterial color="#e4e6e8" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.19, 0.03]}>
          <boxGeometry args={[0.18, 0.05, 0.005]} />
          <meshStandardMaterial color="#fbf8f1" />
        </mesh>
      </group>
    </Hotspot>
  );
}

/** Das Selfie im Spiegelglas – wie "object-fit: cover" zugeschnitten */
function SelfieGlass({ src }: { src: string }) {
  const photo = usePhotoTexture(src, GLASS_W / GLASS_H);
  const overlay = useMemo(sheenTexture, []);

  return (
    <>
      <mesh>
        <planeGeometry args={[GLASS_W, GLASS_H]} />
        {photo ? (
          <meshBasicMaterial key="photo" map={photo} toneMapped={false} />
        ) : (
          <meshBasicMaterial key="empty" color="#8fa3ad" />
        )}
      </mesh>
      <mesh position-z={0.001}>
        <planeGeometry args={[GLASS_W, GLASS_H]} />
        <meshBasicMaterial map={overlay} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}
