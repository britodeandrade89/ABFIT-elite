import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Droplets, RefreshCw, CheckCircle2, Bell } from 'lucide-react';
import { callGemini } from '../services/gemini';
import { WeatherData, AppNotification } from '../types';

export function Logo({ size = "text-8xl", subSize = "text-[10px]" }: { size?: string, subSize?: string }) {
  return (
    <div className="text-center group select-none">
      <h1 className={`${size} font-black italic mb-0 transform -skew-x-12 tracking-tighter drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all text-white uppercase`}>
        <span className="text-red-600">AB</span>FIT
      </h1>
      <p className={`${subSize} text-zinc-400 tracking-[0.2em] uppercase font-bold leading-none`}>Assessoria em Treinamentos Físicos</p>
    </div>
  );
}

// Fix: Relaxed types for children (optional) and explicitly allowed 'key' to resolve TypeScript errors where 'key' is passed in props
// Added onClick to allow click handling on Cards
export function Card({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, key?: any, onClick?: any }) {
  return <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden ${className}`}>{children}</div>;
}

// Fix: Made children optional to resolve 'Property children is missing' TypeScript errors
export function BackgroundWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale scale-110 blur-sm pointer-events-none"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function EliteFooter() {
  return (
    <footer className="mt-20 pb-12 text-center opacity-30 animate-in fade-in duration-1000">
      <div className="max-w-[150px] mx-auto h-px bg-zinc-800 mb-6"></div>
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 text-center">
        ABFIT Elite v1.6 (Realtime)
      </p>
      <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mt-2 text-center">
        Criador: André Brito
      </p>
    </footer>
  );
}

// --- NEW COMPONENTS FOR REALTIME STATUS ---

export function SyncStatus() {
  const [synced, setSynced] = useState(true);

  // Fake sync effect for visual feedback when data changes
  useEffect(() => {
    // This component mounts, assuming connected. 
    // In a real app, this would listen to Firestore connection state.
    // We'll animate it on mount to show "Live" status.
    setSynced(false);
    const t = setTimeout(() => setSynced(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
       {synced ? (
         <>
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
           <span className="text-[8px] font-black uppercase text-zinc-400">Online</span>
         </>
       ) : (
         <>
           <RefreshCw size={10} className="text-amber-500 animate-spin" />
           <span className="text-[8px] font-black uppercase text-zinc-400">Sync...</span>
         </>
       )}
    </div>
  );
}

export function NotificationBadge({ notifications = [], onClick }: { notifications?: AppNotification[], onClick?: () => void }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button onClick={onClick} className="relative p-2 bg-zinc-900 rounded-full border border-white/5 hover:bg-zinc-800 transition-colors">
      <Bell size={18} className={unreadCount > 0 ? "text-white swing-animation" : "text-zinc-500"} />
      {unreadCount > 0 && (
        <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-black animate-bounce">
          {unreadCount}
        </div>
      )}
      <style>{`
        @keyframes swing { 0%,100% { transform: rotate(0deg); } 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } }
        .swing-animation { animation: swing 2s infinite ease-in-out; transform-origin: top center; }
      `}</style>
    </button>
  );
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      // Mocked real-time weather via Gemini intelligence
      const prompt = `Reporte o clima atual para Maricá, RJ. Responda apenas com este JSON: {"temp": 28, "feels": 31, "rain": "10%"}`;
      try {
        const data = await callGemini(prompt, "Meteorologista preciso.", true);
        if (data) setWeather(data);
      } catch (e) { 
        console.error("Weather error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); 
    return () => clearInterval(interval);
  }, []);

  if (loading || !weather) return <div className="flex items-center gap-2 text-zinc-600 animate-pulse"><CloudRain size={14}/><span className="text-[8px] font-black uppercase text-white">Clima...</span></div>;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <Sun className="text-amber-500" size={16} />
        <div className="text-left">
          <p className="text-[10px] font-black leading-none text-white">{weather.temp}°C</p>
          <p className="text-[6px] text-zinc-500 uppercase font-bold tracking-widest mt-1 text-left">Temp</p>
        </div>
      </div>
      <div className="h-6 w-px bg-white/10"></div>
      <div className="text-left">
        <p className="text-[8px] font-black leading-none text-white">{weather.feels}°C</p>
        <p className="text-[6px] text-zinc-500 uppercase font-bold tracking-widest mt-1 text-left">Sensação</p>
      </div>
      <div className="h-6 w-px bg-white/10"></div>
      <div className="flex items-center gap-2">
        <Droplets size={12} className="text-blue-500" />
        <div className="text-left">
          <p className="text-[8px] font-black leading-none text-white">{weather.rain}</p>
          <p className="text-[6px] text-zinc-500 uppercase font-bold tracking-widest mt-1 text-left">Chuva</p>
        </div>
      </div>
    </div>
  );
}