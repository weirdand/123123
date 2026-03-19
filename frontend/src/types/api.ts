export type DeviceStatus = "ONLINE" | "OFF";
export type ScriptType = "free" | "paid";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "stopped";
export type ProxyStatus = "active" | "inactive" | "error";

export interface Device {
  id: string;
  status: DeviceStatus;
  fps: number;
  task: string;
  username: string;
  views: number;
  proxyId: string | null;
}

export interface Script {
  id: string;
  name: string;
  type: ScriptType;
  price: number;
  parameters: Record<string, unknown>;
}

export interface Task {
  id: string;
  scriptId: string;
  deviceIds: string[];
  status: TaskStatus;
  progress: number;
}

export interface Proxy {
  id: string;
  ip: string;
  port: number;
  status: ProxyStatus;
  deviceId: string | null;
}

export interface User {
  email: string;
  name: string;
  plan: string;
}

export interface DashboardStats {
  totalViews: number;
  totalWatchHours: number;
  conversion: number;
  totalPosts: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SuccessResponse {
  success: boolean;
}

export interface TaskIdResponse {
  taskId: string;
}

export interface ImportResponse {
  imported: number;
}

export interface ApkUploadResponse {
  apkId: string;
}

export interface InstallationStatus {
  status: TaskStatus;
  progress: number;
}

export interface DeviceStreamCallbacks {
  onDeviceUpdate?: (device: Device) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}
