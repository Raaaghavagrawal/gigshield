import { motion } from "framer-motion";
import { Bike, MapPin } from "lucide-react";

const riders = [
  { id: "a", x: ["8%", "42%", "68%", "28%", "8%"], y: ["72%", "48%", "22%", "58%", "72%"], duration: 14, delay: 0 },
  { id: "b", x: ["55%", "78%", "52%", "18%", "55%"], y: ["18%", "42%", "68%", "38%", "18%"], duration: 11, delay: 1.2 },
  { id: "c", x: ["22%", "12%", "45%", "62%", "22%"], y: ["28%", "62%", "78%", "42%", "28%"], duration: 16, delay: 2.4 },
];

const heatZones = [
  { left: "12%", top: "55%", w: "38%", h: "42%", color: "bg-fuchsia-500/25", blur: "blur-[56px]", dur: 5 },
  { left: "48%", top: "12%", w: "40%", h: "38%", color: "bg-cyan-500/20", blur: "blur-[48px]", dur: 6.5 },
  { left: "58%", top: "48%", w: "35%", h: "45%", color: "bg-amber-500/15", blur: "blur-[52px]", dur: 7.2 },
];

export default function LiveTacticalMap({ cityLabel }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#030712] shadow-[0_0_40px_-12px_rgba(34,211,238,0.25)] ring-1 ring-white/5">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {heatZones.map((z, i) => (
        <motion.div
          key={i}
          className={`pointer-events-none absolute rounded-full ${z.color} ${z.blur}`}
          style={{ left: z.left, top: z.top, width: z.w, height: z.h }}
          animate={{ opacity: [0.35, 0.75, 0.4, 0.65, 0.35], scale: [1, 1.08, 0.95, 1.05, 1] }}
          transition={{ duration: z.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200/90 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
        </span>
        Live fleet · {cityLabel || "Metro"}
      </div>

      <div className="relative aspect-[16/10] min-h-[200px] w-full sm:aspect-[16/9] sm:min-h-[240px]">
        <motion.div
          className="absolute left-[46%] top-[40%] z-[5] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-cyan-400/80 bg-cyan-500/20 shadow-[0_0_24px_rgba(34,211,238,0.5)]"
          animate={{ scale: [1, 1.12, 1], boxShadow: ["0 0 20px rgba(34,211,238,0.4)", "0 0 32px rgba(34,211,238,0.65)", "0 0 20px rgba(34,211,238,0.4)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MapPin className="h-4 w-4 text-cyan-100" strokeWidth={2.5} />
        </motion.div>

        {riders.map((r) => (
          <motion.div
            key={r.id}
            className="absolute z-[4] flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-900/90 text-cyan-300 shadow-lg shadow-cyan-500/20"
            initial={{ left: r.x[0], top: r.y[0] }}
            animate={{ left: r.x, top: r.y }}
            transition={{ duration: r.duration, repeat: Infinity, ease: "linear", repeatDelay: 0, delay: r.delay }}
          >
            <Bike size={16} strokeWidth={2.2} />
          </motion.div>
        ))}
      </div>

      <p className="border-t border-white/5 bg-black/40 px-3 py-2 text-center text-[10px] text-slate-500">
        Tactical layer: simulated riders + demand heat · pairs with GPS tile below
      </p>
    </div>
  );
}
