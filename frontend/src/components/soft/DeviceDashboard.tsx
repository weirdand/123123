import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Zap, CheckSquare, Square } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Device } from "./types";
import PhoneCard from "./PhoneCard";

interface Props {
  devices: Device[];
  syncEnabled: boolean;
  onSyncToggle: () => void;
  onTaskAssign?: (deviceId: string, task: string) => void;
}

export default function DisplayPanel({ devices, syncEnabled, onSyncToggle, onTaskAssign }: Props) {
  const [fps, setFps] = useState([30]);
  const [bitrate, setBitrate] = useState([4]);
  const [hidden, setHidden] = useState(false);
  
  // Фильтруем только онлайн устройства
  const onlineDevices = useMemo(() => devices.filter(d => d.online), [devices]);
  
  // Состояние выбранных устройств
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => 
    new Set(onlineDevices.map(d => d.id))
  );

  // Обновляем выбранные при изменении списка онлайн устройств
  useEffect(() => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      const onlineIds = new Set(onlineDevices.map(d => d.id));
      
      prev.forEach(id => {
        if (!onlineIds.has(id)) newSet.delete(id);
      });
      
      return newSet;
    });
  }, [onlineDevices]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = onlineDevices.length > 0 && onlineDevices.every(d => selectedIds.has(d.id));
  
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(onlineDevices.map(d => d.id)));
    }
  };

  const selectedCount = onlineDevices.filter(d => selectedIds.has(d.id)).length;

  // Если нет устройств - показываем заглушку
  if (devices.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="glass rounded-xl p-8 text-center"
      >
        <h2 className="font-mono text-lg text-muted-foreground">No devices connected</h2>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Connect a device via USB and enable USB debugging
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary/10 border border-primary rounded-lg font-mono text-xs text-primary"
        >
          Retry Connection
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="space-y-4"
    >
      {/* Верхняя панель с настройками (оставляем как есть) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        {/* ... остальной код без изменений ... */}
      </div>

      <AnimatePresence>
        {!hidden && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            transition={{ duration: 0.4 }} 
            className="glass rounded-xl overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-border bg-secondary/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleAll} 
                  className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors hover:text-accent"
                  disabled={onlineDevices.length === 0}
                >
                  {allSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className={allSelected ? "text-accent" : "text-muted-foreground"}>
                    {allSelected ? "DESELECT ALL" : "SELECT ALL"}
                  </span>
                </button>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {selectedCount}/{onlineDevices.length} selected
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xs text-primary tracking-widest uppercase">
                  Live Screens — {onlineDevices.length}/{devices.length} Online
                </h2>
                {syncEnabled && (
                  <span className="font-mono text-[10px] text-accent animate-pulse tracking-widest">
                    ● SYNCHRONIZED
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-3">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-2 md:gap-3">
                {devices.map((d) => {
                  const deviceIndex = parseInt(d.id.slice(1)) || 0;
                  return (
                    <motion.div 
                      key={d.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: deviceIndex * 0.02, duration: 0.3 }} 
                      className={`transition-all duration-500 ${
                        syncEnabled && selectedIds.has(d.id) ? "ring-1 ring-primary/40 rounded-xl" : ""
                      }`}
                    >
                      <PhoneCard 
                        device={d} 
                        selected={selectedIds.has(d.id)} 
                        onToggleSelect={toggleSelect} 
                        syncActive={syncEnabled}
                        onTaskAssign={onTaskAssign}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}