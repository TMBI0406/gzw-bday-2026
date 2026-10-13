import { DESK_POS, DESK_TOP, HALF_W, STUDENT_DESKS } from "./layout";

type Vec3 = [number, number, number];

const WOOD = "#b98b5c";
const DARK_WOOD = "#6b4527";
const METAL = "#4f545c";

export default function Furniture() {
  return (
    <group>
      {STUDENT_DESKS.map((p, i) => (
        <StudentDesk key={i} position={p} withBooks={i % 3 === 0} />
      ))}
      <TeacherDesk />
      <Bookshelf />
    </group>
  );
}

function Box({ size, position, color, roughness = 0.7, metalness = 0 }: {
  size: Vec3;
  position: Vec3;
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function StudentDesk({ position, withBooks }: { position: Vec3; withBooks: boolean }) {
  const legs: [number, number][] = [
    [-0.5, -0.25],
    [0.5, -0.25],
    [-0.5, 0.25],
    [0.5, 0.25],
  ];
  return (
    <group position={position}>
      <Box size={[1.15, 0.04, 0.6]} position={[0, 0.72, 0]} color={WOOD} roughness={0.55} />
      {legs.map(([x, z], i) => (
        <Box key={i} size={[0.035, 0.7, 0.035]} position={[x, 0.35, z]} color={METAL} metalness={0.6} roughness={0.4} />
      ))}
      <Box size={[1.05, 0.02, 0.45]} position={[0, 0.58, -0.03]} color={METAL} metalness={0.5} roughness={0.5} />
      {withBooks && (
        <group position={[0.38, 0.74, -0.05]} rotation-y={0.3}>
          <Box size={[0.24, 0.04, 0.32]} position={[0, 0.02, 0]} color="#2f5d8a" />
          <Box size={[0.22, 0.035, 0.3]} position={[0.01, 0.058, 0]} color="#b4483c" />
        </group>
      )}
      <Chair position={[0, 0, 0.5]} />
    </group>
  );
}

function Chair({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Box size={[0.42, 0.035, 0.4]} position={[0, 0.45, 0]} color={WOOD} roughness={0.55} />
      <Box size={[0.42, 0.26, 0.025]} position={[0, 0.72, 0.19]} color={WOOD} roughness={0.55} />
      {[-0.18, 0.18].map((x) =>
        [-0.17, 0.17].map((z) => (
          <Box key={`${x}${z}`} size={[0.025, 0.45, 0.025]} position={[x, 0.225, z]} color={METAL} metalness={0.6} roughness={0.4} />
        )),
      )}
      {[-0.18, 0.18].map((x) => (
        <Box key={x} size={[0.025, 0.3, 0.025]} position={[x, 0.6, 0.19]} color={METAL} metalness={0.6} roughness={0.4} />
      ))}
    </group>
  );
}

function TeacherDesk() {
  const top = DESK_TOP;
  return (
    <group position={DESK_POS.toArray()}>
      <Box size={[2.2, 0.05, 0.95]} position={[0, top - 0.025, 0]} color={DARK_WOOD} roughness={0.45} />
      {[-0.8, 0.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Box size={[0.52, top - 0.05, 0.88]} position={[0, (top - 0.05) / 2, 0]} color={DARK_WOOD} roughness={0.55} />
          {[0.18, 0.4, 0.6].map((y) => (
            <group key={y}>
              <Box size={[0.46, 0.005, 0.01]} position={[0, y + 0.1, 0.445]} color="#2c1a0e" />
              <Box size={[0.12, 0.02, 0.03]} position={[0, y, 0.455]} color="#c9a46a" metalness={0.7} roughness={0.3} />
            </group>
          ))}
        </group>
      ))}
      {/* Sichtblende vorne */}
      <Box size={[1.08, 0.55, 0.03]} position={[0, top - 0.33, 0.3]} color={DARK_WOOD} roughness={0.55} />

      {/* Bücherstapel, Stiftebecher, Apfel */}
      <group position={[0.95, top, -0.15]}>
        <Box size={[0.3, 0.05, 0.22]} position={[0, 0.025, 0]} color="#3d6e4f" />
        <Box size={[0.28, 0.045, 0.21]} position={[0.01, 0.073, 0]} color="#a8423a" />
        <Box size={[0.26, 0.04, 0.2]} position={[-0.01, 0.115, 0]} color="#d8b04c" />
      </group>
      <group position={[-0.95, top, -0.2]}>
        <mesh position-y={0.06}>
          <cylinderGeometry args={[0.045, 0.04, 0.12, 16]} />
          <meshStandardMaterial color="#2a4f78" roughness={0.4} />
        </mesh>
        {[
          ["#e8c547", 0.01, 0.15],
          ["#d9534f", -0.015, -0.12],
          ["#4b8bd4", 0.012, 0.05],
        ].map(([c, x, r], i) => (
          <mesh key={i} position={[x as number, 0.15, 0]} rotation-z={r as number}>
            <cylinderGeometry args={[0.007, 0.007, 0.18, 6]} />
            <meshStandardMaterial color={c as string} />
          </mesh>
        ))}
      </group>
      <group position={[-1.0, top, 0.22]}>
        <mesh position-y={0.055} scale={[1, 0.92, 1]}>
          <sphereGeometry args={[0.06, 24, 16]} />
          <meshStandardMaterial color="#c0262d" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation-z={0.2}>
          <cylinderGeometry args={[0.005, 0.005, 0.04, 6]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
        <mesh position={[0.02, 0.125, 0]} rotation-z={-0.8} scale={[1, 0.4, 0.6]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color="#4c8a3a" />
        </mesh>
      </group>

      {/* Lehrerstuhl */}
      <Chair position={[0, 0, -0.75]} rotationY={Math.PI} />
    </group>
  );
}

function Bookshelf() {
  const colors = ["#2f5d8a", "#b4483c", "#d8b04c", "#3d6e4f", "#7b4b8f", "#c96b2c", "#e7e0cf"];
  const shelves = [0.35, 0.85, 1.35];
  return (
    <group position={[HALF_W - 0.2, 0, 0.7]} rotation-y={-Math.PI / 2}>
      <Box size={[2.2, 1.7, 0.36]} position={[0, 0.85, -0.02]} color={DARK_WOOD} roughness={0.6} />
      {shelves.map((y, si) => {
        let x = -1.0;
        const books = [];
        let k = 0;
        while (x < 0.95) {
          const w = 0.05 + ((si * 7 + k * 13) % 5) * 0.012;
          const h = 0.26 + ((si * 3 + k * 5) % 4) * 0.03;
          books.push(
            <Box key={k} size={[w, h, 0.24]} position={[x + w / 2, y + h / 2, 0.06]} color={colors[(si * 3 + k) % colors.length]} />,
          );
          x += w + 0.008;
          k++;
          if (k % 9 === 0) x += 0.18; // Lücke
        }
        return (
          <group key={y}>
            <Box size={[2.1, 0.03, 0.3]} position={[0, y - 0.015, 0.05]} color="#5a3920" />
            {books}
          </group>
        );
      })}
      {/* Globus */}
      <group position={[0.6, 1.72, 0.05]}>
        <mesh position-y={0.2}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshStandardMaterial color="#4f86b8" roughness={0.5} />
        </mesh>
        <mesh position-y={0.02}>
          <cylinderGeometry args={[0.07, 0.09, 0.04, 16]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position-y={0.1}>
          <cylinderGeometry args={[0.01, 0.01, 0.18, 6]} />
          <meshStandardMaterial color="#c9a46a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

