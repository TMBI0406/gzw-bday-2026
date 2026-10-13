import { Suspense, lazy, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CLASSROOM, type ModalKey } from "../data";
import RoomHud from "./RoomHud";

/** Früh aufrufen (z.B. schon während des Intros), damit Three.js im Hintergrund lädt */
export const preloadClassroomScene = () => import("./room/ClassroomScene");
const ClassroomScene = lazy(preloadClassroomScene);

interface Classroom3DProps {
  focus: ModalKey | null;
  visited: ReadonlySet<ModalKey>;
  modalOpen: boolean;
  onSelect: (key: ModalKey) => void;
  onCakeBlow: () => void;
  selfie: string | null;
  cheer: number;
  giftOpened: boolean;
}

const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function Classroom3D({ focus, visited, modalOpen, onSelect, onCakeBlow, selfie, cheer, giftOpened }: Classroom3DProps) {
  const [hasLooked, setHasLooked] = useState(false);
  const labelLayer = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      className="fixed inset-0 isolate bg-[#120e0c]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: 0.45, ease: "easeOut" }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <ClassroomScene
          focus={focus}
          visited={visited}
          paused={modalOpen}
          onSelect={onSelect}
          onCakeBlow={onCakeBlow}
          selfie={selfie}
          cheer={cheer}
          giftOpened={giftOpened}
          labelLayer={labelLayer}
          onLook={() => setHasLooked(true)}
        />
      </Suspense>

      {/* Vignette für mehr Tiefe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />

      {/* Ebene für die schwebenden Labels der Gegenstände */}
      <div ref={labelLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />

      <RoomHud
        visible={focus === null && !modalOpen}
        visited={visited}
        showDragHint={isTouch && !hasLooked}
        onSelect={onSelect}
      />
    </motion.section>
  );
}

function LoadingScreen() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-4 text-stone-300">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-amber-200/30 border-t-amber-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm">{CLASSROOM.loading}</p>
      </div>
    </div>
  );
}
