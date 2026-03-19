import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Battery, Smartphone, Wifi } from "lucide-react";
import { Device } from "./types";

interface Props {
  device: Device;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  syncActive?: boolean;
  onTaskAssign?: (deviceId: string, task: string) => void;
}

export default function PhoneCard({ 
  device, 
  selected = false, 
  onToggleSelect, 
  syncActive = false,
  onTaskAssign 
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Генерация линий для визуализации экрана
  const lines = useMemo(() => {
    // Используем ID устройства для детерминированной генерации
    const seed = parseInt(device.id.slice(1)) || 1;
    const count = 6 + (seed % 6); // 6-12 линий
    
    return Array.from({ length: count }, (_, i) => ({
      width: 30 + ((seed * (i + 1)) % 60), // 30-90% ширины
      height: 3 + ((seed + i) % 4), // 3-6px высота
    }));
  }, [device.id]);

  // Определяем цвет задачи
  const getTaskColor = (task: string | undefined) => {
    if (!task) return "text-muted-foreground";
    switch(task.toUpperCase()) {
      case 'POST': return "text-blue-400";
      case 'FOLLOW': return "text-purple-400";
      case 'SCROLL': return "text-green-400";
      case 'IDLE': return "text-yellow-400";
      default: return "text-muted-foreground";
    }
  };

  // Иконка для задачи
  const getTaskIcon = (task: string | undefined) => {
    if (!task) return "●";
    switch(task.toUpperCase()) {
      case 'POST': return "📷";
      case 'FOLLOW': return "👥";
      case 'SCROLL': return "📱";
      case 'IDLE': return "💤";
      default: return "●";
    }
  };

  const isActive = selected && device.online;
  const isMasterActive = device.isMaster && selected && syncActive;

  const handleClick = useCallback(() => {
    if (!device.online) return;
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setFullscreen(true); // Двойной клик - полноэкранный режим
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        onToggleSelect?.(device.id); // Одиночный клик - выбор
      }, 250);
    }
  }, [device.id, device.online, onToggleSelect]);

  const handleTaskClick = (e: React.MouseEvent, task: string) => {
    e.stopPropagation();
    onTaskAssign?.(device.id, task);
    setShowTaskMenu(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: parseInt(device.id.slice(1)) * 0.03 }}
        onClick={handleClick}
        className={`relative rounded-xl overflow-hidden border transition-all duration-500 cursor-pointer select-none
          ${isMasterActive ? "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.5)] neon-glow-green" 
            : isActive ? "border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.25)]" 
            : "border-border hover:border-muted-foreground/30"}
          ${!selected && device.online ? "opacity-40" : ""}
          ${!device.online ? "opacity-30 cursor-default" : ""}
          bg-card`}
      >
        {/* Анимированная обводка для мастер-устройства */}
        {isMasterActive && (
          <motion.div 
            className="absolute inset-0 rounded-xl border-2 border-primary/70 pointer-events-none z-10" 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
          />
        )}

        {/* Верхняя панель с ID и статусом */}
        <div className="flex items-center justify-between px-2 py-1 bg-secondary/60">
          <div className="flex items-center gap-1.5">
            {device.online && (
              <div 
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all duration-200 
                  ${selected ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" : "border-muted-foreground/50"}`}
              >
                {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
            )}
            <span className="text-[9px] font-mono text-muted-foreground">{device.id}</span>
          </div>
          
          {/* Индикатор статуса и батарея */}
          <div className="flex items-center gap-1">
            {device.online && device.battery !== undefined && (
              <span className="text-[8px] font-mono text-muted-foreground flex items-center gap-0.5">
                <Battery className="w-2.5 h-2.5" />
                {device.battery}%
              </span>
            )}
            <span className={`w-2 h-2 rounded-full ${device.online ? "bg-primary animate-pulse" : "bg-destructive"}`} />
          </div>
        </div>

        {/* Основная область - симуляция экрана */}
        <div 
          className={`px-2 py-2 space-y-1.5 min-h-[100px] md:min-h-[140px] transition-all duration-500 
            ${isActive && syncActive ? "bg-primary/[0.03]" : ""}`}
          onDoubleClick={() => setFullscreen(true)}
        >
          {lines.map((line, i) => (
            <motion.div 
              key={i} 
              initial={{ width: 0 }}
              animate={{ width: `${line.width}%` }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className={`rounded-sm transition-colors duration-500 ${isActive ? "bg-primary/15" : "bg-secondary/80"}`} 
              style={{ height: `${line.height}px` }} 
            />
          ))}

          {/* Информация о модели (если есть) */}
          {device.model && (
            <div className="flex items-center gap-1 mt-2 text-[7px] font-mono text-muted-foreground">
              <Smartphone className="w-2.5 h-2.5" />
              <span className="truncate">{device.model}</span>
            </div>
          )}
        </div>

        {/* Нижняя панель с задачей */}
        <div className="flex items-center justify-between px-2 py-1 border-t border-border">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono text-muted-foreground">Task:</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (device.online) {
                  setShowTaskMenu(!showTaskMenu);
                }
              }}
              className={`text-[9px] font-mono font-bold ${getTaskColor(device.task)} hover:opacity-80 transition-opacity`}
            >
              {getTaskIcon(device.task)} {device.task || 'IDLE'}
            </button>
          </div>
          
          {isMasterActive && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-[8px] font-mono text-primary font-bold tracking-widest animate-pulse"
            >
              MASTER
            </motion.span>
          )}
        </div>

        {/* Меню выбора задачи (появляется при клике на задачу) */}
        <AnimatePresence>
          {showTaskMenu && device.online && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-1 mx-2 p-1 rounded-lg bg-popover border border-border shadow-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {['POST', 'FOLLOW', 'SCROLL', 'IDLE'].map((task) => (
                <button
                  key={task}
                  onClick={(e) => handleTaskClick(e, task)}
                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-mono hover:bg-accent transition-colors
                    ${device.task === task ? 'bg-accent/50 text-accent-foreground' : 'text-muted-foreground'}`}
                >
                  {getTaskIcon(task)} {task}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Подсветка для выбранных устройств в синхронизации */}
        {syncActive && isActive && !isMasterActive && (
          <motion.div 
            className="absolute inset-0 rounded-xl pointer-events-none" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            style={{ boxShadow: "inset 0 0 20px hsl(var(--primary) / 0.08)" }} 
          />
        )}
      </motion.div>

      {/* Полноэкранный режим */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.25 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md" 
            onClick={() => setFullscreen(false)}
          >
            <motion.div 
              initial={{ scale: 0.7, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.7, opacity: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }} 
              onClick={(e) => e.stopPropagation()} 
              className="relative w-[480px] max-w-[95vw] rounded-2xl border border-primary/40 bg-card overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
            >
              {/* Кнопка закрытия */}
              <button 
                onClick={() => setFullscreen(false)} 
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Заголовок */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/60 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${device.online ? "bg-primary animate-pulse" : "bg-destructive"}`} />
                  <span className="font-mono text-sm text-foreground">{device.id}</span>
                  {device.model && (
                    <span className="text-[10px] font-mono text-muted-foreground">({device.model})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    {device.battery ?? '?'}%
                  </span>
                  <span className={`font-mono text-[10px] ${getTaskColor(device.task)}`}>
                    {device.task || 'IDLE'}
                  </span>
                </div>
              </div>

              {/* Основной контент - большой экран */}
              <div className="p-6 space-y-3 min-h-[300px] bg-background/50">
                {lines.map((line, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ width: 0 }}
                    animate={{ width: `${line.width}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="rounded bg-primary/15" 
                    style={{ height: `${line.height * 2.5}px` }} 
                  />
                ))}
                
                {/* Дополнительные линии для имитации контента */}
                <div className="pt-4 space-y-2">
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.div 
                      key={`extra-${i}`} 
                      initial={{ width: 0 }}
                      animate={{ width: `${40 + (i * 7) % 50}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                      className="rounded bg-secondary/60" 
                      style={{ height: "6px" }} 
                    />
                  ))}
                </div>
              </div>

              {/* Нижняя панель с дополнительной информацией */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/40">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    {device.online ? 'Connected' : 'Offline'}
                  </span>
                  {device.username && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      @{device.username}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {['POST', 'FOLLOW', 'SCROLL', 'IDLE'].map((task) => (
                    <button
                      key={task}
                      onClick={() => onTaskAssign?.(device.id, task)}
                      className={`px-2 py-1 rounded text-[9px] font-mono border transition-all
                        ${device.task === task 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}