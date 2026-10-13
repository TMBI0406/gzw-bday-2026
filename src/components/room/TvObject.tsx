import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, type PointLight } from "three";
import { CLASSROOM } from "../../data";
import Hotspot from "./Hotspot";
import { TV_CART_POS, TV_CART_YAW } from "./layout";

interface Props {
  visited: boolean;
  showLabel: boolean;
  onSelect: () => void;
}

const SCREEN_W = 256;
const SCREEN_H = 192;
const METAL = "#3f444b";

/** Röhrenfernseher auf Rollwagen mit flimmerndem Bildschirm */
export default function TvObject({ visited, showLabel, onSelect }: Props) {
  const glow = useRef<PointLight>(null);
  const last = useRef(0);

  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return { texture: t, ctx: canvas.getContext("2d")! };
  }, []);

  // Bildschirm ca. 15x pro Sekunde neu zeichnen: Bluescreen, Play-Symbol, Rauschen
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glow.current) glow.current.intensity = 1.6 + Math.sin(t * 9) * 0.15 + Math.random() * 0.2;
    if (t - last.current < 0.066) return;
    last.current = t;

    const g = ctx.createRadialGradient(SCREEN_W / 2, SCREEN_H / 2, 10, SCREEN_W / 2, SCREEN_H / 2, SCREEN_W * 0.7);
    g.addColorStop(0, "#3b6fd8");
    g.addColorStop(1, "#0c1f5c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`;
      ctx.fillRect(Math.random() * SCREEN_W, Math.random() * SCREEN_H, 2, 1);
    }

    const pulse = 1 + Math.sin(t * 3) * 0.08;
    ctx.save();
    ctx.translate(SCREEN_W / 2, SCREEN_H / 2 - 8);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.moveTo(-18, -24);
    ctx.lineTo(26, 0);
    ctx.lineTo(-18, 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PLAY", SCREEN_W / 2, SCREEN_H - 34);
    ctx.textAlign = "left";
    ctx.fillStyle = "#7CFC9A";
    ctx.fillText("CH 1", 14, 26);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 0; y < SCREEN_H; y += 3) ctx.fillRect(0, y, SCREEN_W, 1);
    const bar = (t * 40) % (SCREEN_H + 40);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, bar - 40, SCREEN_W, 30);

    texture.needsUpdate = true;
  });

  return (
    <Hotspot
      label={CLASSROOM.objects.projector.label}
      hint={CLASSROOM.objects.projector.hint}
      visited={visited}
      showLabel={showLabel}
      onSelect={onSelect}
      position={TV_CART_POS.toArray()}
      rotation={[0, TV_CART_YAW, 0]}
      labelPosition={[0, 2.05, 0]}
    >
      {/* Rollwagen */}
      {[0.9, 0.28].map((y) => (
        <mesh key={y} position-y={y}>
          <boxGeometry args={[1.05, 0.04, 0.7]} />
          <meshStandardMaterial color="#2f3338" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
      {[-0.48, 0.48].map((x) =>
        [-0.31, 0.31].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position-y={0.49}>
              <cylinderGeometry args={[0.018, 0.018, 0.86, 8]} />
              <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position-y={0.04} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
              <meshStandardMaterial color="#111" roughness={0.6} />
            </mesh>
          </group>
        )),
      )}
      {/* Videorekorder */}
      <mesh position={[0, 0.36, 0.02]}>
        <boxGeometry args={[0.7, 0.12, 0.45]} />
        <meshStandardMaterial color="#1e1f22" roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.36, 0.246]}>
        <planeGeometry args={[0.3, 0.025]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0.24, 0.37, 0.246]}>
        <planeGeometry args={[0.1, 0.03]} />
        <meshBasicMaterial color="#5cff8a" toneMapped={false} />
      </mesh>

      {/* Fernseher */}
      <group position-y={0.92}>
        <mesh position={[0, 0.37, -0.02]}>
          <boxGeometry args={[0.98, 0.74, 0.62]} />
          <meshStandardMaterial color="#5b3a22" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.37, -0.36]}>
          <boxGeometry args={[0.7, 0.52, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
        </mesh>
        {/* Bildschirm-Einfassung */}
        <mesh position={[-0.08, 0.35, 0.292]}>
          <boxGeometry args={[0.72, 0.58, 0.02]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.4} />
        </mesh>
        <mesh position={[-0.08, 0.35, 0.304]}>
          <planeGeometry args={[0.64, 0.5]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {/* Bedienfeld */}
        {[0.52, 0.4].map((y) => (
          <mesh key={y} position={[0.38, y, 0.3]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
            <meshStandardMaterial color="#c9c9c9" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {[0.24, 0.2, 0.16].map((y) => (
          <mesh key={y} position={[0.38, y, 0.292]}>
            <boxGeometry args={[0.12, 0.012, 0.005]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
        {/* Antennen */}
        <mesh position={[0, 0.76, -0.05]}>
          <sphereGeometry args={[0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {[-0.5, 0.45].map((r) => (
          <mesh key={r} position={[Math.sin(-r) * 0.22, 0.98, -0.05]} rotation-z={r}>
            <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <pointLight ref={glow} position={[-0.08, 0.35, 0.6]} color="#7aa8ff" intensity={1.6} distance={2.5} decay={2} />
      </group>
    </Hotspot>
  );
}
