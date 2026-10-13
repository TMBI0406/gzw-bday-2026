import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type PointLight } from "three";
import { CAKE } from "../../data";
import Hotspot from "./Hotspot";
import { CAKE_POS } from "./layout";

interface Props {
  showLabel: boolean;
  onBlow: () => void;
}

const STRIPES = ["#f783ac", "#74c0fc", "#ffd43b", "#8ce99a", "#b197fc", "#ffa94d"];

/** Geburtstagskuchen – Antippen pustet die Kerzen aus, erneutes Antippen zündet sie wieder an */
export default function Cake({ showLabel, onBlow }: Props) {
  const [lit, setLit] = useState(true);
  const flames = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const flameScale = useRef(1);

  useFrame(({ clock }, dt) => {
    flameScale.current = MathUtils.damp(flameScale.current, lit ? 1 : 0, lit ? 4 : 12, dt);
    const t = clock.elapsedTime;
    flames.current?.children.forEach((f, i) => {
      const flicker = 1 + Math.sin(t * 18 + i * 2.1) * 0.08 + Math.sin(t * 31 + i) * 0.05;
      f.scale.set(flameScale.current * (2 - flicker), flameScale.current * flicker * 1.8, flameScale.current);
    });
    if (light.current) light.current.intensity = flameScale.current * (0.9 + Math.sin(t * 20) * 0.12);
  });

  const toggle = () => {
    if (lit) onBlow();
    setLit((l) => !l);
  };

  const n = CAKE.candles;
  const candleR = 0.085;

  return (
    <Hotspot
      label={lit ? CAKE.tapHint : "🕯️"}
      showLabel={showLabel}
      onSelect={toggle}
      position={CAKE_POS.toArray()}
      labelPosition={[0, 0.48, 0]}
    >
      {/* Teller */}
      <mesh position-y={0.008}>
        <cylinderGeometry args={[0.24, 0.22, 0.016, 32]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.2} />
      </mesh>
      {/* Torte */}
      <mesh position-y={0.09}>
        <cylinderGeometry args={[0.19, 0.19, 0.15, 40]} />
        <meshStandardMaterial color="#f3c4d0" roughness={0.6} />
      </mesh>
      <mesh position-y={0.163}>
        <torusGeometry args={[0.185, 0.014, 8, 40]} />
        <meshStandardMaterial color="#fff5f8" roughness={0.5} />
      </mesh>
      <mesh position-y={0.21}>
        <cylinderGeometry args={[0.13, 0.13, 0.1, 40]} />
        <meshStandardMaterial color="#fffaf3" roughness={0.6} />
      </mesh>
      {/* Erdbeeren */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.16, 0.175, Math.sin(a) * 0.16]}>
            <sphereGeometry args={[0.018, 12, 8]} />
            <meshStandardMaterial color="#d6336c" roughness={0.35} />
          </mesh>
        );
      })}
      {/* Kerzen */}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * candleR, 0.3, Math.sin(a) * candleR]}>
            <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
            <meshStandardMaterial color={STRIPES[i % STRIPES.length]} roughness={0.5} />
          </mesh>
        );
      })}
      <group ref={flames}>
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * candleR, 0.357, Math.sin(a) * candleR]} userData={{ noCast: true }}>
              <sphereGeometry args={[0.012, 10, 8]} />
              <meshBasicMaterial color="#ffb547" toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <pointLight ref={light} position-y={0.45} color="#ffb24d" intensity={0.9} distance={1.6} decay={2} />
    </Hotspot>
  );
}
