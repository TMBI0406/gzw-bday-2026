import { useEffect, useMemo, useState, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { ACESFilmicToneMapping, Object3D, type Mesh } from "three";
import type { ModalKey } from "../../data";
import CameraRig from "./CameraRig";
import Cake from "./Cake";
import Chalkboard from "./Chalkboard";
import CorkBoardObject from "./CorkBoardObject";
import Decorations from "./Decorations";
import Furniture from "./Furniture";
import GiftObject from "./GiftObject";
import ReportCardObject from "./ReportCardObject";
import RoomShell from "./RoomShell";
import SinkMirror from "./SinkMirror";
import Students from "./Students";
import TvObject from "./TvObject";
import { CAMERA_START, DESK_POS, HALF_W } from "./layout";
import { LabelLayer } from "./labelLayer";

export interface ClassroomSceneProps {
  focus: ModalKey | null;
  visited: ReadonlySet<ModalKey>;
  /** Rendering anhalten (z.B. während ein Modal den Raum verdeckt) */
  paused: boolean;
  onSelect: (key: ModalKey) => void;
  onCakeBlow: () => void;
  onLook?: () => void;
  /** Selfie für den Spiegel */
  selfie: string | null;
  /** Jede neue Zahl lässt die Schüler jubeln */
  cheer: number;
  giftOpened: boolean;
  /** DOM-Ebene über dem Canvas für die Labels */
  labelLayer: RefObject<HTMLDivElement | null>;
}

/** Das 3D-Klassenzimmer */
export default function ClassroomScene({ focus, visited, paused, onSelect, onCakeBlow, onLook, selfie, cheer, giftOpened, labelLayer }: ClassroomSceneProps) {
  // Auf Touch-Geräten ohne Schatten und mit geringerer Auflösung → flüssig auch auf älteren Handys
  const lowPower = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  const showLabels = focus === null;

  return (
    <Canvas
      shadows={!lowPower}
      dpr={[1, lowPower ? 1.75 : 2]}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: 55, near: 0.05, far: 40, position: CAMERA_START.toArray() }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ touchAction: "none" }}
    >
      <LabelLayer.Provider value={labelLayer}>
      <color attach="background" args={["#120e0c"]} />
      <fog attach="fog" args={["#1c1511", 11, 24]} />

      <Lights shadows={!lowPower} />
      <RoomShell />
      <Furniture />
      <Students cheer={cheer} />
      <Decorations />

      <ReportCardObject visited={visited.has("report")} showLabel={showLabels} onSelect={() => onSelect("report")} />
      <CorkBoardObject visited={visited.has("gallery")} showLabel={showLabels} onSelect={() => onSelect("gallery")} />
      <TvObject visited={visited.has("projector")} showLabel={showLabels} onSelect={() => onSelect("projector")} />
      <SinkMirror
        visited={visited.has("mirror")}
        showLabel={showLabels}
        selfie={selfie}
        onSelect={() => onSelect("mirror")}
      />
      <Chalkboard showLabel={showLabels} onSelect={() => onSelect("board")} />
      <GiftObject opened={giftOpened} showLabel={showLabels} onSelect={() => onSelect("gift")} />
      <Cake showLabel={showLabels} onBlow={onCakeBlow} />

      {/* Staub im Fensterlicht */}
      <Sparkles
        count={lowPower ? 50 : 90}
        scale={[3.2, 2.6, 8]}
        position={[-HALF_W + 2, 1.5, 0]}
        size={2.2}
        speed={0.18}
        opacity={0.55}
        color="#ffe7c2"
        noise={0.6}
      />

      <CameraRig focus={focus} onLook={onLook} />
      {!lowPower && <ShadowSetup />}
      </LabelLayer.Provider>
    </Canvas>
  );
}

function Lights({ shadows }: { shadows: boolean }) {
  const [spotTarget] = useState(() => new Object3D());
  return (
    <>
      <primitive object={spotTarget} position={[0, 1, DESK_POS.z - 1.6]} />
      <ambientLight intensity={0.35} color="#ffe8d0" />
      <hemisphereLight args={["#fff1dc", "#3b2a1f", 0.7]} />
      {/* Sonne durch die Fenster */}
      <directionalLight
        position={[-9, 6.5, 0.5]}
        intensity={2.4}
        color="#ffd9a3"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      {/* Deckenlampen */}
      <pointLight position={[0, 3.3, -1.6]} intensity={9} distance={9} decay={1.6} color="#fff1dd" />
      <pointLight position={[0, 3.3, 1.4]} intensity={6} distance={8} decay={1.6} color="#fff1dd" />
      {/* Akzent auf Pult & Tafel */}
      <spotLight
        position={[0, 3.4, DESK_POS.z + 2.4]}
        angle={0.6}
        penumbra={0.8}
        intensity={14}
        distance={10}
        decay={1.6}
        color="#ffe2b8"
        target={spotTarget}
      />
    </>
  );
}

/** Aktiviert Schatten für alle Meshes – außer Wänden & Lichteffekten (userData.noCast/noReceive). */
function ShadowSetup() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = !mesh.userData.noCast;
      mesh.receiveShadow = !mesh.userData.noReceive;
    });
  }, [scene]);
  return null;
}
