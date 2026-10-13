import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { CAKE, SOUND, type ModalKey } from "./data";
import { duckMusic, isMuted, onMutedChange, playCheer, setMuted, startMusic, unlockAudio } from "./sound";
import Intro from "./components/Intro";
import Classroom from "./components/Classroom";
import Classroom3D, { preloadClassroomScene } from "./components/Classroom3D";
import ReportCardModal from "./components/ReportCardModal";
import PhotoGalleryModal from "./components/PhotoGalleryModal";
import VideoModal from "./components/VideoModal";
import MirrorModal, { type Selfie } from "./components/MirrorModal";
import GiftModal from "./components/GiftModal";
import BoardModal from "./components/BoardModal";
import Confetti from "./components/Confetti";
import FinaleCard from "./components/FinaleCard";

type Scene = "intro" | "classroom";

/** Diese Gegenstände muss man gesehen haben, bevor die Abschluss-Karte kommt (die Tafel ist optional) */
const ALL_KEYS: ModalKey[] = ["report", "gallery", "projector", "mirror", "gift"];
/** So lange fliegt die Kamera zum Objekt, bevor sich das Modal öffnet */
const CAMERA_FLIGHT_MS = 750;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function App() {
  const [scene, setScene] = useState<Scene>("intro");
  const [webgl] = useState(supportsWebGL);
  const [focus, setFocus] = useState<ModalKey | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [visited, setVisited] = useState<ReadonlySet<ModalKey>>(() => new Set());
  const [finaleOpen, setFinaleOpen] = useState(false);
  const [finaleSeen, setFinaleSeen] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<Selfie | null>(null);
  const [giftOpened, setGiftOpened] = useState(false);
  const [cheer, setCheer] = useState(0);
  const [muted, setMutedState] = useState(isMuted);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  // 3D-Szene schon laden, während die Tür noch zu ist
  useEffect(() => {
    if (webgl) void preloadClassroomScene();
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, [webgl]);

  // iOS gibt Audio nur nach einem Tipp frei – darum bei jeder Berührung entsperren
  useEffect(() => {
    const events = ["pointerup", "touchend", "click", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, unlockAudio, { passive: true }));
    const off = onMutedChange(setMutedState);
    return () => {
      events.forEach((e) => window.removeEventListener(e, unlockAudio));
      off();
    };
  }, []);

  // Musik leise, solange Videos laufen
  useEffect(() => duckMusic(activeModal === "projector"), [activeModal]);

  const enterClassroom = useCallback(() => {
    setScene("classroom");
    startMusic();
  }, []);

  const celebrate = useCallback(() => {
    setConfetti((c) => c + 1);
    setCheer((c) => c + 1);
    playCheer();
  }, []);

  const selectObject = useCallback(
    (key: ModalKey) => {
      if (focus || activeModal) return;
      setFocus(key);
      later(
        () => {
          setActiveModal(key);
          setVisited((prev) => new Set(prev).add(key));
        },
        webgl ? CAMERA_FLIGHT_MS : 0,
      );
    },
    [focus, activeModal, later, webgl],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setFocus(null);
    if (!finaleSeen && ALL_KEYS.every((k) => visited.has(k))) {
      setFinaleSeen(true);
      // erst jubelt die Klasse, dann kommt die Karte
      later(celebrate, 900);
      later(() => setFinaleOpen(true), 2800);
    }
  }, [finaleSeen, visited, later, celebrate]);

  const blowCandles = useCallback(() => {
    celebrate();
    setToast(CAKE.wish);
    later(() => setToast(null), 3200);
  }, [later, celebrate]);

  return (
    // reducedMotion="user": respektiert "Bewegung reduzieren" im Betriebssystem
    <MotionConfig reducedMotion="user">
      <main className="relative h-dvh w-full overflow-hidden bg-[#0b0a0f] font-sans">
        {/* Szenenwechsel: Intro zoomt durch die Tür, dahinter blendet das Klassenzimmer ein */}
        <AnimatePresence>
          {scene === "intro" && <Intro key="intro" onEnter={enterClassroom} />}
        </AnimatePresence>
        {scene === "classroom" &&
          (webgl ? (
            <Classroom3D
              focus={focus}
              visited={visited}
              modalOpen={activeModal !== null}
              onSelect={selectObject}
              onCakeBlow={blowCandles}
              selfie={selfie?.url ?? null}
              cheer={cheer}
              giftOpened={giftOpened}
            />
          ) : (
            <Classroom onOpen={selectObject} />
          ))}

        <AnimatePresence>
          {activeModal === "report" && <ReportCardModal key="report" onClose={closeModal} />}
          {activeModal === "gallery" && <PhotoGalleryModal key="gallery" onClose={closeModal} />}
          {activeModal === "projector" && <VideoModal key="projector" onClose={closeModal} />}
          {activeModal === "mirror" && (
            <MirrorModal key="mirror" selfie={selfie} onSelfie={setSelfie} onClose={closeModal} />
          )}
          {activeModal === "gift" && (
            <GiftModal
              key="gift"
              alreadyOpened={giftOpened}
              onUnwrap={() => {
                setGiftOpened(true);
                setConfetti((c) => c + 1);
              }}
              onClose={closeModal}
            />
          )}
          {activeModal === "board" && <BoardModal key="board" onClose={closeModal} />}
        </AnimatePresence>

        <AnimatePresence>{finaleOpen && <FinaleCard key="finale" onClose={() => setFinaleOpen(false)} />}</AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              key="toast"
              role="status"
              className="pointer-events-none fixed inset-x-0 top-[22%] z-[75] flex justify-center px-4"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <span className="rounded-2xl bg-black/60 px-6 py-3 font-hand text-3xl text-amber-100 shadow-2xl backdrop-blur-md">
                {toast}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Confetti burst={confetti} />

        {/* Ton an/aus */}
        {scene === "classroom" && (
          <motion.button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? SOUND.unmute : SOUND.mute}
            title={muted ? SOUND.unmute : SOUND.mute}
            className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-6 sm:top-6"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            whileTap={{ scale: 0.9 }}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </motion.button>
        )}
      </main>
    </MotionConfig>
  );
}
