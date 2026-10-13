import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { asset } from "../../asset";
import { STUDENT_FACES } from "../../data";
import { STUDENT_DESKS } from "./layout";
import { usePhotoTexture } from "./textures";

type Vec3 = [number, number, number];

interface Look {
  desk: number;
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  /** "short" = kurze Haare, "long" = lange Haare, "pony" = Pferdeschwanz */
  hairStyle: "short" | "long" | "pony";
  partyHat?: string;
  /** Meldet sich ab und zu */
  raisesHand?: boolean;
  phase: number;
}

const STUDENTS: Look[] = [
  { desk: 0, skin: "#e8b48f", hair: "#3b2416", shirt: "#d6336c", pants: "#2d3a55", hairStyle: "short", partyHat: "#f3a712", phase: 0 },
  { desk: 1, skin: "#a86b45", hair: "#151010", shirt: "#29a19c", pants: "#3a3a3a", hairStyle: "short", phase: 1.3 },
  { desk: 2, skin: "#f1c9a5", hair: "#c89a4b", shirt: "#4c6ef5", pants: "#2d3a55", hairStyle: "short", phase: 2.4 },
  { desk: 4, skin: "#c98a5e", hair: "#2a1a10", shirt: "#f3a712", pants: "#4a3b2c", hairStyle: "short", partyHat: "#e4572e", raisesHand: true, phase: 3.1 },
  { desk: 6, skin: "#e0a77f", hair: "#6b3a1e", shirt: "#7b4b8f", pants: "#2d3a55", hairStyle: "short", partyHat: "#29a19c", phase: 4.6 },
  { desk: 7, skin: "#8d5a3b", hair: "#120c0a", shirt: "#e4572e", pants: "#3a3a3a", hairStyle: "short", phase: 5.2 },
];

/** So lange jubeln die Schüler (Sekunden) */
const CHEER_SECONDS = 4.2;

/** Ein paar Schüler, die an ihren Tischen sitzen (mit Blick zur Tafel).
    Jede neue Zahl in `cheer` lässt alle aufspringen, sich umdrehen und jubeln. */
export default function Students({ cheer }: { cheer: number }) {
  return (
    <group>
      {STUDENTS.map((s, i) => (
        <Student key={s.desk} look={s} position={STUDENT_DESKS[s.desk]} face={STUDENT_FACES[i]} cheer={cheer} />
      ))}
    </group>
  );
}

