import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Heart, Users, RefreshCw, ExternalLink, Plus, X, Check } from "lucide-react";
import { seededRandom } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


// Platform SVG icons
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.51V7.12a4.83 4.83 0 01-1-.43z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

type Platform = "tiktok" | "instagram" | "youtube";

const PLATFORM_CONFIG: Record<Platform, { icon: React.FC<{ className?: string }>; color: string; urlBase: string }> = {
  tiktok: { icon: TikTokIcon, color: "text-foreground", urlBase: "tiktok.com/@" },
  instagram: { icon: InstagramIcon, color: "text-pink-400", urlBase: "instagram.com/" },
  youtube: { icon: YouTubeIcon, color: "text-red-500", urlBase: "youtube.com/@" },
};

const USERNAMES = [
  "alex.farm01", "maria_tt", "cool.bee", "ghost.runner", "pixel.wiz",
  "neon.cat", "byte.lion", "dark.fox", "star.dust", "wave.rider",
  "iron.bird", "jade.flow", "crimson.v", "echo.dj", "alpha.sun",
  "beta.moon", "sigma.gg", "nova.k", "turbo.ai", "zen.op",
];

const PLATFORM_ORDER: Platform[] = ["tiktok", "tiktok", "instagram", "tiktok", "youtube", "instagram", "tiktok", "youtube", "instagram", "tiktok", "youtube", "tiktok", "instagram", "youtube", "tiktok", "instagram", "youtube", "tiktok", "instagram", "youtube"];

interface AccountRow {
  id: string;
  username: string;
  platform: Platform;
  profileUrl: string;
  views: number;
  likes: number;
  comments: number;
  watchTime: number;
  active: boolean;
}

function buildInitial(): AccountRow[] {
  const rng = seededRandom(99);
  return Array.from({ length: 20 }, (_, i) => {
    const platform = PLATFORM_ORDER[i];
    const username = USERNAMES[i];
    return {
      id: `D${String(i + 1).padStart(2, "0")}`,
      username,
      platform,
      profileUrl: `${PLATFORM_CONFIG[platform].urlBase}${username}`,
      views: Math.floor(rng() * 80000 + 5000),
      likes: Math.floor(rng() * 6000 + 200),
      comments: Math.floor(rng() * 1500 + 50),
      watchTime: Math.floor(rng() * 300 + 10),
      active: rng() > 0.15,
    };
  });
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

function fmtNumFull(n: number): string {
  return n.toLocaleString("en-US");
}

function FlickerValue({ value, prevValue }: { value: number; prevValue: number }) {
  const spiked = value - prevValue > 200;
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`font-mono text-xs tabular-nums ${
        spiked ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]" : "text-foreground/80"
      }`}
    >
      {fmtNumFull(value)}
    </motion.span>
  );
}

