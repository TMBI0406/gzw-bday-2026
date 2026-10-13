import { useContext, useRef, useState, type ReactNode, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { MathUtils, type Group } from "three";
import { Check } from "lucide-react";
import { LabelLayer } from "./labelLayer";

type Vec3 = [number, number, number];

interface HotspotProps {
  label: string;
  hint?: string;
  visited?: boolean;
  showLabel: boolean;
  labelPosition: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  onSelect: () => void;
  children: ReactNode;
  /** Vergrößerung beim Hovern (große Objekte wie die Tafel etwas weniger) */
  hoverScale?: number;
}

/** Macht ein 3D-Objekt klickbar: hebt es beim Hovern an und zeigt ein schwebendes Label. */
export default function Hotspot({
  label,
  hint,
  visited = false,
  showLabel,
  labelPosition,
  position,
  rotation,
  onSelect,
  children,
  hoverScale = 1.06,
}: HotspotProps) {
  const inner = useRef<Group>(null);
  const layer = useContext(LabelLayer);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    g.scale.setScalar(MathUtils.damp(g.scale.x, hovered ? hoverScale : 1, 10, dt));
    g.position.y = MathUtils.damp(g.position.y, hovered ? 0.035 : 0, 10, dt);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 10) return; // war ein Wischen, kein Tippen
    onSelect();
  };

  return (
    <group position={position} rotation={rotation}>
      <group
        ref={inner}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {children}
      </group>

      <Html position={labelPosition} center zIndexRange={[30, 10]} portal={(layer ?? undefined) as RefObject<HTMLElement> | undefined}>
        <button
          type="button"
          onClick={onSelect}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          tabIndex={showLabel ? 0 : -1}
          className={`group flex select-none items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-left shadow-lg backdrop-blur-md transition-all duration-500 ${
            showLabel ? "pointer-events-auto opacity-100" : "pointer-events-none scale-90 opacity-0"
          } ${
            hovered
              ? "border-amber-200/80 bg-amber-300/90 text-[#2b1a10]"
              : "border-white/20 bg-black/45 text-white"
          }`}
        >
          <span className="relative grid h-4 w-4 place-items-center">
            {visited ? (
              <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} />
            ) : (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-300/70" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-amber-300" />
              </>
            )}
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold">{label}</span>
            {hint && <span className="block text-[10px] opacity-75">{hint}</span>}
          </span>
        </button>
      </Html>
    </group>
  );
}
