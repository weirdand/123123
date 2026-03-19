import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, CheckSquare, Square } from "lucide-react";
import { Device } from "./types";

export default function ProxyPanel({ devices }: { devices: Device[] }) {
  const onlineDevices = useMemo(() => devices.filter(d => d.online), [devices]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ip, setIp] = useState("");
  const [userPass, setUserPass] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = onlineDevices.length > 0 && onlineDevices.every(d => selected.has(d.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(onlineDevices.map(d => d.id)));
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="glass rounded-xl overflow-hidden" style={{ minHeight: "calc(100vh - 7rem)" }}>
      <div className="px-4 py-3 border-b border-border bg-secondary/40">
        <h2 className="font-mono text-sm md:text-base text-primary tracking-widest uppercase">Proxy Manager</h2>
      </div>
      <div className="flex flex-col lg:flex-row h-full">
        <div className="lg:w-1/2 border-r border-border overflow-y-auto" style={{ maxHeight: "calc(100vh - 11rem)" }}>
          <table className="w-full text-[10px] md:text-xs font-mono">
            <thead className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
              <tr className="text-muted-foreground border-b border-border">
                <th className="px-3 py-2 text-left w-8">
                  <button onClick={toggleAll} className="flex items-center justify-center transition-colors hover:text-accent">
                    {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <Square className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </th>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Current IP</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} onClick={() => d.online && toggle(d.id)} className={`border-b border-border/50 transition-colors cursor-pointer ${selected.has(d.id) ? "bg-primary/5" : "hover:bg-secondary/30"} ${!d.online ? "opacity-30 pointer-events-none" : ""}`}>
                  <td className="px-3 py-1.5">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${selected.has(d.id) ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "border-muted-foreground"}`}>
                      {selected.has(d.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-foreground">{d.id}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{d.proxy}</td>
                  <td className="px-3 py-1.5">
                    <span className={`${d.online ? "text-primary" : "text-destructive"}`}>●</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:w-1/2 p-4 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">IP:Port</label>
            <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="185.123.45.67:8080" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">User:Pass</label>
            <input value={userPass} onChange={(e) => setUserPass(e.target.value)} placeholder="admin:password123" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span className="text-primary font-bold">{selected.size}</span> device(s) selected
          </div>
          <button disabled={selected.size === 0 || !ip} className={`w-full py-2.5 rounded-lg font-mono text-xs tracking-widest uppercase transition-all ${selected.size > 0 && ip ? "bg-primary text-primary-foreground neon-glow-green hover:bg-primary/90" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}>
            APPLY PROXY
          </button>
        </div>
      </div>
    </motion.div>
  );
}
