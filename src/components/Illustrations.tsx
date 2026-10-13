/* Reine CSS-Zeichnungen der Klassenzimmer-Objekte. */

/** A) Kladde mit Zeugnis */
export function ClipboardIllustration() {
  return (
    <div className="relative h-36 w-28 sm:h-44 sm:w-36">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#9a6638] to-[#5a3519] shadow-[0_18px_30px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,220,170,0.3)]" />
      <div className="absolute inset-x-2.5 bottom-2.5 top-6 -rotate-1 rounded-sm bg-gradient-to-b from-[#f6ebcd] to-[#e6d3a5] p-2.5 shadow-md sm:p-3">
        <div className="mx-auto mb-2 h-1.5 w-2/3 rounded bg-[#5a3e22]/70" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-2 flex items-center justify-between gap-2">
            <div className="h-1 flex-1 rounded bg-[#b9a27a]" />
            <span className="font-hand text-sm leading-none text-red-700 sm:text-base">1+</span>
          </div>
        ))}
      </div>
      {/* Metallklemme */}
      <div className="absolute left-1/2 top-0 h-7 w-14 -translate-x-1/2 -translate-y-1 rounded-md bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-600 shadow-md sm:w-16">
        <div className="mx-auto mt-1.5 h-2 w-6 rounded-full bg-zinc-700/60" />
      </div>
    </div>
  );
}

/** B) Polaroids an der Korkwand */
export function PolaroidsIllustration() {
  const cards = [
    { rotate: -12, x: "-28%", y: "6%", tint: "from-sky-300 to-indigo-500" },
    { rotate: 9, x: "26%", y: "0%", tint: "from-amber-200 to-rose-400" },
    { rotate: -2, x: "0%", y: "-14%", tint: "from-emerald-200 to-teal-500" },
  ];
  return (
    <div className="relative grid h-36 w-32 place-items-center sm:h-44 sm:w-40">
      {cards.map((c, i) => (
        <div
          key={i}
          className="absolute w-20 bg-[#fbf8f1] p-1.5 pb-5 shadow-[0_10px_20px_-6px_rgba(0,0,0,0.75)] sm:w-24"
          style={{ transform: `translate(${c.x}, ${c.y}) rotate(${c.rotate}deg)` }}
        >
          <div className={`aspect-square bg-gradient-to-br ${c.tint}`} />
          {i === cards.length - 1 && (
            <span className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-gradient-to-br from-red-400 to-red-700 shadow" />
          )}
        </div>
      ))}
    </div>
  );
}

/** C) Alter Röhrenfernseher */
export function TvIllustration() {
  return (
    <div className="relative h-36 w-36 sm:h-44 sm:w-44">
      {/* Antennen */}
      <div className="absolute left-1/2 top-1 h-10 w-0.5 origin-bottom -translate-x-1/2 -rotate-[28deg] bg-zinc-400" />
      <div className="absolute left-1/2 top-1 h-10 w-0.5 origin-bottom -translate-x-1/2 rotate-[24deg] bg-zinc-400" />
      <div className="absolute left-1/2 top-9 h-3 w-8 -translate-x-1/2 rounded-t-full bg-zinc-700" />

      {/* Gehäuse */}
      <div className="absolute inset-x-0 bottom-4 top-11 flex gap-2 rounded-2xl bg-gradient-to-br from-[#7c5434] to-[#4a2f1a] p-2.5 shadow-[0_18px_30px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,220,170,0.25)]">
        <div className="relative flex-1 overflow-hidden rounded-[40%/22%] bg-gradient-to-br from-slate-500 via-slate-700 to-slate-900 shadow-[inset_0_0_18px_rgba(0,0,0,0.8)]">
          <div className="scanlines absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(186,230,253,0.55),transparent_60%)]" />
        </div>
        <div className="flex w-5 flex-col items-center gap-2 pt-1 sm:w-6">
          <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 shadow sm:h-4 sm:w-4" />
          <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 shadow sm:h-4 sm:w-4" />
          <span className="mt-auto mb-1 flex flex-col gap-0.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block h-0.5 w-4 rounded bg-black/40" />
            ))}
          </span>
        </div>
      </div>

      {/* Füße */}
      <div className="absolute bottom-1 left-[18%] h-4 w-1.5 rotate-12 rounded-b bg-[#3a2414]" />
      <div className="absolute bottom-1 right-[18%] h-4 w-1.5 -rotate-12 rounded-b bg-[#3a2414]" />
    </div>
  );
}

