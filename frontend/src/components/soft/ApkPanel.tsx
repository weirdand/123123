import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Check } from "lucide-react";
import { Device } from "./types";

export default function ApkPanel({ devices }: { devices: Device[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const onlineIds = devices.filter(d => d.online).map(d => d.id);
    setSelected(prev => prev.size === onlineIds.length ? new Set() : new Set(onlineIds));
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass rounded-xl overflow-hidden" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
        <h2 className="font-mono text-sm md:text-base text-primary tracking-widest uppercase">Mass APK Installer</h2>
        <button onClick={selectAll} className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">
          {selected.size === devices.filter(d => d.online).length ? "DESELECT ALL" : "SELECT ALL"}
        </button>
      </div>
      <div className="p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 13rem)" }}>
          {devices.map((d) => (
            <button key={d.id} onClick={() => d.online && toggle(d.id)} disabled={!d.online} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${!d.online ? "opacity-30 cursor-not-allowed border-border" : ""} ${selected.has(d.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-muted-foreground/50 text-foreground"}`}>
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${selected.has(d.id) ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {selected.has(d.id) && <Check className="w-3 h-3 text-primary-foreground" />}
              </span>
              {d.id}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploaded(true); }} className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${isDragging ? "border-primary bg-primary/10 neon-glow-green" : "border-border hover:border-muted-foreground/50"} ${uploaded ? "border-primary bg-primary/5" : ""}`}>
            <Upload className={`w-10 h-10 ${uploaded ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-mono text-xs text-muted-foreground">{uploaded ? "instagram_v312.apk ready" : "Drop .apk file here"}</p>
          </div>
          <button disabled={selected.size === 0 || !uploaded} className={`mt-4 w-full py-2.5 rounded-lg font-mono text-xs tracking-widest uppercase transition-all ${selected.size > 0 && uploaded ? "bg-primary text-primary-foreground neon-glow-green hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
            INSTALL ON {selected.size} DEVICE{selected.size !== 1 ? "S" : ""}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
