export interface Device {
  id: string;
  online: boolean;
  proxy?: string;        // Опционально, может не быть
  fps?: number;          // Опционально, может не быть
  temp?: number;         // Опционально, может не быть
  uptime?: string;       // Опционально, может не быть
  task?: string;         // Теперь опционально
  isMaster?: boolean;    // Опционально, может не быть
  model?: string;        // Добавили модель телефона
  battery?: number;      // Добавили заряд батареи
  username?: string;     // Добавили имя пользователя
  lastSeen: string;      // Обязательное поле для всех
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

// Функция для генерации мок-данных (когда нет реальных устройств)
export function generateDevices(): Device[] {
  const rng = seededRandom(42);
  return Array.from({ length: 20 }, (_, i) => {
    const online = rng() > 0.1;
    return {
      id: `D${String(i + 1).padStart(2, "0")}`,
      online,
      proxy: online ? `185.${Math.floor(rng() * 240 + 10)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}:8080` : undefined,
      fps: online ? Math.floor(rng() * 32 + 28) : 0,
      temp: online ? Math.floor(rng() * 16 + 32) : 0,
      uptime: online ? `${Math.floor(rng() * 72 + 1)}h` : "—",
      task: online ? TASKS[Math.floor(rng() * TASKS.length)] : undefined,
      isMaster: i === 7,
      model: online ? ["Galaxy S21", "Pixel 6", "iPhone 13", "Redmi Note", "OnePlus 9"][Math.floor(rng() * 5)] : undefined,
      battery: online ? Math.floor(rng() * 40 + 60) : 0,
      username: online ? `@user_${String(i + 1).padStart(2, "0")}` : undefined,
      lastSeen: new Date().toISOString(),
    };
  });
}

// Функция для преобразования данных с бэкенда в формат Device
export function mapBackendDevice(backendDevice: any): Device {
  return {
    id: backendDevice.id,
    online: backendDevice.online || backendDevice.status === 'ONLINE',
    task: backendDevice.task || 'IDLE',
    model: backendDevice.model,
    battery: backendDevice.battery,
    username: backendDevice.username,
    fps: backendDevice.fps || 60,
    proxy: backendDevice.proxy,
    temp: backendDevice.temp || 36,
    uptime: backendDevice.uptime || '0h',
    isMaster: backendDevice.isMaster || false,
    lastSeen: backendDevice.lastSeen || new Date().toISOString(),
  };
}

// Функция для преобразования массива данных с бэкенда
export function mapBackendDevices(backendDevices: any[]): Device[] {
  return backendDevices.map(mapBackendDevice);
}