/** Foto-Gesicht im Pappaufsteller-Look vorne auf dem Kopf */
function Face({ src }: { src: string }) {
  const photo = usePhotoTexture(asset(src), 1);
  if (!photo) return null;
  return (
    <group position-z={-0.116} rotation-y={Math.PI}>
      <mesh position-z={-0.001}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial color="#efe4cf" roughness={0.9} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.118, 32]} />
        <meshStandardMaterial map={photo} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Part({ position, size, color, rotation }: { position: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

/** Ober- und Unterarm, beide drehbar um Schulter bzw. Ellbogen */
function Arm({ side, look, upper, lower }: {
  side: -1 | 1;
  look: Look;
  upper: RefObject<Group | null>;
  lower: RefObject<Group | null>;
}) {
  return (
    <group ref={upper} position={[side * 0.19, 0.93, 0.5]} rotation-x={1.05}>
      <mesh position-y={-0.13}>
        <capsuleGeometry args={[0.045, 0.18, 4, 10]} />
        <meshStandardMaterial color={look.shirt} roughness={0.8} />
      </mesh>
      <group ref={lower} position-y={-0.26} rotation-x={0.5}>
        <mesh position-y={-0.12}>
          <capsuleGeometry args={[0.04, 0.17, 4, 10]} />
          <meshStandardMaterial color={look.shirt} roughness={0.8} />
        </mesh>
        <mesh position-y={-0.25}>
          <sphereGeometry args={[0.042, 12, 10]} />
          <meshStandardMaterial color={look.skin} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Student({ look, position, face, cheer }: { look: Look; position: Vec3; face?: string; cheer: number }) {
  const body = useRef<Group>(null);
  const cheerSeen = useRef(cheer);
  const cheerStart = useRef(-100);
  const cheerWeight = useRef(0);
  // Zum Umdrehen Richtung Kamera: links sitzende drehen sich nach rechts und umgekehrt
  const turnDir = position[0] < 0 ? -1 : 1;
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const rUpper = useRef<Group>(null);
  const rLower = useRef<Group>(null);
  const lUpper = useRef<Group>(null);
  const lLower = useRef<Group>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + look.phase;
    if (cheer !== cheerSeen.current) {
      cheerSeen.current = cheer;
      cheerStart.current = clock.elapsedTime + look.phase * 0.03; // leicht versetzt
    }
    const cheering = clock.elapsedTime - cheerStart.current;
    const active = cheering > 0 && cheering < CHEER_SECONDS;
    cheerWeight.current = MathUtils.damp(cheerWeight.current, active ? 1 : 0, active ? 7 : 3, dt);
    const w = cheerWeight.current;

    // Umdrehen & Hüpfen
    if (body.current) {
      body.current.rotation.y = turnDir * w * 1.35;
      body.current.position.y = w * Math.abs(Math.sin(t * 7.5)) * 0.06;
    }
    // Atmen & leichtes Wippen
    if (torso.current) {
      torso.current.position.y = Math.sin(t * 1.6) * 0.006;
      torso.current.rotation.z = Math.sin(t * 0.4) * 0.03;
    }
    // Kopf schaut sich um, ab und zu Richtung Tür (zur Kamera)
    if (head.current) {
      const glance = Math.max(0, Math.sin(t * 0.23) - 0.75) * 4; // 0..1
      const idleYaw = Math.sin(t * 0.5) * 0.25 + glance * (look.desk % 2 ? 1.1 : -1.1);
      head.current.rotation.y = MathUtils.lerp(idleYaw, turnDir * 0.75, w);
      head.current.rotation.x = -0.08 + Math.sin(t * 0.9) * 0.04;
    }
    // Jubeln: beide Arme hoch und winken
    if (w > 0.02) {
      for (const [upper, lower, side] of [
        [rUpper.current, rLower.current, 1],
        [lUpper.current, lLower.current, -1],
      ] as const) {
        if (!upper || !lower) continue;
        upper.rotation.x = MathUtils.lerp(1.05, Math.PI - 0.2, w);
        upper.rotation.z = side * w * (0.35 + Math.sin(t * 9 + side) * 0.25);
        lower.rotation.x = MathUtils.lerp(0.5, 0.15, w);
      }
      return;
    }
    // Melden: Arm hoch, kurz winken, wieder runter
    if (look.raisesHand && rUpper.current && rLower.current) {
      const cycle = (clock.elapsedTime % 9) / 9;
      const up = cycle > 0.45 && cycle < 0.8 ? 1 : 0;
      const target = up ? Math.PI - 0.15 : 1.05;
      rUpper.current.rotation.x += (target - rUpper.current.rotation.x) * 0.08;
      rUpper.current.rotation.z = up ? Math.sin(t * 7) * 0.12 : rUpper.current.rotation.z * 0.9;
      rLower.current.rotation.x += ((up ? 0.05 : 0.5) - rLower.current.rotation.x) * 0.08;
    }
    // Linke Hand tippt mit dem Stift
    if (lUpper.current) {
      lUpper.current.rotation.x = 1.05;
      lUpper.current.rotation.z = 0;
    }
    if (lLower.current) lLower.current.rotation.x = 0.5 + Math.max(0, Math.sin(t * 3)) * 0.06;
    if (!look.raisesHand && rUpper.current && rLower.current) {
      rUpper.current.rotation.set(1.05, 0, 0);
      rLower.current.rotation.x = 0.5;
    }
  });

  const hairCap = look.hairStyle === "short" ? 0.55 : 0.62;

  return (
    <group position={position}>
      {/* Beine (Hüfte auf dem Stuhl, Füße unterm Tisch) */}
      <Part position={[0, 0.52, 0.52]} size={[0.32, 0.12, 0.24]} color={look.pants} />
      {[-0.085, 0.085].map((x) => (
        <group key={x}>
          <Part position={[x, 0.51, 0.33]} size={[0.13, 0.11, 0.36]} color={look.pants} />
          <Part position={[x, 0.27, 0.17]} size={[0.11, 0.46, 0.11]} color={look.pants} />
          <Part position={[x, 0.04, 0.12]} size={[0.12, 0.08, 0.22]} color="#2b2b2b" />
        </group>
      ))}

      <group ref={body} position={[0, 0, 0.5]}>
      <group ref={torso} position={[0, 0, -0.5]}>
        {/* Oberkörper, leicht nach vorn gebeugt */}
        <mesh position={[0, 0.79, 0.52]} rotation-x={-0.12} scale={[1.2, 1, 0.78]}>
          <capsuleGeometry args={[0.14, 0.26, 4, 14]} />
          <meshStandardMaterial color={look.shirt} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.0, 0.5]}>
          <cylinderGeometry args={[0.045, 0.05, 0.08, 10]} />
          <meshStandardMaterial color={look.skin} roughness={0.6} />
        </mesh>

        <group ref={head} position={[0, 1.13, 0.49]}>
          <mesh>
            <sphereGeometry args={[0.115, 20, 16]} />
            <meshStandardMaterial color={look.skin} roughness={0.6} />
          </mesh>
          {/* Haare: Kappe, nach hinten gekippt */}
          <mesh rotation-x={0.55} scale={1.08}>
            <sphereGeometry args={[0.115, 20, 14, 0, Math.PI * 2, 0, Math.PI * hairCap]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
          {look.hairStyle === "long" && (
            <mesh position={[0, -0.1, 0.06]} scale={[1, 1.5, 0.6]}>
              <sphereGeometry args={[0.11, 16, 12]} />
              <meshStandardMaterial color={look.hair} roughness={0.9} />
            </mesh>
          )}
          {look.hairStyle === "pony" && (
            <mesh position={[0, -0.02, 0.15]} rotation-x={0.5} scale={[0.6, 1.4, 0.6]}>
              <sphereGeometry args={[0.06, 12, 10]} />
              <meshStandardMaterial color={look.hair} roughness={0.9} />
            </mesh>
          )}
          {face && <Face src={face} />}
          {/* Ohren */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.113, -0.01, 0]} scale={[0.4, 1, 0.7]}>
              <sphereGeometry args={[0.03, 8, 6]} />
              <meshStandardMaterial color={look.skin} roughness={0.6} />
            </mesh>
          ))}
          {look.partyHat && (
            <group position={[0.03, 0.15, 0.01]} rotation-z={-0.2}>
              <mesh>
                <coneGeometry args={[0.065, 0.17, 18]} />
                <meshStandardMaterial color={look.partyHat} roughness={0.5} />
              </mesh>
              <mesh position-y={0.09}>
                <sphereGeometry args={[0.022, 10, 8]} />
                <meshStandardMaterial color="#fff6e4" roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>

        <Arm side={1} look={look} upper={rUpper} lower={rLower} />
        <Arm side={-1} look={look} upper={lUpper} lower={lLower} />
      </group>
      </group>
    </group>
  );
}
