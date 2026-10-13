import { createContext, type RefObject } from "react";

/** Fester DOM-Container für alle schwebenden Labels.
    Ohne ihn verliert drei/Html beim Start das erste Label (der Standard-Container wechselt beim Mounten). */
export const LabelLayer = createContext<RefObject<HTMLDivElement | null> | null>(null);
