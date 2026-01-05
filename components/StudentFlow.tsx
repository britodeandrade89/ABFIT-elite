import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Dumbbell, CheckCircle2, HeartPulse, Trophy, 
  ChevronLeft, ChevronRight, Plus, X, SkipForward, Play,
  TrendingUp, Flame, Activity, Zap, Footprints, Loader2, Maximize2,
  Timer, RotateCw, Power, FastForward, Calendar, History, Scale, Ruler, Brain,
  Bell, List
} from 'lucide-react';
import { Card, EliteFooter, SyncStatus, NotificationBadge } from './Layout';
import { Student, PhysicalAssessment, WorkoutHistoryEntry, AnalyticsData, PeriodizationPlan, Workout } from '../types';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { RunTrackStudentView } from './RunTrack';
import { generateExerciseImage } from '../services/gemini';

// --- STYLES FOR LOOP ANIMATION ---
const animationStyles = `
  @keyframes biomechanicalVideo {
    0% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
    40% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    60% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    100% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
  }
  .video-motion-engine { animation: biomechanicalVideo 5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
  .video-progress-bar { height: 4px; background: #f59e0b; animation: progress 5s linear infinite; transform-origin: left; }
  @keyframes progress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
  
  @keyframes circle-progress {
    from { stroke-dashoffset: 283; }
    to { stroke-dashoffset: 0; }
  }
`;

// --- HELPER FUNCTION FOR ASSESSMENTS ---
const calculateAssessmentResults = (av: PhysicalAssessment, al: Student) => {
  if (!av) return { imc: '0', bf: '0', massaMagra: '0' };
  const peso = typeof av.peso === 'string' ? parseFloat(av.peso) : av.peso || 0;
  const altura = typeof av.altura === 'string' ? parseFloat(av.altura) : av.altura || 0;
  const idade = 25; 
  const imc = altura > 0 ? peso / ((altura / 100) ** 2) : 0;
  
  let soma = 0;
  if (al?.sexo === 'Masculino') {
    soma = (Number(av.dc_peitoral) || 0) + (Number(av.dc_abdominal) || 0) + (Number(av.dc_coxa) || 0);
  } else {
    soma = (Number(av.dc_tricipital) || 0) + (Number(av.dc_suprailiaca) || 0) + (Number(av.dc_coxa) || 0);
  }
  
  let dc = 0;
  if (soma > 0) {
    if (al?.sexo === 'Masculino') dc = 1.10938 - (0.0008267 * soma) + (0.0000016 * (soma ** 2)) - (0.0002574 * idade);
    else dc = 1.0994921 - (0.0009929 * soma) + (0.0000023 * (soma ** 2)) - (0.0001392 * idade);
  }
  
  const bf = dc > 0 ? ((4.95 / dc) - 4.5) * 100 : (Number(av.bio_percentual_gordura) || 0);
  const massaMagra = peso - (peso * (bf / 100));
  
  return { 
    imc: imc.toFixed(1), 
    bf: bf.toFixed(1), 
    massaMagra: (Number(av.bio_massa_magra) || massaMagra).toFixed(1) 
  };
};

