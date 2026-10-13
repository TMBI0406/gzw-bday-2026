import { motion } from "framer-motion";
import { REPORT_CARD } from "../data";
import ModalShell from "./ModalShell";
import Typewriter from "./Typewriter";

interface ReportCardModalProps {
  onClose: () => void;
}

const ROW_DELAY = 0.18;
const FIRST_ROW_DELAY = 0.6;
const stampSpring = { type: "spring", stiffness: 420, damping: 18 } as const;

export default function ReportCardModal({ onClose }: ReportCardModalProps) {
  const afterTableDelay = FIRST_ROW_DELAY + REPORT_CARD.subjects.length * ROW_DELAY + 0.4;

  return (
    <ModalShell label={REPORT_CARD.title} onClose={onClose} className="bg-[#1a130e]">
      <div className="flex min-h-full items-start justify-center sm:items-center sm:px-6 sm:py-12">
        <motion.article
          className="relative w-full max-w-2xl overflow-hidden px-5 pb-12 pt-16 text-[#3d2a17] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-sm sm:px-12 sm:pt-12"
          style={{
            background:
              "radial-gradient(circle at 18% 12%, rgba(150,100,40,0.20), transparent 38%), radial-gradient(circle at 88% 78%, rgba(130,80,25,0.24), transparent 42%), radial-gradient(circle at 70% 25%, rgba(255,255,240,0.35), transparent 30%), linear-gradient(170deg, #f4e6c2, #e8d29f)",
          }}
          initial={{ rotate: -2, y: 40 }}
          animate={{ rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 14 }}
        >
          <div className="bg-noise pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-3 border-2 border-double border-[#8a6a3f]/50 sm:inset-4" />

          <div className="relative">
            {/* Kopf */}
            <header className="text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">{REPORT_CARD.school}</p>
              <h2 className="mt-3 font-serif text-4xl uppercase tracking-[0.35em] sm:text-5xl">{REPORT_CARD.title}</h2>
              <p className="mt-3 font-type text-sm opacity-80">
                {REPORT_CARD.recipientPrefix}{" "}
                <span className="font-hand text-2xl text-[#1f3a6b]">{REPORT_CARD.recipient}</span>
              </p>
              <p className="font-type text-xs opacity-60">{REPORT_CARD.schoolYear}</p>
            </header>

            {/* Notentabelle */}
            <table className="mt-8 w-full border-collapse font-type text-sm sm:text-base">
              <thead>
                <tr className="border-b-2 border-[#3d2a17]/60 text-left text-xs uppercase tracking-widest opacity-70">
                  <th className="pb-2 font-normal">Fach</th>
                  <th className="pb-2 text-right font-normal">Note</th>
                </tr>
              </thead>
              <tbody>
                {REPORT_CARD.subjects.map((s, i) => (
                  <motion.tr
                    key={s.subject}
                    className="border-b border-dashed border-[#3d2a17]/30"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: FIRST_ROW_DELAY + i * ROW_DELAY, type: "spring", stiffness: 120, damping: 18 }}
                  >
                    <td className="py-3 pr-3">
                      {s.subject}
                      {s.note && <span className="block font-sans text-xs italic opacity-60">{s.note}</span>}
                    </td>
                    <td className="py-3 text-right align-middle">
                      <motion.span
                        className="inline-block font-hand text-3xl font-bold leading-none text-red-700"
                        initial={{ scale: 2.4, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -6 }}
                        transition={{ ...stampSpring, delay: FIRST_ROW_DELAY + i * ROW_DELAY + 0.15 }}
                      >
                        {s.grade}
                      </motion.span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: afterTableDelay - 0.2 }}
                >
                  <td className="pt-4 text-xs uppercase tracking-widest opacity-70">{REPORT_CARD.overallLabel}</td>
                  <td className="pt-4 text-right font-hand text-2xl font-bold text-red-700">{REPORT_CARD.overallGrade}</td>
                </motion.tr>
              </tfoot>
            </table>

            {/* Persönliche Sätze mit Schreibmaschinen-Effekt */}
            <section className="mt-10">
              <h3 className="mb-3 border-b border-[#3d2a17]/40 pb-1 text-xs uppercase tracking-widest opacity-70">
                {REPORT_CARD.remarksTitle}
              </h3>
              <Typewriter
                lines={REPORT_CARD.remarks}
                startDelay={afterTableDelay * 1000}
                skipHint={REPORT_CARD.skipHint}
                className="min-h-40 font-type text-[15px] leading-relaxed sm:text-base"
              />
            </section>

            {/* Unterschrift & Stempel */}
            <footer className="relative mt-12 flex items-end justify-between gap-4">
              <div>
                <p className="font-hand text-3xl leading-none text-[#1f3a6b]">{REPORT_CARD.signature}</p>
                <div className="mt-1 w-40 border-t border-[#3d2a17]/60 pt-1 text-[10px] uppercase tracking-widest opacity-60">
                  {REPORT_CARD.signatureLabel}
                </div>
              </div>
              <motion.div
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-[3px] border-red-700/75 p-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-red-700/80 sm:h-28 sm:w-28 sm:text-xs"
                initial={{ scale: 3, opacity: 0, rotate: 10 }}
                animate={{ scale: 1, opacity: 1, rotate: -14 }}
                transition={{ ...stampSpring, delay: afterTableDelay + 0.3 }}
              >
                <span className="rounded-full border border-red-700/50 p-2">{REPORT_CARD.stamp}</span>
              </motion.div>
            </footer>
          </div>
        </motion.article>
      </div>
    </ModalShell>
  );
}
