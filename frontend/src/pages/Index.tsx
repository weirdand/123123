import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceDashboard from "@/components/soft/DeviceDashboard";
import DisplayPanel from "@/components/soft/DisplayPanel";
import { Device, mapBackendDevices } from "@/components/soft/types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Index = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchDevices();
    
    const ws = new WebSocket(`ws://localhost:8000/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'devices_update') {
        setDevices(mapBackendDevices(data.data));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/devices/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      const data = await response.json();
      setDevices(mapBackendDevices(data));
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('Error fetching devices:', err);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToggle = () => {
    setSyncEnabled(!syncEnabled);
  };

  const handleTaskAssign = async (deviceId: string, task: string) => {
    try {
      await fetch(`${API_BASE}/api/devices/assign-task/${deviceId}?task=${task}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg font-mono text-sm">
            {error} - Check if backend is running
          </div>
        </div>
      )}
      
      {/* Кнопки переключения вида */}
      <div className="mb-4 flex gap-2 justify-end">
        <button
          onClick={() => setActiveView('grid')}
          className={`px-3 py-1 rounded-lg font-mono text-xs border transition-all ${
            activeView === 'grid' 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary text-muted-foreground border-border'
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setActiveView('table')}
          className={`px-3 py-1 rounded-lg font-mono text-xs border transition-all ${
            activeView === 'table' 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary text-muted-foreground border-border'
          }`}
        >
          Table View
        </button>
      </div>

      {/* Отображаем нужный компонент */}
      {activeView === 'grid' ? (
        <DisplayPanel 
          devices={devices}
          syncEnabled={syncEnabled}
          onSyncToggle={handleSyncToggle}
          onTaskAssign={handleTaskAssign}
        />
      ) : (
        <DeviceDashboard devices={devices} />
      )}
    </div>
  );
};

export default Index;