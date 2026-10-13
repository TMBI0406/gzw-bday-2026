import { useMemo } from "react";
import { asset } from "../../asset";
import { CLASSROOM, PHOTOS, type Photo } from "../../data";
import Hotspot from "./Hotspot";
import { CORKBOARD_POS } from "./layout";
import { corkTexture, usePhotoTexture } from "./textures";

interface Props {
  visited: boolean;
  showLabel: boolean;
  onSelect: () => void;
}

const BOARD_W = 2.3;
const BOARD_H = 1.5;
const SLOTS: { x: number; y: number; rot: number }[] = [
  { x: -0.72, y: 0.3, rot: 0.08 },
  { x: 0.0, y: 0.34, rot: -0.05 },
  { x: 0.72, y: 0.28, rot: 0.1 },
  { x: -0.7, y: -0.36, rot: -0.07 },
  { x: 0.02, y: -0.32, rot: 0.04 },
  { x: 0.7, y: -0.38, rot: -0.09 },
];
const PIN_COLORS = ["#d62828", "#1d4ed8", "#f59f00", "#2b8a3e"];

/** Korkwand an der Rückwand mit echten Fotos als Polaroids */
export default function CorkBoardObject({ visited, showLabel, onSelect }: Props) {
  const cork = useMemo(corkTexture, []);

  return (
    <Hotspot
      label={CLASSROOM.objects.gallery.label}
      hint={CLASSROOM.objects.gallery.hint}
      visited={visited}
      showLabel={showLabel}
      onSelect={onSelect}
      position={CORKBOARD_POS.toArray()}
      labelPosition={[0, BOARD_H / 2 + 0.2, 0.1]}
    >
      <mesh position-z={-0.02}>
        <boxGeometry args={[BOARD_W + 0.12, BOARD_H + 0.12, 0.04]} />
        <meshStandardMaterial color="#6b4527" roughness={0.6} />
      </mesh>
      <mesh position-z={0.001}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshStandardMaterial map={cork} roughness={1} />
      </mesh>
      {PHOTOS.slice(0, SLOTS.length).map((photo, i) => (
        <Polaroid key={photo.id} photo={photo} slot={SLOTS[i]} pin={PIN_COLORS[i % PIN_COLORS.length]} order={i} />
      ))}
    </Hotspot>
  );
}

function Polaroid({
  photo,
  slot,
  pin,
  order,
}: {
  photo: Photo;
  slot: (typeof SLOTS)[number];
  pin: string;
  order: number;
}) {
  const texture = usePhotoTexture(asset(photo.src), 1);
  const z = 0.01 + order * 0.002; // verhindert Z-Fighting bei Überlappung
  return (
    <group position={[slot.x, slot.y, z]} rotation-z={slot.rot}>
      <mesh>
        <planeGeometry args={[0.46, 0.54]} />
        <meshStandardMaterial color="#fbf8f1" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.04, 0.001]}>
        <planeGeometry args={[0.39, 0.39]} />
        {texture ? (
          <meshStandardMaterial key="photo" map={texture} roughness={0.6} />
        ) : (
          <meshStandardMaterial key="placeholder" color="#9aa5b1" roughness={0.6} />
        )}
      </mesh>
      <mesh position={[0, 0.24, 0.02]}>
        <sphereGeometry args={[0.025, 16, 12]} />
        <meshStandardMaterial color={pin} roughness={0.3} />
      </mesh>
    </group>
  );
}
