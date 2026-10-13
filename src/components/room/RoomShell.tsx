import { useMemo } from "react";
import { AdditiveBlending, DoubleSide } from "three";
import { HALF_D, HALF_W, ROOM, WINDOW_ZS } from "./layout";
import { lightShaftTexture, plasterTexture, skyTexture, softSpotTexture, woodFloorTexture } from "./textures";

const WAINSCOT_H = 1.05;
const WALL_COLOR = "#e9dcc4";
const WAINSCOT_COLOR = "#6d8a74";
const TRIM_COLOR = "#4a3423";
const noCast = { noCast: true };

/** Boden, Wände, Decke, Fenster mit Lichtstrahlen und Deckenlampen */
export default function RoomShell() {
  const floor = useMemo(woodFloorTexture, []);
  const wall = useMemo(() => plasterTexture(WALL_COLOR), []);
  const wainscot = useMemo(() => plasterTexture(WAINSCOT_COLOR, [8, 1]), []);

  const walls: { pos: [number, number, number]; rotY: number; length: number }[] = [
    { pos: [0, 0, -HALF_D], rotY: 0, length: ROOM.width },
    { pos: [-HALF_W, 0, 0], rotY: Math.PI / 2, length: ROOM.depth },
    { pos: [HALF_W, 0, 0], rotY: -Math.PI / 2, length: ROOM.depth },
    { pos: [0, 0, HALF_D], rotY: Math.PI, length: ROOM.width },
  ];

  return (
    <group>
      {/* Boden */}
      <mesh rotation-x={-Math.PI / 2} userData={noCast}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial map={floor} roughness={0.62} metalness={0.05} />
      </mesh>

      {/* Decke */}
      <mesh position-y={ROOM.height} rotation-x={Math.PI / 2} userData={noCast}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#d9d1c3" roughness={1} />
      </mesh>

      {/* Wände mit Sockel-Vertäfelung und Leisten */}
      {walls.map(({ pos, rotY, length }, i) => (
        <group key={i} position={pos} rotation-y={rotY}>
          <mesh position-y={ROOM.height / 2} userData={noCast}>
            <planeGeometry args={[length, ROOM.height]} />
            <meshStandardMaterial map={wall} roughness={0.95} />
          </mesh>
          <mesh position={[0, WAINSCOT_H / 2, 0.012]} userData={noCast}>
            <planeGeometry args={[length, WAINSCOT_H]} />
            <meshStandardMaterial map={wainscot} roughness={0.8} />
          </mesh>
          <mesh position={[0, WAINSCOT_H, 0.025]} userData={noCast}>
            <boxGeometry args={[length, 0.05, 0.05]} />
            <meshStandardMaterial color={TRIM_COLOR} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.06, 0.02]} userData={noCast}>
            <boxGeometry args={[length, 0.12, 0.04]} />
            <meshStandardMaterial color={TRIM_COLOR} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {WINDOW_ZS.map((z) => (
        <Window key={z} z={z} />
      ))}

      {/* Deckenlampen */}
      {[-1.6, 1.4].map((z) => (
        <group key={z} position={[0, ROOM.height - 0.06, z]}>
          <mesh userData={noCast}>
            <boxGeometry args={[3.2, 0.06, 0.34]} />
            <meshStandardMaterial color="#cfc8bb" />
          </mesh>
          <mesh position-y={-0.032} rotation-x={Math.PI / 2} userData={noCast}>
            <planeGeometry args={[3, 0.24]} />
            <meshBasicMaterial color="#fff6e4" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Window({ z }: { z: number }) {
  const sky = useMemo(skyTexture, []);
  const shaft = useMemo(lightShaftTexture, []);
  const spot = useMemo(softSpotTexture, []);
  const w = 1.7;
  const h = 1.8;
  const y = 2.0;
  const frame = "#f1ece2";
  const bar = 0.07;

  return (
    <group>
      <group position={[-HALF_W + 0.02, y, z]} rotation-y={Math.PI / 2}>
        <mesh userData={noCast}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        {/* Rahmen & Sprossen */}
        {[
          { p: [0, h / 2, 0.03], s: [w + bar, bar, 0.08] },
          { p: [0, -h / 2, 0.03], s: [w + bar, bar, 0.08] },
          { p: [-w / 2, 0, 0.03], s: [bar, h, 0.08] },
          { p: [w / 2, 0, 0.03], s: [bar, h, 0.08] },
          { p: [0, 0, 0.03], s: [bar * 0.7, h, 0.05] },
          { p: [0, h * 0.18, 0.03], s: [w, bar * 0.7, 0.05] },
        ].map((b, i) => (
          <mesh key={i} position={b.p as [number, number, number]} userData={noCast}>
            <boxGeometry args={b.s as [number, number, number]} />
            <meshStandardMaterial color={frame} roughness={0.5} />
          </mesh>
        ))}
        {/* Fensterbank */}
        <mesh position={[0, -h / 2 - 0.05, 0.12]}>
          <boxGeometry args={[w + 0.3, 0.05, 0.26]} />
          <meshStandardMaterial color={frame} roughness={0.4} />
        </mesh>
      </group>

      {/* Gefakter Lichtstrahl und Lichtfleck auf dem Boden */}
      <mesh
        position={[-HALF_W + 1.5, 1.15, z]}
        rotation-z={-0.62}
        userData={{ noCast: true, noReceive: true }}
      >
        <planeGeometry args={[3.6, 1.5]} />
        <meshBasicMaterial
          map={shaft}
          transparent
          opacity={0.13}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-HALF_W + 2.4, 0.006, z]} rotation-x={-Math.PI / 2} userData={{ noCast: true, noReceive: true }}>
        <planeGeometry args={[2.4, 1.7]} />
        <meshBasicMaterial map={spot} transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
