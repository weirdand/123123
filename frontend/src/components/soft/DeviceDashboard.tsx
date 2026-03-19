import { motion } from "framer-motion";
import { Device } from "./types";

export default function DeviceDashboard({ devices }: { devices: Device[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-xl overflow-hidden"
      style={{ minHeight: "calc(100vh - 7rem)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/40 border-b border-border">
        <h2 className="font-mono text-sm md:text-base text-primary tracking-widest uppercase">Device Dashboard</h2>
        <span className="font-mono text-xs text-foreground">
          {devices.filter((d) => d.online).length} / {devices.length}
        </span>
      </div>
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 11rem)" }}>
        <table className="w-full text-[10px] md:text-xs font-mono">
          <thead className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
            <tr className="text-muted-foreground border-b border-border">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">Proxy</th>
              <th className="px-3 py-2 text-left">FPS</th>
              <th className="px-3 py-2 text-left hidden sm:table-cell">Temp</th>
              <th className="px-3 py-2 text-left hidden sm:table-cell">Uptime</th>
              <th className="px-3 py-2 text-left">Task</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-1.5 text-foreground">{d.id}</td>
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${d.online ? "bg-primary" : "bg-destructive"}`} />
                    <span className={d.online ? "text-primary" : "text-destructive"}>
                      {d.online ? "ONLINE" : "OFF"}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-1.5 text-muted-foreground hidden md:table-cell">{d.proxy}</td>
                <td className="px-3 py-1.5 text-foreground">{d.online ? d.fps : "—"}</td>
                <td className="px-3 py-1.5 text-foreground hidden sm:table-cell">{d.online ? `${d.temp}°C` : "—"}</td>
                <td className="px-3 py-1.5 text-foreground hidden sm:table-cell">{d.uptime}</td>
                <td className={`px-3 py-1.5 ${d.online ? "text-accent" : "text-muted-foreground"}`}>{d.task}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
