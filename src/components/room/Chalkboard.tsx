import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { BOARD_PX, CHALK_FONTS, drawChalkboard, getDrawing, subscribeDrawing } from "../../chalk";
import { CLASSROOM } from "../../data";
import Hotspot from "./Hotspot";
import { CHALKBOARD_POS } from "./layout";
import { useCanvasTexture } from "./textures";

const BOARD_W = 3.8;
const BOARD_H = 1.45;
interface Props {
  showLabel: boolean;
  onSelect: () => void;
}

/** Tafel mit Kreide-Gruß, Rahmen und Ablage – antippen zum Selbstkritzeln */
export default function Chalkboard({ showLabel, onSelect }: Props) {
  const texture = useCanvasTexture(BOARD_PX.w, BOARD_PX.h, drawChalkboard, CHALK_FONTS);

  // Gekritzel als durchsichtige Ebene über der Tafel
  const drawing = useMemo(() => {
    const t = new CanvasTexture(getDrawing());
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  // neu hochladen, sobald gekritzelt wurde (ohne React-Neurender)
  useEffect(
    () =>
      subscribeDrawing(() => {
        drawing.needsUpdate = true;
      }),
    [drawing],
  );

  return (
    <Hotspot
      label={CLASSROOM.objects.board.label}
      hint={CLASSROOM.objects.board.hint}
      showLabel={showLabel}
      onSelect={onSelect}
      hoverScale={1.012}
      position={CHALKBOARD_POS.toArray()}
      labelPosition={[-BOARD_W / 2 + 0.55, BOARD_H / 2 - 0.12, 0.15]}
    >
      <mesh position-z={-0.015}>
        <boxGeometry args={[BOARD_W + 0.16, BOARD_H + 0.16, 0.04]} />
        <meshStandardMaterial color="#5b3b22" roughness={0.6} />
      </mesh>
      <mesh position-z={0.006}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      <mesh position-z={0.008}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshStandardMaterial map={drawing} transparent roughness={0.95} depthWrite={false} />
      </mesh>
      {/* Kreideablage mit Kreide und Schwamm */}
      <group position={[0, -BOARD_H / 2 - 0.1, 0.06]}>
        <mesh>
          <boxGeometry args={[BOARD_W, 0.03, 0.1]} />
          <meshStandardMaterial color="#5b3b22" roughness={0.6} />
        </mesh>
        {[
          [-1.2, "#f4f1ea"],
          [-1.05, "#f6d36b"],
          [-0.92, "#f4a3a3"],
        ].map(([x, c]) => (
          <mesh key={x as number} position={[x as number, 0.025, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} />
            <meshStandardMaterial color={c as string} roughness={1} />
          </mesh>
        ))}
        <mesh position={[1.1, 0.04, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.07]} />
          <meshStandardMaterial color="#c49a52" roughness={1} />
        </mesh>
      </group>
    </Hotspot>
  );
}
