import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, type Group } from "three";
import { CHALKBOARD_POS, DESK_POS, DESK_TOP, HALF_D, HALF_W } from "./layout";

const PARTY_COLORS = ["#e4572e", "#f3a712", "#29a19c", "#4c6ef5", "#d6336c", "#a9e34b"];

/** Wimpelkette, Luftballons, Wanduhr und Pflanze */
export default function Decorations() {
  return (
    <group>
      <Bunting />
      <Balloons />
      <WallClock />
      <Plant />
    </group>
  );
}

function Bunting() {
  const group = useRef<Group>(null);
  const flagGeo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute([-0.11, 0, 0, 0.11, 0, 0, 0, -0.24, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);

  const count = 15;
  const startX = -2.3;
  const endX = 2.3;
  const y = CHALKBOARD_POS.y + 1.08;
  const sag = 0.2;
  const points = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const t = i / 23;
        return [startX + (endX - startX) * t, y - Math.sin(Math.PI * t) * sag, 0] as [number, number, number];
      }),
    [y],
  );

  useFrame(({ clock }) => {
    group.current?.children.forEach((child, i) => {
      if (i === 0) return; // die Schnur
      child.rotation.x = Math.sin(clock.elapsedTime * 1.4 + i * 0.7) * 0.12;
    });
  });

  return (
    <group ref={group} position={[0, 0, -HALF_D + 0.12]}>
      <Line points={points} color="#e8e1d2" lineWidth={1.5} />
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        return (
          <mesh
            key={i}
            geometry={flagGeo}
            position={[startX + (endX - startX) * t, y - Math.sin(Math.PI * t) * sag, 0]}
          >
            <meshStandardMaterial color={PARTY_COLORS[i % PARTY_COLORS.length]} side={DoubleSide} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function Balloons() {
  const anchor: [number, number, number] = [DESK_POS.x + 1.05, DESK_TOP, DESK_POS.z + 0.2];
  const balloons = [
    { color: "#e4572e", offset: [-0.18, 1.05, 0.05], phase: 0 },
    { color: "#f3a712", offset: [0.12, 1.22, -0.08], phase: 1.7 },
    { color: "#4c6ef5", offset: [0.22, 0.95, 0.12], phase: 3.1 },
    { color: "#d6336c", offset: [-0.02, 1.38, 0.1], phase: 4.4 },
  ] as const;

  return (
    <group position={anchor}>
      {/* Gewicht */}
      <mesh position-y={0.03}>
        <cylinderGeometry args={[0.035, 0.045, 0.06, 12]} />
        <meshStandardMaterial color="#c9a46a" metalness={0.6} roughness={0.3} />
      </mesh>
      {balloons.map((b, i) => (
        <Balloon key={i} color={b.color} offset={b.offset as unknown as [number, number, number]} phase={b.phase} />
      ))}
    </group>
  );
}

function Balloon({ color, offset, phase }: { color: string; offset: [number, number, number]; phase: number }) {
  const pivot = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (!pivot.current) return;
    pivot.current.rotation.z = Math.sin(t * 0.7) * 0.06;
    pivot.current.rotation.x = Math.cos(t * 0.55) * 0.05;
  });
  return (
    <group ref={pivot} position-y={0.06}>
      <Line points={[[0, 0, 0], offset]} color="#f2efe8" lineWidth={1} />
      <group position={offset}>
        <mesh position-y={0.24} scale={[1, 1.18, 1]}>
          <sphereGeometry args={[0.2, 32, 24]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
        </mesh>
        <mesh position-y={0.015}>
          <coneGeometry args={[0.025, 0.04, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function WallClock() {
  const hour = useRef<Group>(null);
  const minute = useRef<Group>(null);
  const second = useRef<Group>(null);

  useFrame(() => {
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });

  const hand = (len: number, width: number, color: string, ref: RefObject<Group | null>, z: number) => (
    <group ref={ref} position-z={z}>
      <mesh position-y={len / 2 - 0.03}>
        <boxGeometry args={[width, len, 0.006]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );

  return (
    <group position={[2.75, 2.85, -HALF_D + 0.04]}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 48]} />
        <meshStandardMaterial color="#262626" roughness={0.4} />
      </mesh>
      <mesh position-z={0.026}>
        <circleGeometry args={[0.27, 48]} />
        <meshStandardMaterial color="#f7f4ec" roughness={0.8} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.23, Math.cos(a) * 0.23, 0.03]} rotation-z={-a}>
            <boxGeometry args={[i % 3 === 0 ? 0.018 : 0.008, 0.05, 0.004]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        );
      })}
      {/* Zeiger drehen sich um ihr unteres Ende */}
      <group position-z={0.035}>
        {hand(0.14, 0.018, "#1a1a1a", hour, 0)}
        {hand(0.2, 0.012, "#1a1a1a", minute, 0.004)}
        {hand(0.22, 0.005, "#c92a2a", second, 0.008)}
      </group>
      <mesh position-z={0.05}>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial color="#c92a2a" />
      </mesh>
    </group>
  );
}

function Plant() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const r = i % 2 ? 0.16 : 0.08;
        return {
          pos: [Math.cos(a) * r, 0.62 + (i % 3) * 0.12, Math.sin(a) * r] as [number, number, number],
          scale: 0.16 + (i % 4) * 0.03,
        };
      }),
    [],
  );
  return (
    <group position={[HALF_W - 0.55, 0, -HALF_D + 0.55]}>
      <mesh position-y={0.2}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 20]} />
        <meshStandardMaterial color="#b5653a" roughness={0.8} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.pos} scale={l.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#3f7d4a" : "#2f6b3c"} flatShading roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
