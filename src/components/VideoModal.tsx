import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Film, Play } from "lucide-react";
import { asset } from "../asset";
import { PROJECTOR, VIDEOS } from "../data";
import ModalShell from "./ModalShell";

interface VideoModalProps {
  onClose: () => void;
}

export default function VideoModal({ onClose }: VideoModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  const video = VIDEOS[activeIdx];
  const failed = video ? failedIds.has(video.id) : true;

  const markFailed = (id: string) => setFailedIds((prev) => new Set(prev).add(id));

  return (
    <ModalShell label={PROJECTOR.title} onClose={onClose} className="bg-[#08080b]">
      {/* Lichtkegel des Projektors */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background: "radial-gradient(ellipse 45% 70% at 50% 0%, rgba(186,230,253,0.16), transparent 70%)",
        }}
      />

      <div className="relative flex min-h-full flex-col items-center justify-center px-4 pb-10 pt-20 sm:px-8">
        <motion.header
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-serif text-3xl text-stone-100 sm:text-4xl">{PROJECTOR.title}</h2>
          <p className="mt-1 text-sm text-stone-400">{PROJECTOR.subline}</p>
        </motion.header>

        {/* Fernsehgehäuse */}
        <motion.div
          className="w-full max-w-3xl rounded-[1.75rem] bg-gradient-to-br from-[#7c5434] to-[#3f2715] p-3 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,220,170,0.25)] sm:p-5"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.15 }}
        >
          <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-black shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
            {/* "Einschalten"-Effekt: Lichtstreifen, der sich aufzieht */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-white"
              initial={{ scaleY: 0.005, scaleX: 0.6, opacity: 1 }}
              animate={{ scaleY: [0.005, 0.005, 1], scaleX: [0.6, 1, 1], opacity: [1, 1, 0] }}
              transition={{ duration: 0.9, times: [0, 0.35, 1], ease: "easeOut", delay: 0.4 }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={video?.id ?? "none"}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {video && !failed ? (
                  <video
                    className="h-full w-full object-contain"
                    src={video.poster ? asset(video.src) : `${asset(video.src)}#t=0.001`}
                    poster={video.poster && asset(video.poster)}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => markFailed(video.id)}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-center">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <Film className="h-10 w-10 text-sky-200/80" />
                    </motion.div>
                    <p className="font-type text-sm text-sky-100 sm:text-base">{PROJECTOR.missingVideo}</p>
                    <p className="text-xs text-sky-100/50">{PROJECTOR.missingVideoHint}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-40" />
          </div>
        </motion.div>

        {/* Kanalwahl */}
        {VIDEOS.length > 1 && (
          <div className="mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-3">
            {VIDEOS.map((v, i) => {
              const active = i === activeIdx;
              return (
                <motion.button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 ${
                    active ? "text-[#1a130e]" : "bg-white/5 text-stone-300 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.span
                      layoutId="active-channel"
                      className="absolute inset-0 rounded-full bg-amber-300"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                  <Play className="relative h-3.5 w-3.5" />
                  <span className="relative">
                    Kanal {i + 1}: {v.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
