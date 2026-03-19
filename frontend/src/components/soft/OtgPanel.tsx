import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Usb, RotateCw, Zap, HardDrive, Search, Wifi } from "lucide-react";
import { seededRandom } from "./types";

interface UsbPort {
  id: number;
  device: string;
  active: boolean;
}

function generatePorts(): UsbPort[] {
  const rng = seededRandom(77);
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    device: `D${String(Math.floor(rng() * 20) + 1).padStart(2, "0")}`,
    active: rng() > 0.25,
  }));
}

export default function OtgPanel() {
  const [ports] = useState(generatePorts);
  const [chargeMode, setChargeMode] = useState(false);
  const [ipStart, setIpStart] = useState("192.168.1.1");
  const [port, setPort] = useState("8080");
  const [ipEnd, setIpEnd] = useState("192.168.1.254");
  const [scanning, setScanning] = useState(false);

  const activeCount = ports.filter(p => p.active).length;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass rounded-xl overflow-hidden" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Usb className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-sm md:text-base text-primary tracking-widest uppercase">USB Port & Network Scanner</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-primary/70">{activeCount}/20 ACTIVE</span>
          <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-primary animate-pulse" : "bg-destructive"}`} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Wifi className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-[10px] text-accent tracking-widest uppercase">Network Scanner</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="font-mono text-[9px] text-muted-foreground mb-1 block">IP RANGE START</label>
              <input value={ipStart} onChange={e => setIpStart(e.target.value)} className="w-full bg-background/80 border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <div className="flex-1">
              <label className="font-mono text-[9px] text-muted-foreground mb-1 block">IP RANGE END</label>
              <input value={ipEnd} onChange={e => setIpEnd(e.target.value)} className="w-full bg-background/80 border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <div className="w-24">
              <label className="font-mono text-[9px] text-muted-foreground mb-1 block">PORT</label>
              <input value={port} onChange={e => setPort(e.target.value)} placeholder="8080" className="w-full bg-background/80 border border-border rounded-md px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
            <div className="flex items-end">
              <button onClick={handleScan} disabled={scanning} className={`relative px-4 py-2 rounded-md font-mono text-xs tracking-wider transition-all bg-background/80 border text-accent hover:bg-accent/10 ${scanning ? "border-accent shadow-[0_0_12px_hsl(var(--accent)/0.4)] animate-pulse" : "border-accent/50 hover:border-accent hover:shadow-[0_0_8px_hsl(var(--accent)/0.3)]"}`}>
                <Search className="w-3.5 h-3.5 inline mr-1.5" />
                {scanning ? "SCANNING..." : "SCAN"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Hub Mode</span>
          <button onClick={() => setChargeMode(!chargeMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[10px] tracking-wider border transition-all ${chargeMode ? "bg-[hsl(35,90%,55%)]/10 text-[hsl(35,90%,55%)] border-[hsl(35,90%,55%)]/30 shadow-[0_0_10px_hsl(35,90%,55%,0.2)]" : "bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.2)]"}`}>
            {chargeMode ? <Zap className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
            {chargeMode ? "CHARGE MODE" : "DATA MODE"}
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2">
          <AnimatePresence mode="wait">
            {ports.map((p) => {
              const isActive = p.active;
              return (
                <motion.div key={`${p.id}-${chargeMode}`} initial={{ opacity: 0.5, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: p.id * 0.02 }} className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-default ${isActive ? chargeMode ? "border-[hsl(35,90%,55%)]/40 bg-[hsl(35,90%,55%)]/5 shadow-[0_0_12px_hsl(35,90%,55%,0.15)]" : "border-primary/40 bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.15)]" : "border-border/30 bg-secondary/10 opacity-40"}`}>
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-sm border-2 flex items-center justify-center transition-all ${isActive ? chargeMode ? "border-[hsl(35,90%,55%)]/60" : "border-primary/60" : "border-border/40"}`}>
                    <Usb className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isActive ? chargeMode ? "text-[hsl(35,90%,55%)]" : "text-primary" : "text-muted-foreground/40"}`} />
                  </div>
                  <span className={`font-mono text-[8px] md:text-[9px] tracking-wider ${isActive ? chargeMode ? "text-[hsl(35,90%,55%)]/80" : "text-primary/80" : "text-muted-foreground/40"}`}>PORT {String(p.id).padStart(2, "0")}</span>
                  <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${isActive ? chargeMode ? "bg-[hsl(35,90%,55%)] shadow-[0_0_6px_hsl(35,90%,55%,0.6)]" : "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "bg-muted-foreground/30"}`} />
                  {isActive && <span className="font-mono text-[7px] text-muted-foreground">{p.device}</span>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-end pt-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md font-mono text-[10px] tracking-wider border border-destructive/40 text-destructive/80 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/60 hover:text-destructive hover:shadow-[0_0_10px_hsl(var(--destructive)/0.2)] transition-all">
            <RotateCw className="w-3.5 h-3.5" />
            REBOOT ALL
          </button>
        </div>
      </div>
    </motion.div>
  );
}