/** D) Spiegel überm Waschbecken */
export function MirrorIllustration() {
  return (
    <div className="relative h-36 w-32 sm:h-44 sm:w-36">
      {/* Spiegel */}
      <div className="absolute inset-x-4 top-0 h-[62%] rounded-t-[2.5rem] rounded-b-md bg-gradient-to-br from-[#e2c48a] to-[#9a7340] p-1.5 shadow-[0_14px_24px_-10px_rgba(0,0,0,0.8)]">
        <div className="relative h-full overflow-hidden rounded-t-[2.1rem] rounded-b bg-gradient-to-br from-[#d5e1e7] via-[#93a8b2] to-[#5d6f78]">
          <div className="absolute -left-2 top-0 h-[140%] w-5 rotate-[35deg] bg-white/40 blur-[2px]" />
          <div className="absolute left-6 top-0 h-[140%] w-1.5 rotate-[35deg] bg-white/40 blur-[1px]" />
        </div>
      </div>
      {/* Waschbecken */}
      <div className="absolute inset-x-1 top-[66%] h-[14%] rounded-b-[2rem] rounded-t-md bg-gradient-to-b from-white to-stone-300 shadow-md" />
      <div className="absolute left-1/2 top-[60%] h-4 w-2 -translate-x-1/2 rounded-t bg-gradient-to-r from-zinc-300 to-zinc-500" />
      <div className="absolute left-1/2 top-[79%] h-[21%] w-6 -translate-x-1/2 rounded-b bg-gradient-to-r from-stone-200 to-stone-400" />
    </div>
  );
}

/** E) Geschenk */
export function GiftIllustration() {
  return (
    <div className="relative h-36 w-32 sm:h-44 sm:w-36">
      <div className="absolute inset-x-1 bottom-0 top-[38%] rounded-b-lg bg-gradient-to-br from-[#e64980] to-[#a61e4d] shadow-[0_18px_30px_-10px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-gradient-to-b from-[#ffd43b] to-[#f59f00]" />
      </div>
      <div className="absolute inset-x-0 top-[24%] h-[18%] rounded-md bg-gradient-to-b from-[#f06595] to-[#c2255c] shadow-md">
        <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-gradient-to-b from-[#ffe066] to-[#fab005]" />
      </div>
      <div className="absolute left-1/2 top-[8%] flex -translate-x-1/2 gap-0.5">
        <span className="block h-7 w-10 -rotate-[25deg] rounded-[50%] border-[5px] border-[#fcc419]" />
        <span className="block h-7 w-10 rotate-[25deg] rounded-[50%] border-[5px] border-[#fcc419]" />
      </div>
    </div>
  );
}

/** F) Tafel */
export function BoardIllustration() {
  return (
    <div className="relative grid h-36 w-36 place-items-center sm:h-44 sm:w-44">
      <div className="w-full rounded-md border-[7px] border-[#5b3b22] bg-[#24392d] px-2 py-5 text-center shadow-[0_18px_30px_-10px_rgba(0,0,0,0.85)]">
        <span className="font-hand text-2xl text-white/85">Hallo :)</span>
        <svg viewBox="0 0 100 20" className="mx-auto mt-1 w-3/4">
          <path d="M5 12 Q 25 2, 45 12 T 95 10" stroke="#ffe27a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
