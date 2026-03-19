export interface Device {
  id: string;
  online: boolean;
  proxy: string;
  fps: number;
  temp: number;
  uptime: string;
  task: string;
  isMaster: boolean;
}

export const TASKS = ["SCROLL", "LIKE", "FOLLOW", "IDLE", "POST", "DM"];

export type ActivePanel = "dashboard" | "apk" | "proxy" | "display" | "otg" | "library" | "stats" | "shop" | "settings";

export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateDevices(): Device[] {
  const rng = seededRandom(42);
  return Array.from({ length: 20 }, (_, i) => {
    const online = rng() > 0.1;
    return {
      id: `D${String(i + 1).padStart(2, "0")}`,
      online,
      proxy: `185.${Math.floor(rng() * 240 + 10)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
      fps: online ? Math.floor(rng() * 32 + 28) : 0,
      temp: online ? Math.floor(rng() * 16 + 32) : 0,
      uptime: online ? `${Math.floor(rng() * 72 + 1)}h` : "—",
      task: online ? TASKS[Math.floor(rng() * TASKS.length)] : "—",
      isMaster: i === 7,
    };
  });
}
