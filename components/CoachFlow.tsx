
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, LogOut, ChevronRight, Edit3, Plus, 
  Trash2, Loader2, Brain, Activity, Target, TrendingUp, 
  BookOpen, Zap, AlertCircle, Dumbbell,
  Image as ImageIcon, Save, Book, Ruler, Scale, Footprints,
  Users, Info, Sparkles, LayoutGrid, Calendar, Clock, Play, FileText, Folder
} from 'lucide-react';
import { Card, EliteFooter, Logo } from './Layout';
import { Student, Exercise, PhysicalAssessment, Workout } from '../types';
import { generateExerciseImage, generatePeriodizationPlan, generateTechnicalCue } from '../services/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { RunTrackCoachView } from './RunTrack';

const EXERCISE_DATABASE: Record<string, string[]> = {
  "Peito": [
    "Supino Reto", 
    "Supino Inclinado", 
    "Crucifixo", 
    "Cross Over", 
    "Peck Deck", 
    "Supino Sentado Aberto na Máquina", 
    "Supino Sentado Fechado na Máquina", 
    "Supino Unilateral Deitado Aberto na Máquina", 
    "Supino Unilateral Deitado Fechado na Máquina", 
    "Supino Unilateral Inclinado Aberto na Máquina", 
    "Supino Unilateral Inclinado Fechado na Máquina"
  ],
  "Costas": ["Puxada Alta", "Remada Curvada", "Remada Baixa", "Puxada Triângulo", "Pull Down"],
  "Perna": ["Agachamento", "Leg Press", "Extensora", "Stiff", "Cadeira Flexora", "Elevação Pélvica"],
  "Ombro": ["Desenvolvimento", "Abdução Lateral", "Remada Alta", "Frontal"],
  "Braços": ["Rosca Direta", "Tríceps Pulley", "Rosca Martelo", "Tríceps Corda", "Rosca Scott"],
  "Core": ["Prancha", "Abdominal Supra", "Abdominal Infra", "Oblíquos"]
};

export function ProfessorDashboard({ students, onLogout, onSelect }: { students: Student[], onLogout: () => void, onSelect: (s: Student) => void }) {
  const [search, setSearch] = useState('');
  
  const filtered = students.filter(s => 
    (s.nome?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="p-6 animate-fadeIn pb-32 text-white h-screen overflow-y-auto custom-scrollbar text-left">
      <header className="flex items-center justify-between mb-10">
        <Logo size="text-4xl" />
        <button onClick={onLogout} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-red-600 transition-colors">
          <LogOut size={20} />
        </button>
      </header>
      <div className="mb-8">
        <input 
          type="text" 
          placeholder="Buscar aluno..." 
          className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] text-white outline-none focus:border-red-600 text-sm font-bold uppercase"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(student => (
          <Card key={student.id} onClick={() => onSelect(student)} className="p-6 hover:border-red-600/50 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                <img src={student.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-full h-full object-cover" alt={student.nome} />
              </div>
              <div className="flex-1">
                <h3 className="font-black uppercase text-lg truncate">{student.nome}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase truncate">{student.email}</p>
              </div>
              <ChevronRight size={20} className="text-zinc-800 group-hover:text-red-600" />
            </div>
          </Card>
        ))}
      </div>
      <EliteFooter />
    </div>
  );
}

