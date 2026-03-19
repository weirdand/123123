import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Device, seededRandom } from "./types";

interface Props {
  device: Device;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  syncActive?: boolean;
}

export default function PhoneCard({ device, selected = false, onToggleSelect, syncActive = false }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(() => {
    const rng = seededRandom(parseInt(device.id.slice(1)) * 17);
    return Array.from({ length: Math.floor(rng() * 6 + 6) }, () => ({
      width: Math.floor(rng() * 60 + 30),
      height: Math.floor(rng() * 3 + 3),
    }));
  }, [device.id]);

  const isActive = selected && device.online;
  const isMasterActive = device.isMaster && selected && syncActive;

  const handleClick = useCallback(() => {
    if (!device.online) return;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setFullscreen(true);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onToggleSelect?.(device.id);
      }, 250);
    }
  }, [device.id, device.online, onToggleSelect]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: parseInt(device.id.slice(1)) * 0.03 }}
        onClick={handleClick}
        className={`relative rounded-xl overflow-hidden border transition-all duration-500 cursor-pointer select-none
          ${isMasterActive ? "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.5)] neon-glow-green" : isActive ? "border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.25)]" : "border-border hover:border-muted-foreground/30"}
          ${!selected && device.online ? "opacity-40" : ""}
          ${!device.online ? "opacity-30 cursor-default" : ""}
          bg-card`}
      >
        {isMasterActive && <motion.div className="absolute inset-0 rounded-xl border-2 border-primary/70 pointer-events-none z-10" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />}
        <div className="flex items-center justify-between px-2 py-1 bg-secondary/60">
          <div className="flex items-center gap-1.5">
            {device.online && (
              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all duration-200 ${selected ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "border-muted-foreground/50"}`}>
                {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
            )}
            <span className="text-[9px] font-mono text-muted-foreground">{device.id}</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${device.online ? "bg-primary" : "bg-destructive"}`} />
        </div>
        <div className={`px-2 py-2 space-y-1.5 min-h-[100px] md:min-h-[140px] transition-all duration-500 ${isActive && syncActive ? "bg-primary/[0.03]" : ""}`}>
          {lines.map((line, i) => (
            <div key={i} className={`rounded-sm transition-colors duration-500 ${isActive ? "bg-primary/15" : "bg-secondary/80"}`} style={{ width: `${line.width}%`, height: `${line.height}px` }} />
          ))}
        </div>
        <div className="flex items-center justify-between px-2 py-1 border-t border-border">
          <span className="text-[8px] font-mono text-muted-foreground">{device.task}</span>
          {isMasterActive && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[8px] font-mono text-primary font-bold tracking-widest animate-pulse">MASTER</motion.span>}
        </div>
        {syncActive && isActive && !isMasterActive && <motion.div className="absolute inset-0 rounded-xl pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ boxShadow: "inset 0 0 20px hsl(var(--primary) / 0.08)" }} />}
      </motion.div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md" onClick={() => setFullscreen(false)}>
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()} className="relative w-[360px] max-w-[90vw] rounded-2xl border border-primary/40 bg-card overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
              <button onClick={() => setFullscreen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/60 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${device.online ? "bg-primary animate-pulse" : "bg-destructive"}`} />
                  <span className="font-mono text-sm text-foreground">{device.id}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{device.task} · {device.fps}fps</span>
              </div>
              <div className="p-6 space-y-3 min-h-[500px] bg-background/50">
                {lines.map((line, i) => (
                  <div key={i} className="rounded bg-primary/15" style={{ width: `${line.width}%`, height: `${line.height * 2.5}px` }} />
                ))}
                <div className="pt-4 space-y-2">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={`extra-${i}`} className="rounded bg-secondary/60" style={{ width: `${40 + (i * 7) % 50}%`, height: "6px" }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/40">
                <span className="font-mono text-[10px] text-muted-foreground">Proxy: {device.proxy}</span>
                <span className="font-mono text-[10px] text-muted-foreground">Temp: {device.temp}°C</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
