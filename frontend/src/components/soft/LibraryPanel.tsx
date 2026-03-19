import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, FileCode, CheckSquare, Terminal, Zap, Settings2 } from "lucide-react";
import { Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Device } from "./types";

const scripts = [
  { name: "auto_like.py", desc: "Mass liker for feed posts", size: "2.4 KB", icon: "❤️" },
  { name: "follow_back.py", desc: "Auto follow-back new followers", size: "1.8 KB", icon: "👥" },
  { name: "scroll_feed.py", desc: "Infinite scroll with random pauses", size: "3.1 KB", icon: "📜" },
  { name: "dm_responder.py", desc: "Auto-reply to DMs with templates", size: "5.2 KB", icon: "💬" },
  { name: "story_viewer.py", desc: "Watch all stories in queue", size: "1.5 KB", icon: "👁" },
  { name: "comment_bot.py", desc: "AI-powered comment generator", size: "8.7 KB", icon: "🤖" },
];

export default function LibraryPanel({ devices }: { devices: Device[] }) {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [runningScript, setRunningScript] = useState<string | null>(null);
  const [runningDevices, setRunningDevices] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("run");
  const [config, setConfig] = useState({ delay: "", maxLikes: "", tags: "" });
  const hasCustomConfig = config.delay || config.maxLikes || config.tags;

  const onlineDevices = useMemo(() => devices.filter(d => d.online), [devices]);
  const allSelected = onlineDevices.length > 0 && onlineDevices.every(d => selectedDevices.has(d.id));

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelectedDevices(new Set());
    else setSelectedDevices(new Set(onlineDevices.map(d => d.id)));
  };

  const handleRun = () => {
    if (!selectedScript || selectedDevices.size === 0) return;
    setRunningScript(selectedScript);
    setRunningDevices(new Set(selectedDevices));
  };

  const handleStop = () => {
    setRunningScript(null);
    setRunningDevices(new Set());
  };

  const isRunning = runningScript !== null;
  const currentScriptData = scripts.find(s => s.name === selectedScript);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col lg:flex-row gap-3" style={{ minHeight: "calc(100vh - 7rem)" }}>
      {/* LEFT — Script List */}
      <div className="lg:w-[260px] glass rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-xs text-primary tracking-widest uppercase">Scripts</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 11rem)" }}>
          {scripts.map((script) => {
            const isSelected = selectedScript === script.name;
            const isActive = runningScript === script.name;
            return (
              <motion.button key={script.name} onClick={() => !isRunning && setSelectedScript(script.name)} whileTap={{ scale: 0.97 }} className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-all mb-1 ${isSelected ? "bg-primary/10 border border-primary/30 shadow-[0_0_10px_hsl(var(--primary)/0.15)]" : "hover:bg-secondary/30 border border-transparent"} ${isActive ? "ring-1 ring-primary/50" : ""} ${isRunning && !isActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                <span className="text-lg leading-none">{script.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-foreground truncate">{script.name}</p>
                    {isActive && <span className="text-[8px] font-mono text-primary animate-pulse tracking-widest">RUN</span>}
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">{script.desc}</p>
                </div>
                <span className="text-[8px] font-mono text-muted-foreground/60 whitespace-nowrap">{script.size}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CENTER — Device Grid */}
      <div className="flex-1 glass rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-primary" />
            <h2 className="font-mono text-xs text-primary tracking-widest uppercase">Target Devices</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleAll} disabled={isRunning} className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${isRunning ? "opacity-40 cursor-not-allowed" : "hover:text-accent"}`}>
              {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-accent" /> : <Square className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className={allSelected ? "text-accent" : "text-muted-foreground"}>{allSelected ? "DESELECT ALL" : "SELECT ALL"}</span>
            </button>
            <span className="font-mono text-[10px] text-muted-foreground">{selectedDevices.size}/{onlineDevices.length}</span>
          </div>
        </div>
        <div className="flex-1 p-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 11rem)" }}>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-2">
            {devices.map((d) => {
              const isDeviceSelected = selectedDevices.has(d.id);
              const isDeviceRunning = runningDevices.has(d.id);
              const num = d.id.replace("D", "");
              return (
                <motion.button key={d.id} onClick={() => d.online && !isRunning && toggleDevice(d.id)} disabled={!d.online || isRunning} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: parseInt(num) * 0.02, duration: 0.2 }} className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${!d.online ? "opacity-20 cursor-not-allowed border-border/30" : ""} ${isDeviceSelected && !isDeviceRunning ? "border-primary bg-primary/10 shadow-[0_0_14px_hsl(var(--primary)/0.25)] neon-glow-green" : ""} ${isDeviceRunning ? "border-primary bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.35)]" : ""} ${!isDeviceSelected && d.online ? "border-border hover:border-muted-foreground/40 bg-secondary/10" : ""} ${isRunning && !isDeviceRunning ? "opacity-30" : ""}`}>
                  {d.online && (
                    <span className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all duration-200 ${isDeviceSelected ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "border-muted-foreground/40"}`}>
                      {isDeviceSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </span>
                  )}
                  <span className={`font-mono text-lg md:text-xl font-bold transition-colors ${isDeviceRunning ? "text-primary" : isDeviceSelected ? "text-primary/80" : "text-muted-foreground/60"}`}>{num}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${d.online ? "bg-primary" : "bg-destructive"}`} />
                  {isDeviceRunning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-lg border border-primary/40 bg-primary/5" />
                  )}
                  {isDeviceRunning && (
                    <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-1 font-mono text-[7px] text-primary tracking-widest animate-pulse">ACTIVE</motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT — Action Panel */}
      <div className="lg:w-[260px] glass rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-secondary/40">
          <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Script</span>
          <div className="flex items-center gap-2 mt-1">
            {currentScriptData && <span className="text-base leading-none">{currentScriptData.icon}</span>}
            <p className="font-mono text-sm font-bold text-foreground truncate">{selectedScript || "—"}</p>
          </div>
          {currentScriptData && <p className="font-mono text-[9px] text-muted-foreground mt-0.5">{currentScriptData.desc}</p>}
          {hasCustomConfig && selectedScript && (
            <span className="inline-block mt-1.5 font-mono text-[8px] text-primary tracking-widest bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">CUSTOM CONFIG</span>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
          <div className="px-3 py-2 border-b border-border bg-secondary/30">
            <TabsList className="w-full bg-secondary/60 h-9">
              <TabsTrigger value="run" className="flex-1 font-mono text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
                <Zap className="w-3 h-3 mr-1.5" /> Run
              </TabsTrigger>
              <TabsTrigger value="config" className="flex-1 font-mono text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_12px_hsl(var(--primary)/0.2)]">
                <Settings2 className="w-3 h-3 mr-1.5" /> Config
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === "run" && (
                <motion.div key="run" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="flex-1 p-4 flex flex-col gap-3">
                  <div className="rounded-lg border border-border bg-secondary/20 p-3">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Targets</span>
                    <p className={`font-mono text-2xl font-bold mt-1 ${selectedDevices.size > 0 ? "text-primary" : "text-muted-foreground"}`}>{selectedDevices.size}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">device(s)</p>
                  </div>
                  <AnimatePresence>
                    {isRunning && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <span className="font-mono text-[9px] text-primary tracking-widest uppercase">Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                          <span className="font-mono text-xs text-primary font-bold">RUNNING</span>
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground mt-1">{runningScript} → {runningDevices.size} devices</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex-1" />
                  {isRunning ? (
                    <motion.button initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={handleStop} className="w-full py-4 rounded-xl font-mono text-sm tracking-[0.3em] uppercase bg-destructive/20 text-destructive border-2 border-destructive/40 hover:bg-destructive/30 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.3)] transition-all">■ STOP</motion.button>
                  ) : (
                    <motion.button initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={handleRun} disabled={!selectedScript || selectedDevices.size === 0} className={`w-full py-4 rounded-xl font-mono text-sm tracking-[0.3em] uppercase border-2 transition-all duration-300 ${selectedScript && selectedDevices.size > 0 ? "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] neon-glow-green cursor-pointer" : "bg-secondary/30 text-muted-foreground border-border cursor-not-allowed"}`}>▶ RUN</motion.button>
                  )}
                </motion.div>
              )}
              {activeTab === "config" && (
                <motion.div key="config" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex-1 p-4 flex flex-col gap-4">
                  <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">Script Parameters</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-primary tracking-widest uppercase">Delay (sec)</label>
                    <input type="number" value={config.delay} onChange={e => setConfig(c => ({ ...c, delay: e.target.value }))} placeholder="0" className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-primary tracking-widest uppercase">Max Likes</label>
                    <input type="number" value={config.maxLikes} onChange={e => setConfig(c => ({ ...c, maxLikes: e.target.value }))} placeholder="∞" className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10px] text-primary tracking-widest uppercase">Tags</label>
                    <input type="text" value={config.tags} onChange={e => setConfig(c => ({ ...c, tags: e.target.value }))} placeholder="#hashtag, #topic" className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_12px_hsl(var(--primary)/0.15)] transition-all" />
                  </div>
                  {hasCustomConfig && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 mt-auto">
                      <span className="font-mono text-[8px] text-primary tracking-widest uppercase">Active Config</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {config.delay && <span className="font-mono text-[9px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">delay: {config.delay}s</span>}
                        {config.maxLikes && <span className="font-mono text-[9px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5">max: {config.maxLikes}</span>}
                        {config.tags && <span className="font-mono text-[9px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 truncate max-w-[120px]">{config.tags}</span>}
                      </div>
                    </motion.div>
                  )}
                  <div className="flex-1" />
                  <button onClick={() => setConfig({ delay: "", maxLikes: "", tags: "" })} className="w-full py-2.5 rounded-lg font-mono text-[10px] tracking-[0.2em] uppercase border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all">Reset Config</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}