function LinkEditPopup({ url, onSave, onClose }: { url: string; onSave: (v: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(url);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute z-50 top-full left-0 mt-1 p-3 rounded-lg bg-card border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.15)] min-w-[280px]"
    >
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono text-xs bg-secondary/50 border-border/50 focus:border-primary/50 h-8"
          placeholder="https://..."
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary" onClick={() => { onSave(value); onClose(); }}>
          <Check className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function StatisticsPanel() {
  
  const [rows, setRows] = useState<AccountRow[]>(buildInitial);
  const prevRef = useRef<AccountRow[]>(rows);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const rng = seededRandom(Date.now() % 10000);
    const id = setInterval(() => {
      setRows((prev) => {
        prevRef.current = prev;
        return prev.map((r) => {
          const hit = rng() > 0.6;
          if (!hit) return r;
          const spike = rng() > 0.85;
          return {
            ...r,
            views: r.views + Math.floor(rng() * (spike ? 800 : 60) + 1),
            likes: r.likes + Math.floor(rng() * (spike ? 120 : 8)),
            comments: r.comments + Math.floor(rng() * (spike ? 30 : 3)),
            watchTime: r.watchTime + (rng() > 0.7 ? 1 : 0),
          };
        });
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const totalViews = rows.reduce((s, r) => s + r.views, 0);
  const totalLikes = rows.reduce((s, r) => s + r.likes, 0);
  const activeAccounts = rows.filter((r) => r.active).length;

  const platformStats = (["tiktok", "instagram", "youtube"] as Platform[]).map((p) => {
    const pRows = rows.filter((r) => r.platform === p);
    return {
      platform: p,
      views: pRows.reduce((s, r) => s + r.views, 0),
      likes: pRows.reduce((s, r) => s + r.likes, 0),
      accounts: pRows.length,
    };
  });

  const platformLabels: Record<Platform, string> = { tiktok: "TT", instagram: "IG", youtube: "YT" };

  const exportCsv = useCallback(() => {
    const header = "Platform,Username,ProfileURL,Views,Likes,Comments,AvgWatchTime(h)";
    const body = rows.map((r) => `${r.platform},${r.username},${r.profileUrl},${r.views},${r.likes},${r.comments},${r.watchTime}`).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fermazak_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [rows]);

  const refreshAll = useCallback(() => {
    setRows((prev) => {
      prevRef.current = prev;
      const rng = seededRandom(Date.now());
      return prev.map((r) => ({
        ...r,
        views: r.views + Math.floor(rng() * 500 + 100),
        likes: r.likes + Math.floor(rng() * 50 + 10),
        comments: r.comments + Math.floor(rng() * 20 + 5),
        watchTime: r.watchTime + Math.floor(rng() * 5 + 1),
      }));
    });
  }, []);

  const refreshRow = (id: string) => {
    setRows((prev) => {
      prevRef.current = prev;
      const rng = seededRandom(Date.now());
      return prev.map((r) =>
        r.id !== id ? r : {
          ...r,
          views: r.views + Math.floor(rng() * 500 + 100),
          likes: r.likes + Math.floor(rng() * 50 + 10),
        }
      );
    });
  };

  const updateUrl = (id: string, url: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, profileUrl: url } : r)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col pb-12" style={{ minHeight: "calc(100vh - 7rem)" }}>
      {/* Single unified card */}
      <div className="glass rounded-xl overflow-hidden flex flex-col flex-1">
        {/* Platform summary bar — inside card, top */}
        <div className="px-5 py-3 border-b border-border/40 grid grid-cols-3 gap-4">
          {platformStats.map((ps) => {
            const Icon = PLATFORM_CONFIG[ps.platform].icon;
            const color = PLATFORM_CONFIG[ps.platform].color;
            return (
              <div key={ps.platform} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <div className="min-w-0">
                  <motion.span
                    key={ps.views}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm font-bold text-foreground tabular-nums"
                  >
                    {fmtNum(ps.views)}
                  </motion.span>
                  <span className="font-mono text-[10px] text-muted-foreground ml-1.5">
                    {platformLabels[ps.platform]} · {ps.accounts} acc · {fmtNum(ps.likes)} likes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Header with global actions */}
        <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-mono text-sm text-primary tracking-widest uppercase">Account Analytics</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-[10px] gap-1.5 border-primary/30 text-primary hover:text-primary-foreground hover:bg-primary/20 bg-transparent"
              onClick={refreshAll}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-[10px] gap-1.5 border-primary/30 text-primary hover:text-primary-foreground hover:bg-primary/20 bg-transparent"
              onClick={exportCsv}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-px bg-border/20">
          {[
            { label: "Total Views", value: fmtNum(totalViews), icon: Eye },
            { label: "Total Likes", value: fmtNum(totalLikes), icon: Heart },
            { label: "Active Accounts", value: `${activeAccounts} / ${rows.length}`, icon: Users },
          ].map((kpi) => (
            <div key={kpi.label} className="px-5 py-4 bg-card/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-muted-foreground tracking-[0.18em] uppercase truncate">{kpi.label}</p>
                <p className="font-mono text-lg font-bold text-primary tabular-nums">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="w-10 px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">#</th>
                <th className="w-10 px-4 py-3" />
                <th className="text-left px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Account</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Views</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Likes</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase whitespace-nowrap">Avg Watch Time</th>
                <th className="text-center px-4 py-3 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Link</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const prev = prevRef.current[i] ?? r;
                const config = PLATFORM_CONFIG[r.platform];
                const PlatformIcon = config.icon;
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-border/20 transition-colors duration-200 hover:bg-primary/[0.04] ${isEven ? "bg-transparent" : "bg-secondary/20"}`}
                  >
                    {/* Row number */}
                    <td className="px-4 py-2.5 text-center">
                      <span className="font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                    </td>
                    {/* Platform icon only */}
                    <td className="px-4 py-2.5 text-center">
                      <PlatformIcon className={`w-4 h-4 ${config.color} inline-block`} />
                    </td>
                    {/* Username */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.active ? "bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.6)]" : "bg-destructive"}`} />
                        <span className="font-mono text-xs text-foreground/90">{r.username}</span>
                      </div>
                    </td>
                    {/* Stats */}
                    <td className="px-4 py-2.5 text-right"><FlickerValue value={r.views} prevValue={prev.views} /></td>
                    <td className="px-4 py-2.5 text-right"><FlickerValue value={r.likes} prevValue={prev.likes} /></td>
                    <td className="px-4 py-2.5 text-right"><FlickerValue value={r.watchTime} prevValue={prev.watchTime} /></td>
                    {/* Link edit — green */}
                    <td className="px-4 py-2.5 text-center relative">
                      <button
                        onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                        className="font-mono text-[10px] text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Edit Link
                      </button>
                      <AnimatePresence>
                        {editingId === r.id && (
                          <LinkEditPopup
                            url={r.profileUrl}
                            onSave={(v) => updateUrl(r.id, v)}
                            onClose={() => setEditingId(null)}
                          />
                        )}
                      </AnimatePresence>
                    </td>
                    {/* Row actions — green */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
                          onClick={() => refreshRow(r.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
                          onClick={() => window.open(`https://${r.profileUrl}`, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