export function StudentManagement({ student, onBack, onNavigate, onEditWorkout }: { student: Student, onBack: () => void, onNavigate: (v: string) => void, onEditWorkout: (w: Workout | null) => void }) {
  const existingWorkouts = student.workouts || [];

  return (
    <div className="p-6 animate-fadeIn pb-32 text-white h-screen overflow-y-auto custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Gestão do Aluno</h2>
      </header>

      <div className="bg-zinc-900 border-2 border-red-600/30 p-8 rounded-[3.5rem] text-center mb-8 relative overflow-hidden shadow-2xl">
        <div className="w-24 h-24 rounded-full mx-auto border-4 border-red-600 mb-4 overflow-hidden bg-zinc-800">
           <img src={student.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-full h-full object-cover" alt="Perfil" />
        </div>
        <h3 className="text-3xl font-black italic uppercase leading-none tracking-tighter">{student.nome}</h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">{student.email}</p>
      </div>

      <div className="space-y-4">
        <button onClick={() => onNavigate('PERIODIZATION')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-800 transition-all shadow-lg">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20"><Brain className="w-6 h-6 text-indigo-500" /></div>
              <div className="text-left"><span className="font-black uppercase text-sm italic tracking-tighter">Periodização (IA)</span><p className="text-[7px] text-zinc-500 font-bold uppercase">Criar Macrociclo & Volume</p></div>
           </div>
           <ChevronRight size={20} className="text-zinc-700 group-hover:text-white" />
        </button>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4 mb-2 block italic text-white/50">Planilhas Ativas</label>
          {existingWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {existingWorkouts.map((w) => (
                <button key={w.id} onClick={() => { onEditWorkout(w); onNavigate('WORKOUT_EDITOR'); }} className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2rem] flex items-center justify-between group hover:border-red-600/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-600/20"><Dumbbell className="w-5 h-5 text-red-600" /></div>
                    <span className="font-black uppercase text-xs italic tracking-tighter">{w.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">{w.exercises.length} Exercícios</span>
                    <Edit3 size={16} className="text-zinc-700 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] text-zinc-600 italic text-[10px] uppercase">
              Nenhuma planilha prescrita
            </div>
          )}
        </div>

        <button onClick={() => { onEditWorkout(null); onNavigate('WORKOUT_EDITOR'); }} className="w-full bg-red-600 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-red-700 transition-all shadow-xl group">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform"><Plus className="w-6 h-6 text-white" /></div>
              <div className="text-left"><span className="font-black uppercase text-sm italic tracking-tighter">Novo Treino</span><p className="text-[7px] text-white/50 font-bold uppercase">Metodologia Elite PhD 🦾</p></div>
           </div>
           <ChevronRight size={20} className="text-white" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate('COACH_ASSESSMENT')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-800 transition-all shadow-lg">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center border border-emerald-500/20"><Ruler className="w-5 h-5 text-emerald-500" /></div>
                <div className="text-left"><span className="font-black uppercase text-[10px] italic tracking-tighter leading-tight">Avaliação<br/>Física</span></div>
            </div>
          </button>
          <button onClick={() => onNavigate('RUNTRACK_ELITE')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-800 transition-all shadow-lg">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center border border-orange-500/20"><Footprints className="w-5 h-5 text-orange-500" /></div>
                <div className="text-left"><span className="font-black uppercase text-[10px] italic tracking-tighter leading-tight">RunTrack<br/>Elite</span></div>
            </div>
          </button>
        </div>
      </div>
      <EliteFooter />
    </div>
  );
}

export function PeriodizationView({ student, onBack, onProceedToWorkout }: { student: Student, onBack: () => void, onProceedToWorkout: () => void }) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: student.nome,
    level: 'intermediario',
    goal: 'Hipertrofia',
    phase: 'base',
    model: 'ondulatorio',
    daysPerWeek: '4',
    concurrent: true
  });
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setStep('loading');
    setError(null);
    
    const timeout = setTimeout(() => {
      if (step === 'loading') {
        setError("Tempo de resposta excedido. Verifique sua conexão.");
        setStep('form');
      }
    }, 30000);

    try {
      const plan = await generatePeriodizationPlan(formData);
      clearTimeout(timeout);

      if (plan) {
        setResult(plan);
        setStep('result');
        
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
          await setDoc(docRef, { 
            periodization: { ...plan, startDate: new Date().toISOString() } 
          }, { merge: true });
        } catch (e: any) {
          console.warn("Firestore error (Likely API disabled):", e.message);
        }
      } else {
        throw new Error("IA returned null");
      }
    } catch (e) {
      clearTimeout(timeout);
      setError("Falha na geração científica. Tente novamente.");
      setStep('form');
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white bg-black text-left custom-scrollbar">
      <header className="flex items-center gap-4 mb-10">
         <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full"><ArrowLeft size={20}/></button>
         <h2 className="text-xl font-black italic uppercase tracking-tighter">Ciência<span className="text-red-600">Força</span></h2>
      </header>

      {step === 'form' && (
        <Card className="p-8 bg-zinc-900 border-l-4 border-l-red-600">
           <div className="flex items-center gap-4 mb-8">
              <Brain className="text-red-600" size={32} />
              <div><h3 className="text-2xl font-black italic uppercase tracking-tight">Anamnese Avançada</h3><p className="text-[10px] text-zinc-500 font-bold uppercase">Protocolo PBE • EEFD/UFRJ</p></div>
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Condição Biológica Atual</label>
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-red-600">
                   <option value="iniciante">Adaptação Neura</option>
                   <option value="intermediario">Retomada (Sem ritmo)</option>
                   <option value="avancado">Atleta de Performance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Dias/Semana</label>
                    <input type="number" value={formData.daysPerWeek} onChange={e => setFormData({...formData, daysPerWeek: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Objetivo</label>
                    <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl font-bold">
                       <option value="Hipertrofia">Hipertrofia</option>
                       <option value="Emagrecimento">Emagrecimento</option>
                       <option value="Força Pura">Força Pura</option>
                    </select>
                 </div>
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
              <button onClick={handleGenerate} className="w-full mt-6 bg-red-600 hover:bg-red-700 py-6 rounded-[2.5rem] font-black uppercase text-xs flex items-center justify-center gap-2 shadow-xl">
                <Brain size={16}/> Gerar Planilha de Carga
              </button>
           </div>
        </Card>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-pulse">
           <div className="relative">
              <div className="w-24 h-24 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
              <Activity size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600" />
           </div>
           <div className="text-center">
              <p className="text-xl font-black uppercase tracking-widest text-white">Analisando Biomecânica & Carga</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Aplicando modelos de Bompa & Tudor...</p>
           </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl">
              <p className="text-[9px] font-black uppercase text-red-600 mb-2 tracking-[0.2em]">{result.modelo_teorico}</p>
              <h1 className="text-2xl font-black italic uppercase text-white mb-2 leading-none">{result.titulo}</h1>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">{result.objetivo_longo_prazo}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.microciclos?.map((m: any, i: number) => (
                <Card key={i} className="p-6 bg-zinc-900 border-zinc-800">
                   <h4 className="text-[11px] font-black text-white uppercase mb-4 leading-tight">SEMANA {m.semana}:<br/><span className="text-red-600">{m.tipo} ({m.foco})</span></h4>
                   <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center"><span className="text-[9px] text-zinc-500 font-bold uppercase">RPE:</span><span className="text-[10px] font-black text-white">{m.pse_alvo}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[9px] text-zinc-500 font-bold uppercase">VOLUME:</span><span className="text-[10px] font-black text-white">{m.faixa_repeticoes}</span></div>
                   </div>
                </Card>
              ))}
           </div>

           <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
              <h3 className="text-amber-500 font-black uppercase text-xs mb-4 flex items-center gap-3">
                 <BookOpen size={16} /> NOTAS PHD
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium italic opacity-80">
                 {result.notas_phd}
              </p>
           </div>

           <div className="flex gap-4 pt-4">
              <button onClick={() => setStep('form')} className="flex-1 py-6 bg-zinc-800/50 border border-zinc-800 rounded-[2.5rem] font-black uppercase text-[11px] text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95">REFAZER</button>
              <button 
                onClick={onProceedToWorkout} 
                className="flex-[2] py-6 bg-red-600 rounded-[2.5rem] font-black uppercase text-[11px] text-white shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                MONTAR EXERCÍCIOS
              </button>
           </div>
        </div>
      )}
      <EliteFooter />
    </div>
  );
}

// --- REDESIGNED WORKOUT EDITOR (PHD VERSION MATCHING FIGURE 2) ---
export function WorkoutEditorView({ student, workoutToEdit, onBack, onSave }: { student: Student, workoutToEdit: Workout | null, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const defaultTitle = student.workouts && student.workouts.length > 0 
    ? `TREINO ${String.fromCharCode(65 + student.workouts.length)}` 
    : "TREINO A";
    
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(workoutToEdit || { 
    id: Date.now().toString(), 
    title: defaultTitle, 
    exercises: [],
    startDate: new Date().toLocaleDateString('pt-BR'),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    frequencyWeekly: 3
  });

  const [selectedMuscle, setSelectedMuscle] = useState("Peito");
  const [options, setOptions] = useState<string[]>(EXERCISE_DATABASE["Peito"]);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewEx, setPreviewEx] = useState<Exercise | null>(null);

  useEffect(() => {
    if (selectedMuscle) setOptions(EXERCISE_DATABASE[selectedMuscle] || []);
  }, [selectedMuscle]);

  const addEx = async (name: string) => {
    setImageLoading(true);
    const img = await generateExerciseImage(name);
    const cue = await generateTechnicalCue(name);
    const newEx: Exercise = { id: Math.random().toString(), name, thumb: img, description: cue, sets: '3', reps: '10-12', rest: '60s' };
    setCurrentWorkout({...currentWorkout, exercises: [...currentWorkout.exercises, newEx]});
    setPreviewEx(newEx);
    setImageLoading(false);
  };

  const handleSave = () => {
    const existingWorkouts = student.workouts || [];
    const workoutIndex = existingWorkouts.findIndex(w => w.id === currentWorkout.id);
    let updatedWorkouts;
    if (workoutIndex >= 0) {
      updatedWorkouts = [...existingWorkouts];
      updatedWorkouts[workoutIndex] = currentWorkout;
    } else {
      updatedWorkouts = [...existingWorkouts, currentWorkout];
    }
    onSave(student.id, { workouts: updatedWorkouts });
    onBack();
  };

  return (
    <div className="p-4 md:p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar bg-black text-left">
      <header className="flex items-center justify-between mb-8 sticky top-0 bg-black/90 backdrop-blur-md z-50 py-4 -mx-6 px-6 border-b border-white/5">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"><ArrowLeft size={20}/></button>
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-1">Prescreve<span className="text-red-600">AI</span></h2>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">{currentWorkout.title}</p>
        </div>
        <button onClick={handleSave} className="bg-green-600 px-8 py-3 rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-green-900/20 hover:bg-green-700 active:scale-95 transition-all text-white">Salvar</button>
      </header>

      {/* IDENTIFICAÇÃO DO TREINO (FIGURA 2) */}
      <Card className="mb-8 p-6 bg-zinc-900/50 border-zinc-800/50">
         <h4 className="text-orange-500 font-black uppercase text-[10px] tracking-widest mb-4 italic flex items-center gap-2">
            <Folder size={12} /> IDENTIFICAÇÃO DO TREINO
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1 space-y-1.5">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Planilha</label>
               <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input value={currentWorkout.title} onChange={e => setCurrentWorkout({...currentWorkout, title: e.target.value})} className="w-full bg-black p-4 pl-12 rounded-xl text-sm font-black uppercase outline-none focus:border-red-600 border border-white/5" placeholder="TREINO A" />
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Início</label>
               <input value={currentWorkout.startDate} onChange={e => setCurrentWorkout({...currentWorkout, startDate: e.target.value})} className="w-full bg-black p-4 rounded-xl text-sm font-bold outline-none border border-white/5 text-zinc-300" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">Fim</label>
               <input value={currentWorkout.endDate} onChange={e => setCurrentWorkout({...currentWorkout, endDate: e.target.value})} className="w-full bg-black p-4 rounded-xl text-sm font-bold outline-none border border-white/5 text-zinc-300" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic text-zinc-600">Freq.</label>
               <input type="number" value={currentWorkout.frequencyWeekly} onChange={e => setCurrentWorkout({...currentWorkout, frequencyWeekly: Number(e.target.value)})} className="w-full bg-black p-4 rounded-xl text-sm font-black outline-none border border-white/5 text-white" />
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR: INVENTÁRIO (FIGURA 2) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-2xl min-h-[60vh] flex flex-col">
             <h4 className="text-zinc-400 font-black uppercase text-[10px] tracking-widest mb-6 italic border-b border-white/5 pb-4">
                INVENTÁRIO PRESCRITO
             </h4>
             <select onChange={e => setSelectedMuscle(e.target.value)} className="w-full bg-black p-4 rounded-2xl text-xs font-black uppercase border-2 border-red-600/50 mb-6 outline-none focus:border-red-600 transition-all text-white">
                {Object.keys(EXERCISE_DATABASE).map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             
             <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {options.map(ex => (
                  <button 
                    key={ex} 
                    onClick={() => addEx(ex)} 
                    disabled={imageLoading} 
                    className="w-full text-left p-4 rounded-xl text-[10px] font-black uppercase bg-black border border-white/5 hover:border-red-600/50 hover:bg-zinc-800 transition-all flex items-center justify-between group active:scale-[0.98] text-zinc-300"
                  >
                    <span className="truncate max-w-[80%]">{ex}</span>
                    {imageLoading ? <Loader2 size={12} className="animate-spin text-zinc-600" /> : <ChevronRight size={14} className="text-zinc-700 group-hover:text-red-600" />}
                  </button>
                ))}
             </div>
          </Card>
        </div>

        {/* ÁREA DE VISUALIZAÇÃO BIOMECÂNICA (FIGURA 2) */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] aspect-video w-full relative overflow-hidden flex items-center justify-center shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent z-10"></div>
                {previewEx?.thumb ? (
                    <img src={previewEx.thumb} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Preview" />
                ) : (
                    <div className="flex flex-col items-center gap-6 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Activity className="text-zinc-600 animate-pulse" size={80} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Análise de Performance</p>
                    </div>
                )}
                {previewEx && (
                    <div className="absolute bottom-6 left-6 z-20">
                        <h4 className="text-xl font-black italic uppercase text-white drop-shadow-lg">{previewEx.name}</h4>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2"><Sparkles size={10} className="text-red-600" /> Biomecânica validada via IA</p>
                    </div>
                )}
           </div>

           {/* SEQUÊNCIA MONTADA */}
           <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase text-zinc-500 ml-4 italic flex items-center gap-2 tracking-widest">
                 <LayoutGrid size={14}/> SEQUÊNCIA MONTADA
              </h3>
              
              {currentWorkout.exercises.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[3.5rem] text-zinc-700 italic text-[10px] uppercase flex flex-col items-center gap-4 bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800"><Dumbbell className="text-zinc-800" size={32} /></div>
                    SELECIONE EXERCÍCIOS AO LADO PARA COMPOR O TREINO
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWorkout.exercises.map((ex, i) => (
                        <Card key={ex.id} onClick={() => setPreviewEx(ex)} className={`p-5 flex items-center gap-4 border-2 transition-all cursor-pointer ${previewEx?.id === ex.id ? 'border-red-600/50 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/50 hover:border-white/10'}`}>
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/5">
                                {ex.thumb ? <img src={ex.thumb} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-4 text-zinc-800" size={24}/>}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black uppercase text-xs italic truncate">{ex.name}</h4>
                                <div className="flex gap-2 mt-2">
                                    <div className="bg-black/40 px-2 py-1 rounded text-[8px] font-black text-zinc-400 uppercase">S: {ex.sets}</div>
                                    <div className="bg-black/40 px-2 py-1 rounded text-[8px] font-black text-zinc-400 uppercase">R: {ex.reps}</div>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentWorkout({...currentWorkout, exercises: currentWorkout.exercises.filter((_, idx) => idx !== i)}); }} className="text-zinc-800 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                        </Card>
                    ))}
                </div>
              )}
           </div>
        </div>
      </div>
      <EliteFooter />
    </div>
  );
}

