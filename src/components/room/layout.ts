import { Vector3 } from "three";
import type { ModalKey } from "../../data";

/* Raummaße & Positionen aller wichtigen Objekte (in Metern).
   Kamera und Objekte lesen beide von hier, damit sie immer zusammenpassen. */

export const ROOM = { width: 10, depth: 10, height: 3.6 };
export const HALF_W = ROOM.width / 2;
export const HALF_D = ROOM.depth / 2;

export const DESK_POS = new Vector3(0, 0, -2.6);
export const DESK_TOP = 0.78;

export const CHALKBOARD_POS = new Vector3(0, 1.95, -HALF_D + 0.04);
export const CORKBOARD_POS = new Vector3(-3.25, 1.75, -HALF_D + 0.04);
export const REPORT_POS = new Vector3(-0.5, DESK_TOP, -2.4);
export const REPORT_TILT = -0.32;
export const REPORT_YAW = 0.12;
export const CAKE_POS = new Vector3(0.42, DESK_TOP, -2.62);
export const TV_CART_POS = new Vector3(3.05, 0, -3.2);
export const TV_CART_YAW = -0.38;
export const WINDOW_ZS = [-3, -0.4, 2.2];
/** Waschbecken mit Spiegel an der rechten Wand (Blick Richtung Raummitte = -x) */
export const SINK_POS = new Vector3(HALF_W, 0, -2.3);
export const MIRROR_Y = 1.62;
/** Geschenk auf dem Boden vorne links am Pult */
export const GIFT_POS = new Vector3(-1.5, 0, -1.8);

/** Schülertische (Stuhl jeweils 0.5 m dahinter) */
export const STUDENT_DESKS: [number, number, number][] = [
  [-1.75, 0, -0.4],
  [-3.1, 0, -0.4],
  [1.75, 0, -0.4],
  [3.1, 0, -0.4],
  [-1.75, 0, 1.25],
  [-3.1, 0, 1.25],
  [1.75, 0, 1.25],
  [3.1, 0, 1.25],
];

// Kamera
export const CAMERA_START = new Vector3(0, 1.62, 6.4); // in der Tür
export const OVERVIEW_POS = new Vector3(0, 1.75, 4.3);
export const OVERVIEW_LOOK = new Vector3(0, 1.25, -2.5);

/** Wohin die Kamera beim Anklicken fliegt: Mittelpunkt, Blickrichtung (Normale) und Größe des Objekts */
interface FocusTarget {
  center: Vector3;
  normal: Vector3;
  size: [number, number];
}

const yawed = (v: Vector3, yaw: number) => v.clone().applyAxisAngle(new Vector3(0, 1, 0), yaw);

export const FOCUS_TARGETS: Record<ModalKey, FocusTarget> = {
  report: {
    center: REPORT_POS.clone().add(new Vector3(0, 0.27, -0.08)),
    normal: yawed(new Vector3(0, Math.sin(-REPORT_TILT), Math.cos(REPORT_TILT)), REPORT_YAW).normalize(),
    size: [0.55, 0.7],
  },
  gallery: {
    center: CORKBOARD_POS.clone(),
    normal: new Vector3(0, 0, 1),
    size: [2.5, 1.7],
  },
  projector: {
    center: TV_CART_POS.clone().add(yawed(new Vector3(-0.08, 1.27, 0.33), TV_CART_YAW)),
    normal: yawed(new Vector3(0, 0, 1), TV_CART_YAW),
    size: [1.1, 0.9],
  },
  gift: {
    center: GIFT_POS.clone().add(new Vector3(0, 0.3, 0)),
    normal: new Vector3(0.15, 0.55, 1).normalize(),
    size: [0.9, 0.8],
  },
  board: {
    center: CHALKBOARD_POS.clone(),
    normal: new Vector3(0, 0, 1),
    size: [4.0, 1.7],
  },
  mirror: {
    center: new Vector3(HALF_W - 0.05, MIRROR_Y - 0.12, SINK_POS.z),
    normal: new Vector3(-1, 0, 0),
    size: [0.9, 1.25],
  },
};
