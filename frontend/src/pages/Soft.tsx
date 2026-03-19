import { useState, useMemo } from "react";
import { generateDevices, ActivePanel } from "@/components/soft/types";
import SoftSidebar from "@/components/soft/SoftSidebar";

import DeviceDashboard from "@/components/soft/DeviceDashboard";
import StatisticsPanel from "@/components/soft/StatisticsPanel";
import ApkPanel from "@/components/soft/ApkPanel";
import ProxyPanel from "@/components/soft/ProxyPanel";
import DisplayPanel from "@/components/soft/DisplayPanel";
import OtgPanel from "@/components/soft/OtgPanel";
import LibraryPanel from "@/components/soft/LibraryPanel";
import ShopPanel from "@/components/soft/ShopPanel";
import SettingsPanel from "@/components/soft/SettingsPanel";

const Soft = () => {
  const devices = useMemo(generateDevices, []);
  const onlineCount = devices.filter((d) => d.online).length;
  const offlineCount = devices.length - onlineCount;
  const [activePanel, setActivePanel] = useState<ActivePanel>("dashboard");
  const [syncEnabled, setSyncEnabled] = useState(false);

  const renderPanel = () => {
    switch (activePanel) {
      case "apk": return <ApkPanel devices={devices} />;
      case "proxy": return <ProxyPanel devices={devices} />;
      case "display": return <DisplayPanel devices={devices} syncEnabled={syncEnabled} onSyncToggle={() => setSyncEnabled(!syncEnabled)} />;
      case "otg": return <OtgPanel />;
      case "library": return <LibraryPanel devices={devices} />;
      case "stats": return <StatisticsPanel />;
      case "dashboard": return <DeviceDashboard devices={devices} />;
      case "shop": return <ShopPanel />;
      case "settings": return <SettingsPanel />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <header className="fixed top-0 left-16 md:left-20 right-0 h-14 border-b border-border/50 bg-card/60 backdrop-blur-md z-20 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <span className="text-2xl font-black tracking-tight text-foreground">Ferma</span>
          <span className="text-2xl font-black tracking-tight text-gradient-neon">Zak</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {syncEnabled && <span className="font-mono text-[10px] text-accent animate-pulse">SYNC ACTIVE</span>}
        </div>
      </header>

      <SoftSidebar
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        syncEnabled={syncEnabled}
        onSyncToggle={() => setSyncEnabled(!syncEnabled)}
      />

      <main className="pl-16 md:pl-20 pt-14">
        <div className="p-3 md:p-6">
          {renderPanel()}
        </div>
      </main>

      <footer className="fixed bottom-0 left-16 md:left-20 right-0 h-10 border-t border-border/50 bg-card/60 backdrop-blur-md z-20 flex items-center justify-between px-4 md:px-6">
        <span className="font-mono text-[10px] text-muted-foreground">FERMAZAK CONTROL v1</span>
        <span className="font-mono text-[10px] text-primary/80">
          {onlineCount} ONLINE · {offlineCount} OFFLINE · {syncEnabled ? "SYNC ACTIVE" : "SYNC OFF"}
        </span>
      </footer>
    </div>
  );
};

export default Soft;