// --- PERIODIZATION HELPER ---
function getCurrentMicrocycle(plan?: PeriodizationPlan) {
  if (!plan) return null;
  const start = new Date(plan.startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const currentWeek = Math.ceil(diffDays / 7);
  
  return plan.microciclos.find(m => m.semana === currentWeek) || plan.microciclos[plan.microciclos.length - 1];
}

// --- WORKOUT SESSION VIEW ---
interface SessionProps {
  user: Student;
  onBack: () => void;
  onSave: (id: string, data: any) => void;
}

export function WorkoutSessionView({ user, onBack, onSave }: SessionProps) {
  // Allow user to select workout if multiple exist
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(user.workouts?.[0] || null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Determine current count
  const workoutCountInfo = useMemo(() => {
    if (!selectedWorkout) return { current: 0, total: 0 };
    
    // Count how many times THIS workout was done within its active window
    const history = user.workoutHistory || [];
    const startDate = selectedWorkout.startDate ? new Date(selectedWorkout.startDate) : new Date(0);
    const endDate = selectedWorkout.endDate ? new Date(selectedWorkout.endDate) : new Date(2100, 0, 1);
    
    const count = history.filter(h => {
       // Filter by name (simple) or ID if we stored it
       const isSame = h.name === selectedWorkout.title || h.workoutId === selectedWorkout.id;
       const d = new Date(h.date);
       return isSame && d >= startDate && d <= endDate;
    }).length;

    return {
        current: count + 1, // Current session being performed
        total: selectedWorkout.projectedSessions || 10
    };
  }, [user.workoutHistory, selectedWorkout]);

  // New State for Set Tracking: { [exerciseId]: [completedSetIndices] }
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({});
  const [loadMap, setLoadMap] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Expanded Exercise State
  const [expandedExercise, setExpandedExercise] = useState<any | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});

  // REST TIMER STATE
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restTotalTime, setRestTotalTime] = useState(0);
  
  const [isFinishing, setIsFinishing] = useState(false);

  const activeMicrocycle = getCurrentMicrocycle(user.periodization);

  // Global Workout Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest Timer Logic
  useEffect(() => {
    let interval: any;
    if (restTimerActive && restTimeLeft > 0) {
        interval = setInterval(() => {
            setRestTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (restTimeLeft === 0 && restTimerActive) {
        setRestTimerActive(false);
        // Play sound or vibrate could go here
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimeLeft]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Logic to calculate total sets for an exercise
  const getSetCount = (ex: any) => {
    const raw = ex.sets || "3";
    const parsed = parseInt(raw);
    return isNaN(parsed) ? 3 : parsed;
  };

  const parseRestTime = (restString?: string) => {
      if (!restString) return 60;
      // Extract numbers from string like "60s", "1 min"
      const numbers = restString.match(/\d+/);
      return numbers ? parseInt(numbers[0]) : 60;
  };

  const handleSetToggle = (exerciseId: string, setIndex: number, restString?: string) => {
    setCompletedSets(prev => {
      const current = prev[exerciseId] || [];
      const isAlreadyDone = current.includes(setIndex);
      
      if (isAlreadyDone) {
        return { ...prev, [exerciseId]: current.filter(i => i !== setIndex) };
      } else {
        // TRIGGER REST TIMER ON COMPLETION
        const time = parseRestTime(restString);
        setRestTotalTime(time);
        setRestTimeLeft(time);
        setRestTimerActive(true);

        return { ...prev, [exerciseId]: [...current, setIndex] };
      }
    });
  };

  const isExerciseComplete = (ex: any, idx: number) => {
    const id = ex.id || idx.toString();
    const count = getSetCount(ex);
    const done = completedSets[id]?.length || 0;
    return done >= count;
  };

  const isWorkoutComplete = useMemo(() => {
    if (!selectedWorkout?.exercises) return false;
    return selectedWorkout.exercises.every((ex, idx) => isExerciseComplete(ex, idx));
  }, [selectedWorkout, completedSets]);

  const handleExpandExercise = async (ex: any) => {
    setExpandedExercise(ex);
    const existingImage = ex.thumb || generatedImages[ex.name];
    if (!existingImage) {
        setLoadingImage(true);
        const newImage = await generateExerciseImage(ex.name);
        if (newImage) {
            setGeneratedImages(prev => ({...prev, [ex.name]: newImage}));
        }
        setLoadingImage(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (!selectedWorkout) return;
    setIsFinishing(true);
    const entry: WorkoutHistoryEntry = {
        id: Date.now().toString(),
        workoutId: selectedWorkout.id,
        name: selectedWorkout.title || "Treino Realizado",
        duration: Math.floor(elapsedSeconds / 60).toString(),
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
    };

    const analytics = user.analytics || { exercises: {}, sessionsCompleted: 0, streakDays: 0 };
    analytics.sessionsCompleted += 1;
    analytics.lastSessionDate = new Date().toISOString();

    try {
        await onSave(user.id, { 
            workoutHistory: [...(user.workoutHistory || []), entry],
            analytics: analytics
        });
        
        onBack();
    } catch (e) {
        console.error("Error saving workout", e);
        alert("Erro ao salvar treino. Tente novamente.");
        setIsFinishing(false);
    }
  };

  return (
    <div className="p-6 pb-48 text-white overflow-y-auto h-screen text-left custom-scrollbar relative">
      <style>{animationStyles}</style>
      
      {/* REST TIMER OVERLAY */}
      {restTimerActive && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="relative">
                {/* Progress Circle could go here, simplicity for now */}
                <div className="text-[12rem] font-black text-white leading-none tabular-nums tracking-tighter animate-pulse">
                    {restTimeLeft}
                </div>
                <div className="text-center text-red-600 font-black uppercase tracking-[0.5em] text-xl mt-4">Descansar</div>
             </div>
             
             <button 
                onClick={() => setRestTimerActive(false)}
                className="mt-20 px-12 py-6 bg-zinc-800 rounded-full text-white font-black uppercase tracking-widest text-lg hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-4"
             >
                <FastForward fill="currentColor" /> Pular
             </button>
          </div>
      )}

      <header className="flex items-center justify-between mb-4 text-left sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white text-left hover:bg-red-600 transition-colors"><ArrowLeft size={20} className="text-zinc-400 group-hover:text-white"/></button>
            <div className="relative">
                <h2 onClick={() => setShowHistoryDropdown(!showHistoryDropdown)} className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-left truncate max-w-[200px] md:max-w-none flex items-center gap-2 cursor-pointer">
                  {selectedWorkout?.title || "Meus Treinos"} <List size={14}/>
                </h2>
                {showHistoryDropdown && user.workouts && (
                    <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 w-64 overflow-hidden">
                        <p className="text-[9px] uppercase font-bold text-zinc-500 p-3 bg-black/50">Selecione o Treino</p>
                        {user.workouts.map(w => (
                            <button key={w.id} onClick={() => { setSelectedWorkout(w); setShowHistoryDropdown(false); }} className="w-full text-left p-4 hover:bg-red-900/20 border-b border-white/5 last:border-0 font-bold text-xs uppercase">
                                {w.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
           <SyncStatus />
        </div>
      </header>
      
      {/* HEADER COUNTER & TIMER */}
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-2">
             <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                Treino {workoutCountInfo.current} / {workoutCountInfo.total}
             </div>
             {selectedWorkout?.endDate && (
                 <div className="text-[8px] font-bold uppercase text-zinc-600">
                    Vence: {new Date(selectedWorkout.endDate).toLocaleDateString('pt-BR')}
                 </div>
             )}
         </div>
         <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl border border-red-900/30">
            <Timer className="text-red-500 animate-pulse" size={16} />
            <span className="font-mono text-xl font-black text-white">{formatTime(elapsedSeconds)}</span>
         </div>
      </div>

      {/* AUTOMATIC PERIODIZATION HEADER */}
      {activeMicrocycle && (
        <Card className="mb-8 p-6 bg-indigo-900/40 border-l-4 border-l-indigo-500 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Periodização Ativa • Semana {activeMicrocycle.semana}</h3>
                  <h2 className="text-2xl font-black italic uppercase text-white">{activeMicrocycle.foco}</h2>
               </div>
               <TrendingUp className="text-indigo-400" size={24}/>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                   <p className="text-[9px] font-bold text-zinc-400 uppercase">Meta Reps</p>
                   <p className="text-lg font-black text-white">{activeMicrocycle.faixa_repeticoes}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                   <p className="text-[9px] font-bold text-zinc-400 uppercase">Intensidade (PSE)</p>
                   <p className="text-lg font-black text-white">{activeMicrocycle.pse_alvo}</p>
                </div>
            </div>
        </Card>
      )}

      {selectedWorkout ? (
        <div className="space-y-6 text-left">
          {selectedWorkout.exercises.map((ex, idx) => {
            const exerciseId = ex.id || idx.toString();
            const totalSets = getSetCount(ex);
            const isComplete = isExerciseComplete(ex, idx);
            const displayImage = generatedImages[ex.name] || ex.thumb;
            
            return (
              <div 
                key={`user-session-ex-${exerciseId}-${idx}`} 
                className={`relative bg-zinc-900 border rounded-[2rem] overflow-hidden transition-all ${isComplete ? 'border-green-600/50 shadow-[0_0_20px_rgba(22,163,74,0.15)]' : 'border-zinc-800 shadow-xl'}`}
              >
                {/* Header Section */}
                <div className="flex items-stretch border-b border-white/5 bg-black/20">
                    
                    {/* LEFT SIDE NUMBER - RED & LARGE - ADJUSTED FOR MOBILE */}
                    <div className="w-14 md:w-20 bg-black/40 flex items-center justify-center border-r border-white/5 shrink-0">
                        <span className="text-2xl md:text-4xl font-black italic text-red-600 tracking-tighter">
                            {String(idx + 1).padStart(2, '0')}
                        </span>
                    </div>

                    <div className="flex-1 p-3 md:p-5 flex gap-3 md:gap-4 items-center cursor-pointer group hover:bg-white/5 transition-colors overflow-hidden" onClick={() => handleExpandExercise(ex)}>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-xl overflow-hidden border border-white/5 shrink-0 relative group-hover:border-red-600/50 transition-colors">
                            {displayImage ? (
                                <img src={displayImage} className="w-full h-full object-cover opacity-80" alt={ex.name}/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><Play size={16}/></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <h3 className="text-xs md:text-sm font-black uppercase text-white leading-tight line-clamp-2 pr-1 md:pr-8 group-hover:text-red-500 transition-colors">{ex.name}</h3>
                             <p className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase mt-1">
                                {ex.sets} Séries • {ex.reps} Reps
                             </p>
                        </div>
                    </div>

                    {/* Corner Toggle - ADJUSTED PADDING */}
                    <div className="p-3 md:p-5 flex items-start justify-end shrink-0">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${isComplete ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-zinc-800 text-zinc-600'}`}>
                            <Power size={14} strokeWidth={3} className="md:w-4 md:h-4" />
                        </div>
                    </div>
                </div>

                {/* Tracking Section - NEW HORIZONTAL LAYOUT */}
                <div className="p-4 md:p-6 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                    
                    {/* Set Buttons Container */}
                    <div className="flex gap-2 shrink-0">
                        {Array.from({ length: totalSets }).map((_, i) => {
                            const isSetDone = completedSets[exerciseId]?.includes(i);
                            return (
                                <button 
                                    key={i}
                                    onClick={() => handleSetToggle(exerciseId, i, ex.rest)}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all active:scale-95 border ${isSetDone ? 'bg-green-600 border-green-500 text-white shadow-lg' : 'bg-black border-white/10 text-zinc-600 hover:border-white/30'}`}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-white/10 shrink-0 mx-1"></div>

                    {/* Stats - Horizontal now */}
                    <div className="flex gap-2 shrink-0">
                        <div className="w-16 h-12 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                            <p className="text-[6px] font-black text-zinc-500 uppercase">Reps</p>
                            <p className="text-white font-black text-sm">{ex.reps || '-'}</p>
                        </div>
                        <div className="w-20 h-12 bg-black/40 border border-white/5 rounded-xl relative overflow-hidden">
                             <p className="absolute top-1.5 left-0 w-full text-[6px] font-black text-zinc-500 uppercase text-center pointer-events-none">Carga</p>
                             <input 
                               type="number"
                               inputMode="decimal"
                               className="w-full h-full bg-transparent text-center text-red-500 font-black text-sm pt-3 outline-none focus:bg-white/5 transition-colors"
                               placeholder="-"
                               value={loadMap[exerciseId] || ''}
                               onChange={(e) => setLoadMap({...loadMap, [exerciseId]: e.target.value})}
                               onClick={(e) => e.stopPropagation()}
                             />
                        </div>
                    </div>

                </div>
              </div>
            );
          })}
          
          {/* COMPLETE WORKOUT BUTTON - FIXED BOTTOM OR IN FLOW */}
          <div className="pt-8 pb-10">
              <button 
                onClick={handleFinishWorkout}
                disabled={isFinishing}
                className={`w-full py-6 rounded-[2rem] font-black uppercase text-xl text-white shadow-xl animate-in slide-in-from-bottom-4 active:scale-95 transition-transform flex items-center justify-center gap-3 ${isWorkoutComplete ? 'bg-green-600 shadow-[0_0_30px_rgba(22,163,74,0.4)]' : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                 {isFinishing ? (
                    <Loader2 className="animate-spin" size={24} />
                 ) : (
                    <>
                        <Trophy size={24} className={isWorkoutComplete ? "text-green-200" : "text-zinc-500"} /> 
                        {isWorkoutComplete ? "FINALIZAR TREINO" : "ENCERRAR TREINO"}
                    </>
                 )}
              </button>
              
              {!isWorkoutComplete && !isFinishing && (
                <p className="text-[9px] font-bold text-center text-zinc-600 uppercase mt-4 tracking-widest">
                    Alguns exercícios pendentes (Pode encerrar mesmo assim)
                </p>
              )}
          </div>

        </div>
      ) : <div className="p-20 text-center opacity-30 italic text-[10px] font-black uppercase text-center">Pendente de prescrição PhD.</div>}
      
      {/* EXPANDED EXERCISE MODAL (LOOP VIEW) */}
      {expandedExercise && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                <button 
                    onClick={() => setExpandedExercise(null)} 
                    className="absolute top-6 right-6 z-50 bg-black/50 p-3 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-red-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
                  {loadingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-20">
                      <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500 mt-4">Rendering 8K Motion...</span>
                    </div>
                  ) : (generatedImages[expandedExercise.name] || expandedExercise.thumb) ? (
                    <div className="w-full h-full relative video-motion-engine">
                      <img src={generatedImages[expandedExercise.name] || expandedExercise.thumb} alt={expandedExercise.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500">
                        <Activity size={32} />
                        <span className="text-[10px] font-bold mt-2">Imagem Indisponível</span>
                    </div>
                  )}
                  {/* Progress Bar Effect */}
                  <div className="absolute bottom-0 left-0 w-full bg-white/10 h-1">
                      <div className="video-progress-bar w-full h-full"></div>
                  </div>
                </div>

                <div className="p-10">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">{expandedExercise.name}</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                                <Zap size={14} className="fill-amber-500" /> Biomecânica Aplicada
                            </h4>
                            <p className="text-neutral-400 text-sm leading-relaxed font-medium border-l-2 border-amber-500/20 pl-4">{expandedExercise.description || "Execução com controle de cadência e pico de contração."}</p>
                        </div>
                        
                        <div className="flex gap-2 justify-center pt-4">
                            <div className="bg-black border border-white/10 px-6 py-4 rounded-2xl text-center flex-1">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase">Séries</p>
                                <p className="text-2xl font-black text-white">{expandedExercise.sets || '-'}</p>
                            </div>
                            <div className="bg-black border border-white/10 px-6 py-4 rounded-2xl text-center flex-1">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase">Reps</p>
                                <p className="text-2xl font-black text-white">{expandedExercise.reps || '-'}</p>
                            </div>
                            <div className="bg-black border border-white/10 px-6 py-4 rounded-2xl text-center flex-1">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase">Rec</p>
                                <p className="text-2xl font-black text-white">{expandedExercise.rest || '-'}s</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <EliteFooter />
    </div>
  );
}

export function WorkoutCounterView({ student, onBack, onSaveHistory }: { student: Student, onBack: () => void, onSaveHistory: (h: WorkoutHistoryEntry[]) => void }) {
    const history = student.workoutHistory || [];
    const workouts = student.workouts || [];
    const [currentDate, setCurrentDate] = useState(new Date());

    // Sort by date desc for history list
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

    // Calendar Generation
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentDate]);

    const firstDayOffset = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    }, [currentDate]);

    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const today = new Date().toISOString().split('T')[0];

    // Helper to identify workout type color
    const getWorkoutColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('treino a') || lower.includes('peito')) return 'bg-red-600';
        if (lower.includes('treino b') || lower.includes('costas')) return 'bg-blue-600';
        if (lower.includes('treino c') || lower.includes('perna')) return 'bg-green-600';
        return 'bg-zinc-600';
    };

    return (
        <div className="p-6 pb-48 text-white overflow-y-auto h-screen text-left custom-scrollbar relative">
            <header className="flex items-center justify-between mb-8 text-left sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white text-left hover:bg-red-600 transition-colors">
                        <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white"/>
                    </button>
                    <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-left">
                        Histórico & Calendário
                    </h2>
                </div>
                <SyncStatus />
            </header>

            {/* CALENDAR VIEW */}
            <Card className="p-6 mb-8 bg-zinc-900">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black uppercase text-xl text-white italic">{monthName}</h3>
                   <div className="flex gap-2">
                       {/* Simple navigation could go here */}
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} className="text-center text-[10px] font-bold text-zinc-600 uppercase">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty slots */}
                    {Array.from({length: firstDayOffset}).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
                    
                    {/* Days */}
                    {Array.from({length: daysInMonth}).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const isToday = dateStr === today;
                        const dayWorkouts = history.filter(h => h.date === dateStr);
                        
                        return (
                           <div key={day} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative ${isToday ? 'border-red-600 bg-red-600/10' : 'border-zinc-800 bg-black'}`}>
                               <span className={`text-xs font-bold ${isToday ? 'text-red-500' : 'text-zinc-400'}`}>{day}</span>
                               
                               {/* Dots for workouts */}
                               <div className="flex gap-1 mt-1">
                                   {dayWorkouts.map((w, idx) => (
                                       <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getWorkoutColor(w.name)}`} title={w.name}></div>
                                   ))}
                               </div>
                           </div>
                        );
                    })}
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest pl-2 flex items-center gap-2">
                    <History size={14}/> Histórico Detalhado
                </h3>
                {sortedHistory.length === 0 ? (
                    <p className="text-center text-zinc-500 text-xs py-10 italic">Nenhum treino registrado ainda.</p>
                ) : (
                    sortedHistory.map((h) => (
                        <div key={h.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getWorkoutColor(h.name)}`}></div>
                                    <p className="font-black text-sm text-white uppercase italic">{h.name}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-zinc-500 bg-black px-2 py-0.5 rounded flex items-center gap-1">
                                        <Calendar size={10}/> {new Date(h.date).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 bg-black px-2 py-0.5 rounded flex items-center gap-1">
                                        <Timer size={10}/> {h.duration} min
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center">
                                <CheckCircle2 size={16} className="text-green-600"/>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <EliteFooter />
        </div>
    );
}

export function StudentAssessmentView({ student, onBack }: { student: Student, onBack: () => void }) {
    const assessments = student.physicalAssessments || [];
    const latest = assessments[0];
    const results = latest ? calculateAssessmentResults(latest, student) : null;

    return (
        <div className="p-6 pb-48 text-white overflow-y-auto h-screen text-left custom-scrollbar relative">
             <header className="flex items-center justify-between mb-10 text-left sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white text-left hover:bg-red-600 transition-colors">
                        <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white"/>
                    </button>
                    <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-left">
                        Avaliação Física
                    </h2>
                </div>
                <SyncStatus />
            </header>

            {!latest ? (
                <div className="text-center py-20 text-zinc-500">
                    <Activity size={48} className="mx-auto mb-4 opacity-20"/>
                    <p className="text-xs font-bold uppercase">Nenhuma avaliação registrada pelo professor.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 text-center">
                         <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Data da Avaliação</p>
                         <p className="text-xl font-black text-white">{new Date(latest.data).toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-5 bg-zinc-900 border-zinc-800">
                             <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                 <Scale size={14} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Peso</span>
                             </div>
                             <p className="text-2xl font-black text-white">{latest.peso} <span className="text-sm text-zinc-500">kg</span></p>
                        </Card>
                        <Card className="p-5 bg-zinc-900 border-zinc-800">
                             <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                 <Ruler size={14} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Altura</span>
                             </div>
                             <p className="text-2xl font-black text-white">{latest.altura} <span className="text-sm text-zinc-500">cm</span></p>
                        </Card>
                         <Card className="p-5 bg-zinc-900 border-zinc-800">
                             <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                 <Activity size={14} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Gordura (BF)</span>
                             </div>
                             <p className="text-2xl font-black text-white">{results?.bf || latest.bio_percentual_gordura || '-'} <span className="text-sm text-zinc-500">%</span></p>
                        </Card>
                        <Card className="p-5 bg-zinc-900 border-zinc-800">
                             <div className="flex items-center gap-2 mb-2 text-zinc-500">
                                 <Dumbbell size={14} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Massa Magra</span>
                             </div>
                             <p className="text-2xl font-black text-white">{results?.massaMagra || latest.bio_massa_magra || '-'} <span className="text-sm text-zinc-500">kg</span></p>
                        </Card>
                    </div>

                    {latest.aiAnalysis && (
                        <Card className="p-6 bg-zinc-900 border-indigo-500/30">
                            <h3 className="text-[10px] font-black uppercase text-indigo-400 mb-4 flex items-center gap-2">
                                <Brain size={14}/> Análise IA
                            </h3>
                            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                {latest.aiAnalysis}
                            </p>
                        </Card>
                    )}
                </div>
            )}
            <EliteFooter />
        </div>
    );
}

export function RunningDashboard({ student, onBack }: { student: Student, onBack: () => void }) {
    return (
        <div className="h-screen overflow-y-auto bg-black pb-20 custom-scrollbar">
             <div className="p-6">
                <RunTrackStudentView student={student} onBack={onBack} />
             </div>
        </div>
    );
}