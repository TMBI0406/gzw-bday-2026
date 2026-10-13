import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3, type PerspectiveCamera } from "three";
import type { ModalKey } from "../../data";
import { CAMERA_START, FOCUS_TARGETS, OVERVIEW_LOOK, OVERVIEW_POS } from "./layout";

interface CameraRigProps {
  focus: ModalKey | null;
  /** Wird beim ersten Umsehen per Wischen aufgerufen */
  onLook?: () => void;
  /** Jede neue Zahl: im Hochformat einmal zu den jubelnden Schülern schwenken */
  cheer?: number;
}

const MAX_YAW = 0.5;
const UP = new Vector3(0, 1, 0);
const tmpPos = new Vector3();
const tmpLook = new Vector3();

const smooth = (x: number) => x * x * (3 - 2 * x);

/** Kameraschwenk im Hochformat, damit man direkt sieht: Der Raum ist größer als der Bildschirm */
const TOUR_KEYS: [number, number][] = [
  [0, 0],
  [1.4, 0.4],
  [3.4, -0.4],
  [4.6, 0],
];
/** Beim Jubeln: zu beiden Schülerreihen schwenken und dort kurz verweilen */
const CHEER_KEYS: [number, number][] = [
  [0, 0],
  [0.6, 0.5],
  [1.6, 0.5],
  [2.3, -0.5],
  [3.3, -0.5],
  [4.0, 0],
];

function keyframeYaw(t: number, keys: [number, number][]) {
  if (t <= 0) return 0;
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0));
  }
  return 0;
}

function verticalFov(aspect: number) {
  if (aspect < 0.75) return 72;
  if (aspect < 1.1) return 62;
  return 50;
}

/**
 * Steuert die Kamera: Hereinfahren durch die Tür, Umsehen per Wischen/Ziehen,
 * leichte Mausparallaxe und das Heranfliegen an angeklickte Objekte.
 */
export default function CameraRig({ focus, onLook, cheer = 0 }: CameraRigProps) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  const look = useRef(OVERVIEW_LOOK.clone());
  const yaw = useRef(0);
  const targetYaw = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tour = useRef(true);
  const startTime = useRef<number | null>(null);
  const cheerSeen = useRef(cheer);
  const sweepStart = useRef<number | null>(null);
  const onLookRef = useRef(onLook);
  onLookRef.current = onLook;

  useLayoutEffect(() => {
    camera.position.copy(CAMERA_START);
    camera.lookAt(look.current);
  }, [camera]);

  // Wischen/Ziehen zum Umsehen
  useEffect(() => {
    const el = gl.domElement;
    let down = false;
    let lastX = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      down = true;
      lastX = e.clientX;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (e.pointerType === "mouse") {
        pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      }
      if (!down) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      targetYaw.current = MathUtils.clamp(targetYaw.current + dx * 0.0045, -MAX_YAW, MAX_YAW);
      if (moved > 12) {
        tour.current = false;
        onLookRef.current?.();
      }
    };
    const onUp = () => {
      down = false;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05);
    const aspect = size.width / size.height;

    const fov = verticalFov(aspect);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = MathUtils.damp(camera.fov, fov, 4, delta);
      camera.updateProjectionMatrix();
    }

    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;

    if (focus) tour.current = false;
    if (cheer !== cheerSeen.current) {
      cheerSeen.current = cheer;
      if (aspect < 0.9 && !focus) sweepStart.current = elapsed;
    }
    if (sweepStart.current !== null) {
      const e = elapsed - sweepStart.current;
      if (e < 4.0 && !focus) targetYaw.current = keyframeYaw(e, CHEER_KEYS);
      else sweepStart.current = null;
    }
    if (tour.current && aspect < 0.9) {
      targetYaw.current = keyframeYaw(elapsed - 1.6, TOUR_KEYS);
      if (elapsed > 6.5) tour.current = false;
    }
    yaw.current = MathUtils.damp(yaw.current, targetYaw.current, 4, delta);

    let lambda: number;
    if (focus) {
      // So nah heran, dass das Objekt den Bildschirm füllt
      const target = FOCUS_TARGETS[focus];
      const halfFov = MathUtils.degToRad(camera.fov / 2);
      const [w, h] = target.size;
      const dist = Math.max(h / 2 / Math.tan(halfFov), w / 2 / (Math.tan(halfFov) * aspect), 0.7) * 1.2;
      tmpPos.copy(target.center).addScaledVector(target.normal, dist);
      tmpLook.copy(target.center);
      lambda = 3;
    } else {
      const parallax = aspect >= 0.9 ? pointer.current : { x: 0, y: 0 };
      tmpPos.copy(OVERVIEW_POS);
      tmpPos.x += parallax.x * 0.25;
      tmpPos.y += parallax.y * 0.1;
      tmpLook
        .copy(OVERVIEW_LOOK)
        .sub(OVERVIEW_POS)
        .applyAxisAngle(UP, yaw.current - parallax.x * 0.06)
        .add(OVERVIEW_POS);
      tmpLook.y += parallax.y * 0.12;
      lambda = elapsed < 3 ? 1.3 : 2.4; // Hereinfahren durch die Tür etwas langsamer
    }

    camera.position.x = MathUtils.damp(camera.position.x, tmpPos.x, lambda, delta);
    camera.position.y = MathUtils.damp(camera.position.y, tmpPos.y, lambda, delta);
    camera.position.z = MathUtils.damp(camera.position.z, tmpPos.z, lambda, delta);
    look.current.x = MathUtils.damp(look.current.x, tmpLook.x, lambda * 1.2, delta);
    look.current.y = MathUtils.damp(look.current.y, tmpLook.y, lambda * 1.2, delta);
    look.current.z = MathUtils.damp(look.current.z, tmpLook.z, lambda * 1.2, delta);
    camera.lookAt(look.current);
  });

  return null;
}