export function CoachAssessmentView({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const [formData, setFormData] = useState<Partial<PhysicalAssessment>>({
    data: new Date().toISOString().split('T')[0],
    peso: '', altura: ''
  });
  const handleSave = () => {
    const assessment = { id: Date.now().toString(), ...formData } as PhysicalAssessment;
    onSave(student.id, { physicalAssessments: [assessment, ...(student.physicalAssessments || [])] });
    onBack();
  };
  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white bg-black text-left custom-scrollbar">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-white"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Ficha PhD: <span className="text-red-600">{student.nome}</span></h2>
      </header>
      <div className="space-y-6 max-w-lg mx-auto">
        <Card className="p-6 bg-zinc-900">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase italic">Peso (kg)</label><input type="number" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600 font-bold"/></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase italic">Altura (cm)</label><input type="number" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600 font-bold"/></div>
           </div>
        </Card>
        <button onClick={handleSave} className="w-full py-5 bg-red-600 rounded-[2rem] font-black uppercase text-sm shadow-xl shadow-red-900/20 active:scale-95 transition-all">Finalizar Registro</button>
      </div>
    </div>
  );
}

export function RunTrackManager({ student, onBack }: { student: Student, onBack: () => void }) {
  return <div className="h-screen overflow-y-auto bg-black custom-scrollbar"><RunTrackCoachView student={student} onBack={onBack} /></div>;
}
