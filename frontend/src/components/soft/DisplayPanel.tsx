import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Zap, CheckSquare, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Device } from "./types";
import PhoneCard from "./PhoneCard";


interface Props {
  devices: Device[];
  syncEnabled: boolean;
  onSyncToggle: () => void;
}

export default function DisplayPanel({ devices, syncEnabled, onSyncToggle }: Props) {
  
  const [fps, setFps] = useState([30]);
  const [bitrate, setBitrate] = useState([4]);
  const [hidden, setHidden] = useState(false);

  const onlineDevices = useMemo(() => devices.filter(d => d.online), [devices]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(onlineDevices.map(d => d.id)));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = onlineDevices.every(d => selectedIds.has(d.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(onlineDevices.map(d => d.id)));
  };

  const selectedCount = onlineDevices.filter(d => selectedIds.has(d.id)).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-secondary/40">
            <h2 className="font-mono text-xs text-primary tracking-widest uppercase">Quick Stream Settings</h2>
          </div>
          <div className="p-4 flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">FPS</label>
                <span className="font-mono text-sm text-primary font-bold">{fps[0]}</span>
              </div>
              <Slider value={fps} onValueChange={setFps} min={15} max={60} step={1} className="w-full" />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-mono text-muted-foreground">15</span>
                <span className="text-[9px] font-mono text-muted-foreground">60</span>
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Bitrate (Mbps)</label>
                <span className="font-mono text-sm text-primary font-bold">{bitrate[0]}</span>
              </div>
              <Slider value={bitrate} onValueChange={setBitrate} min={1} max={16} step={1} className="w-full" />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] font-mono text-muted-foreground">1</span>
                <span className="text-[9px] font-mono text-muted-foreground">16</span>
              </div>
            </div>
            <button onClick={() => setHidden(!hidden)} className={`py-2.5 px-4 rounded-lg border flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-all whitespace-nowrap ${hidden ? "border-destructive bg-destructive/10 text-destructive" : "border-primary bg-primary/10 text-primary neon-glow-green"}`}>
              {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {hidden ? "HIDDEN" : "HIDE ALL"}
            </button>
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden min-w-[180px]">
          <div className="px-4 py-2.5 border-b border-border bg-secondary/40">
            <h2 className="font-mono text-xs text-accent tracking-widest uppercase">Master Sync</h2>
          </div>
          <div className="p-4 flex flex-col items-center justify-center gap-3">
            <button onClick={onSyncToggle} className={`relative w-20 h-10 rounded-full transition-all duration-300 border-2 ${syncEnabled ? "border-accent bg-accent/20 neon-glow-blue" : "border-border bg-secondary/50"}`}>
              <motion.div animate={{ x: syncEnabled ? 28 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1 left-1.5 w-7 h-7 rounded-full transition-colors duration-300 ${syncEnabled ? "bg-accent" : "bg-muted-foreground"}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${syncEnabled ? "text-accent animate-pulse" : "text-muted-foreground"}`} />
              <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${syncEnabled ? "text-accent" : "text-muted-foreground"}`}>{syncEnabled ? "SYNC ON" : "SYNC OFF"}</span>
            </div>
            {syncEnabled && (
              <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[9px] text-accent/80 tracking-wider">Sync Active: {selectedCount} Devices</motion.span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!hidden && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-secondary/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={toggleAll} className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors hover:text-accent">
                  {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <Square className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className={allSelected ? "text-accent" : "text-muted-foreground"}>{allSelected ? "DESELECT ALL" : "SELECT ALL"}</span>
                </button>
                <span className="font-mono text-[10px] text-muted-foreground">{selectedCount}/{onlineDevices.length} selected</span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xs text-primary tracking-widest uppercase">Live Screens — {onlineDevices.length}/{devices.length} Online</h2>
                {syncEnabled && <span className="font-mono text-[10px] text-accent animate-pulse tracking-widest">● SYNCHRONIZED</span>}
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-2 md:gap-3">
                {devices.map((d) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: parseInt(d.id.slice(1)) * 0.02, duration: 0.3 }} className={`transition-all duration-500 ${syncEnabled && selectedIds.has(d.id) ? "ring-1 ring-primary/40 rounded-xl" : ""}`}>
                    <PhoneCard device={d} selected={selectedIds.has(d.id)} onToggleSelect={toggleSelect} syncActive={syncEnabled} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
