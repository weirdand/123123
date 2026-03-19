import type {
  Device, Script, Task, Proxy, User, DashboardStats,
  AuthResponse, SuccessResponse, TaskIdResponse, ImportResponse,
  ApkUploadResponse, InstallationStatus, DeviceStreamCallbacks,
} from "@/types/api";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ── Mock helpers ──────────────────────────────────────────────

const mockDevices: Device[] = Array.from({ length: 20 }, (_, i) => ({
  id: `D${String(i + 1).padStart(2, "0")}`,
  status: Math.random() > 0.1 ? "ONLINE" : "OFF",
  fps: Math.floor(Math.random() * 30 + 28),
  task: ["SCROLL", "LIKE", "FOLLOW", "IDLE"][Math.floor(Math.random() * 4)],
  username: `user_${i + 1}`,
  views: Math.floor(Math.random() * 50000),
  proxyId: Math.random() > 0.3 ? `P${String(i + 1).padStart(2, "0")}` : null,
}));

const mockScripts: Script[] = [
  { id: "s1", name: "auto_like.py", type: "free", price: 0, parameters: { delay: 2, maxLikes: 100 } },
  { id: "s2", name: "follow_back.py", type: "free", price: 0, parameters: { delay: 3 } },
  { id: "s3", name: "scroll_feed.py", type: "free", price: 0, parameters: { pauseMin: 1, pauseMax: 5 } },
  { id: "s4", name: "dm_responder.py", type: "paid", price: 15, parameters: { template: "" } },
  { id: "s5", name: "story_viewer.py", type: "free", price: 0, parameters: {} },
  { id: "s6", name: "comment_bot.py", type: "paid", price: 25, parameters: { prompt: "" } },
];

const mockProxies: Proxy[] = Array.from({ length: 10 }, (_, i) => ({
  id: `P${String(i + 1).padStart(2, "0")}`,
  ip: `185.${100 + i}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  port: 8000 + i,
  status: Math.random() > 0.2 ? "active" : "inactive",
  deviceId: i < 8 ? `D${String(i + 1).padStart(2, "0")}` : null,
}));

const mockUser: User = { email: "admin@fermazak.io", name: "Admin", plan: "pro" };

let taskCounter = 0;

// ── Auth ──────────────────────────────────────────────────────

export async function login(email: string, _password: string): Promise<AuthResponse> {
  await delay(500);
  return { user: { ...mockUser, email }, token: "mock-jwt-token-xyz" };
}

export async function getCurrentUser(): Promise<User> {
  await delay();
  return { ...mockUser };
}

// ── Devices ───────────────────────────────────────────────────

export async function getAllDevices(): Promise<Device[]> {
  await delay();
  return [...mockDevices];
}

export async function rebootDevice(id: string): Promise<SuccessResponse> {
  await delay(600);
  console.log(`[mock] reboot device ${id}`);
  return { success: true };
}

export async function rebootAll(): Promise<SuccessResponse> {
  await delay(1000);
  console.log("[mock] reboot all devices");
  return { success: true };
}

export async function scanNetwork(): Promise<Device[]> {
  await delay(800);
  return [...mockDevices];
}

// ── Scripts ───────────────────────────────────────────────────

export async function getAvailableScripts(): Promise<Script[]> {
  await delay();
  return [...mockScripts];
}

export async function runScript(
  scriptId: string,
  deviceIds: string[],
  params?: Record<string, unknown>,
): Promise<TaskIdResponse> {
  await delay(400);
  const taskId = `task_${++taskCounter}`;
  console.log(`[mock] run script ${scriptId} on [${deviceIds}]`, params);
  return { taskId };
}

export async function stopScript(taskId: string): Promise<SuccessResponse> {
  await delay(300);
  console.log(`[mock] stop task ${taskId}`);
  return { success: true };
}

export async function runWarming(params: Record<string, unknown>): Promise<TaskIdResponse> {
  await delay(400);
  console.log("[mock] warming", params);
  return { taskId: `task_${++taskCounter}` };
}

export async function runBoosting(params: Record<string, unknown>): Promise<TaskIdResponse> {
  await delay(400);
  console.log("[mock] boosting", params);
  return { taskId: `task_${++taskCounter}` };
}

export async function runMassPosting(params: Record<string, unknown>): Promise<TaskIdResponse> {
  await delay(400);
  console.log("[mock] mass posting", params);
  return { taskId: `task_${++taskCounter}` };
}

// ── Proxy ─────────────────────────────────────────────────────

export async function getAllProxies(): Promise<Proxy[]> {
  await delay();
  return [...mockProxies];
}

export async function importProxies(text: string): Promise<ImportResponse> {
  await delay(500);
  const lines = text.split("\n").filter(Boolean);
  console.log(`[mock] imported ${lines.length} proxies`);
  return { imported: lines.length };
}

export async function assignProxy(proxyId: string, deviceId: string): Promise<Proxy> {
  await delay(300);
  const proxy = mockProxies.find((p) => p.id === proxyId);
  if (!proxy) throw new Error("Proxy not found");
  return { ...proxy, deviceId };
}

// ── APK ───────────────────────────────────────────────────────

export async function uploadApk(_file: File): Promise<ApkUploadResponse> {
  await delay(800);
  return { apkId: `apk_${Date.now()}` };
}

export async function installApk(apkId: string, deviceIds: string[]): Promise<TaskIdResponse> {
  await delay(500);
  console.log(`[mock] install ${apkId} on [${deviceIds}]`);
  return { taskId: `task_${++taskCounter}` };
}

export async function getInstallationStatus(taskId: string): Promise<InstallationStatus> {
  await delay();
  return { status: "running", progress: Math.floor(Math.random() * 100) };
}

// ── Stats ─────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  return {
    totalViews: 1_284_500,
    totalWatchHours: 8_420,
    conversion: 3.7,
    totalPosts: 12_840,
  };
}

export async function exportToCSV(): Promise<Blob> {
  await delay(400);
  const csv = "device,status,fps,task,views\n" +
    mockDevices.map((d) => `${d.id},${d.status},${d.fps},${d.task},${d.views}`).join("\n");
  return new Blob([csv], { type: "text/csv" });
}

// ── WebSocket ─────────────────────────────────────────────────

export function connectToDeviceStream(callbacks: DeviceStreamCallbacks): { close: () => void } {
  callbacks.onConnect?.();

  const interval = setInterval(() => {
    const idx = Math.floor(Math.random() * mockDevices.length);
    const device = {
      ...mockDevices[idx],
      fps: Math.floor(Math.random() * 30 + 28),
      views: mockDevices[idx].views + Math.floor(Math.random() * 100),
    };
    callbacks.onDeviceUpdate?.(device);
  }, 2000);

  return {
    close: () => {
      clearInterval(interval);
      callbacks.onDisconnect?.();
    },
  };
}
