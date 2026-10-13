import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { Group } from "three";
import { CLASSROOM } from "../../data";
import Hotspot from "./Hotspot";
import { GIFT_POS } from "./layout";

interface Props {
  /** Schon ausgepackt → Deckel liegt daneben, Gutschein schaut heraus */
  opened: boolean;
  showLabel: boolean;
  onSelect: () => void;
}

const BOX = 0.46;
const H = 0.38;
const PAPER = "#d6336c";
const RIBBON = "#ffd43b";

/** Großes Geschenk auf dem Boden vor dem Pult – wackelt ab und zu */
export default function GiftObject({ opened, showLabel, onSelect }: Props) {
  const wiggle = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!wiggle.current) return;
    if (opened) {
      wiggle.current.rotation.z = 0;
      wiggle.current.position.y = 0;
      return;
    }
    // alle 4 Sekunden ein kleines Hüpfen
    const t = clock.elapsedTime % 4;
    const k = t < 0.6 ? Math.sin((t / 0.6) * Math.PI) : 0;
    wiggle.current.position.y = k * 0.05;
    wiggle.current.rotation.z = Math.sin(t * 25) * 0.05 * k;
  });

  return (
    <Hotspot
      label={CLASSROOM.objects.gift.label}
      hint={CLASSROOM.objects.gift.hint}
      visited={opened}
      showLabel={showLabel}
      onSelect={onSelect}
      position={GIFT_POS.toArray()}
      rotation={[0, 0.35, 0]}
      labelPosition={[0, 0.95, 0]}
    >
      <group ref={wiggle}>
        {/* Karton mit Schleifenband */}
        <mesh position-y={H / 2}>
          <boxGeometry args={[BOX, H, BOX]} />
          <meshStandardMaterial color={PAPER} roughness={0.45} />
        </mesh>
        <mesh position-y={H / 2}>
          <boxGeometry args={[0.07, H + 0.002, BOX + 0.004]} />
          <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position-y={H / 2}>
          <boxGeometry args={[BOX + 0.004, H + 0.002, 0.07]} />
          <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
        </mesh>

        {opened ? (
          <>
            {/* Gutschein schaut heraus */}
            <mesh position={[0, H + 0.1, 0]} rotation={[-0.15, 0.1, 0.06]}>
              <boxGeometry args={[0.34, 0.24, 0.006]} />
              <meshStandardMaterial color="#fff3d6" roughness={0.6} />
            </mesh>
            <mesh position={[0, H + 0.13, 0.004]} rotation={[-0.15, 0.1, 0.06]}>
              <planeGeometry args={[0.26, 0.04]} />
              <meshStandardMaterial color="#c9a46a" roughness={0.5} metalness={0.3} />
            </mesh>
            <Sparkles count={18} scale={[0.6, 0.5, 0.6]} position-y={H + 0.15} size={3} speed={0.4} color="#ffe066" />
            {/* Deckel liegt schräg daneben */}
            <group position={[0.42, 0.04, 0.12]} rotation={[0.25, 0.6, -0.35]}>
              <Lid />
            </group>
          </>
        ) : (
          <group position-y={H}>
            <Lid />
          </group>
        )}
      </group>
    </Hotspot>
  );
}

function Lid() {
  return (
    <group>
      <mesh position-y={0.04}>
        <boxGeometry args={[BOX + 0.04, 0.08, BOX + 0.04]} />
        <meshStandardMaterial color={PAPER} roughness={0.45} />
      </mesh>
      <mesh position-y={0.04}>
        <boxGeometry args={[0.07, 0.082, BOX + 0.044]} />
        <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position-y={0.04}>
        <boxGeometry args={[BOX + 0.044, 0.082, 0.07]} />
        <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Schleife */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.075, 0.13, 0]} rotation={[0, 0, s * 0.5]} scale={[1, 0.75, 0.55]}>
          <torusGeometry args={[0.065, 0.022, 10, 20]} />
          <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
      <mesh position-y={0.1}>
        <sphereGeometry args={[0.032, 14, 10]} />
        <meshStandardMaterial color={RIBBON} roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}
