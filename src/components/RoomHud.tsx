import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ClipboardList, Gift, Hand, Images, Tv, type LucideIcon } from "lucide-react";
import { CLASSROOM, type ModalKey } from "../data";

interface RoomHudProps {
  visible: boolean;
  visited: ReadonlySet<ModalKey>;
  showDragHint: boolean;
  onSelect: (key: ModalKey) => void;
}

const ITEMS: { key: ModalKey; icon: LucideIcon }[] = [
  { key: "report", icon: ClipboardList },
  { key: "gallery", icon: Images },
  { key: "projector", icon: Tv },
  { key: "mirror", icon: Camera },
  { key: "gift", icon: Gift },
];

/** Untere Leiste: Schnellzugriff auf die Gegenstände + Fortschritt */
export default function RoomHud({ visible, visited, showDragHint, onSelect }: RoomHudProps) {
  return (
    <>
      <AnimatePresence>
        {visible && showDragHint && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-20 flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <span className="flex items-center gap-2 rounded-full bg-black/45 px-4 py-2 text-xs text-white/85 backdrop-blur-md">
              <motion.span
                animate={{ x: [-6, 6, -6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Hand className="h-4 w-4" />
              </motion.span>
              {CLASSROOM.dragHint}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.nav
            aria-label="Gegenstände im Klassenzimmer"
            className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))]"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.4 }}
          >
            <div className="flex items-stretch gap-1 rounded-2xl border border-white/10 bg-black/50 p-1.5 shadow-2xl backdrop-blur-xl">
              {ITEMS.map(({ key, icon: Icon }) => {
                const done = visited.has(key);
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => onSelect(key)}
                    className="relative flex min-w-[3.9rem] flex-col items-center gap-1 rounded-xl px-1.5 py-2 sm:min-w-[5.5rem] sm:px-3 text-white/85 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
                    whileTap={{ scale: 0.94 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] leading-none">{CLASSROOM.objects[key].label.replace(/^(Das|Die|Der) /, "")}</span>
                    {done && (
                      <motion.span
                        className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-[#0b2a1a]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
