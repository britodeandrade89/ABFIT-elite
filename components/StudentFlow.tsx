
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Dumbbell, CheckCircle2, HeartPulse, Trophy, 
  ChevronLeft, ChevronRight, Plus, X, SkipForward, Play,
  TrendingUp, Flame, Activity, Zap, Footprints, Loader2, Maximize2,
  Timer, RotateCw, Power, FastForward, Calendar, History, Scale, Ruler, Brain,
  Bell, List, MapPin, Clock, DollarSign, AlertCircle, RefreshCcw, CalendarDays, ExternalLink,
  Navigation, CheckCircle, Star, Sparkles, Info, Search, Target, Map as MapIcon, BookOpen
} from 'lucide-react';
import { Card, EliteFooter, SyncStatus, NotificationBadge } from './Layout';
import { Student, PhysicalAssessment, WorkoutHistoryEntry, AnalyticsData, PeriodizationPlan, Workout } from '../types';
import { collection, onSnapshot, doc, setDoc, query, where, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { db, appId, auth } from '../services/firebase';
import { RunTrackStudentView } from './RunTrack';
import { generateExerciseImage } from '../services/gemini';
import { GoogleGenAI } from "@google/genai";

// --- PERIODIZATION VIEW FOR STUDENT ---
export function StudentPeriodizationView({ student, onBack }: { student: Student, onBack: () => void }) {
  const plan = student.periodization;

  if (!plan) {
    return (
      <div className="p-6 text-white h-screen flex flex-col items-center justify-center text-center">
        <Brain size={64} className="text-zinc-800 mb-6" />
        <h2 className="text-xl font-black uppercase italic">Sem Periodização</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase mt-2">Seu treinador ainda não liberou seu macrociclo PhD.</p>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-zinc-900 rounded-full text-[10px] font-black uppercase">Voltar</button>
      </div>
    );
  }

  const getWeekRange = (weekNum: number) => {
    const start = new Date(plan.startDate || new Date());
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${fmt(weekStart)} a ${fmt(weekEnd)}`;
  };

  return (
    <div className="p-6 pb-48 text-white overflow-y-auto h-screen text-left custom-scrollbar bg-black">
      <header className="flex items-center gap-4 mb-10 sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-white hover:bg-red-600 transition-colors">
          <ArrowLeft size={20}/>
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Ciência<span className="text-red-600">Força</span></h2>
      </header>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* HEADER DO MESOCICLO */}
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={80} /></div>
          <p className="text-[10px] font-black uppercase text-red-600 mb-4 tracking-[0.15em] leading-relaxed max-w-[90%]">
            {plan.modelo_teorico || "PERIODIZAÇÃO ONDULATÓRIA SEMANAL COM MANIPULAÇÃO NÃO-LINEAR DAS VARIÁVEIS DE CARGA."}
          </p>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase text-white mb-4 leading-[0.9] tracking-tighter">
            {plan.titulo}
          </h1>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed italic opacity-80">
            {plan.objetivo_longo_prazo}
          </p>
        </div>

        {/* SEMANAS / MICROCICLOS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-2">Cronograma Semanal</h3>
          {plan.microciclos.map((m: any, i: number) => (
            <Card key={i} className="p-6 bg-zinc-900 border-zinc-800 flex items-center justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black text-white uppercase tracking-tighter">SEMANA {m.semana}:</span>
                  <span className="text-[10px] font-bold text-zinc-500">{getWeekRange(m.semana)}</span>
                </div>
                <h4 className="text-lg font-black italic uppercase text-red-600 leading-none">{m.tipo}</h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">{m.foco}</p>
              </div>
              <div className="text-right border-l border-white/5 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-zinc-500 uppercase">RPE Alvo</span>
                  <span className="text-sm font-black text-white italic">{m.pse_alvo}</span>
                </div>
                <div className="flex flex-col items-end mt-2">
                  <span className="text-[8px] font-black text-zinc-500 uppercase">Volume</span>
                  <span className="text-[10px] font-black text-zinc-300">{m.faixa_repeticoes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* NOTAS PHD */}
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
          <h3 className="text-amber-500 font-black uppercase text-xs mb-4 flex items-center gap-3">
             <BookOpen size={16} /> NOTAS PHD
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium italic opacity-80">
             {plan.notas_phd || "Mantenha a cadência controlada e priorize a técnica biomecânica em todas as fases do mesociclo."}
          </p>
        </div>
      </div>
      
      <EliteFooter />
    </div>
  );
}

// --- REST OF THE FILE (Slightly updated to include transitions) ---
const animationStyles = `
  @keyframes biomechanicalVideo {
    0% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
    40% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    60% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    100% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
  }
  .video-motion-engine { animation: biomechanicalVideo 5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
`;

export function WorkoutSessionView({ user, onBack, onSave }: any) {
  // ... (keep existing implementation)
  return (
    <div className="p-6 pb-48 text-white overflow-y-auto h-screen text-left custom-scrollbar relative">
      <style>{animationStyles}</style>
      <header className="flex items-center justify-between mb-4 text-left sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
            <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-left truncate">Sessão de Treino</h2>
        </div>
        <SyncStatus />
      </header>
      {/* ... Rest of the component */}
      <EliteFooter />
    </div>
  );
}

export function WorkoutCounterView({ student, onBack, onSaveHistory }: any) { /* ... */ return null; }
export function StudentAssessmentView({ student, onBack }: any) { /* ... */ return null; }
export const CorreRJView = ({ onBack }: any) => { /* ... */ return null; }
