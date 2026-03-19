import {
  Package, Globe, Monitor, Usb, Library,
  BarChart3, Settings, LayoutDashboard, ShoppingBag
} from "lucide-react";
import { ActivePanel } from "./types";

const sidebarItems: { icon: typeof Package; label: string; panel: ActivePanel }[] = [
  { icon: Monitor, label: "Display", panel: "display" },
  { icon: LayoutDashboard, label: "Dashboard", panel: "dashboard" },
  { icon: Package, label: "APK", panel: "apk" },
  { icon: Globe, label: "Proxy", panel: "proxy" },
  { icon: Usb, label: "OTG", panel: "otg" },
  { icon: Library, label: "Library", panel: "library" },
  { icon: BarChart3, label: "Stats", panel: "stats" },
  { icon: ShoppingBag, label: "Shop", panel: "shop" },
  { icon: Settings, label: "Settings", panel: "settings" },
];

interface Props {
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
  syncEnabled: boolean;
  onSyncToggle: () => void;
  devices?: any[];
}

export default function SoftSidebar({ activePanel, onPanelChange }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-20 border-r border-border/50 bg-card/60 backdrop-blur-md z-30 flex flex-col items-center pt-20 gap-1">
      {sidebarItems.map((item) => {
        const isActive = activePanel === item.panel;
        return (
          <button
            key={item.label}
            onClick={() => onPanelChange(item.panel)}
            className={`flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 rounded-lg transition-all duration-200
              ${isActive
                ? "bg-primary/10 text-primary neon-glow-green"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] md:text-[10px] font-mono mt-1 tracking-wider uppercase">
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
