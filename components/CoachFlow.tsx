
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, LogOut, ChevronRight, Edit3, Plus, 
  Trash2, Loader2, Brain, Activity, Target, TrendingUp, 
  BookOpen, Clock, Zap, Sparkles, AlertCircle, Dumbbell,
  RefreshCcw, Image as ImageIcon, Save, Book
} from 'lucide-react';
import { Card, EliteFooter, Logo } from './Layout';
import { Student, Exercise, PhysicalAssessment, Workout } from '../types';
import { generateExerciseImage, generatePeriodizationPlan, generateTechnicalCue } from '../services/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';

const EXERCISE_DATABASE: Record<string, string[]> = {
  "Peito": ["Supino Reto com HBL", "Crucifixo com HBC", "Supino Inclinado com HBC", "Cross Over Polia Alta"],
  "Costas": ["Puxada Aberta", "Remada Curvada com HBL", "Remada Baixa Triângulo", "Pullover com HBC"],
  "Perna": ["Agachamento Livre", "Leg Press 45", "Extensora", "Mesa Flexora", "Stiff"],
  "Ombro": ["Desenvolvimento Arnold", "Abdução Lateral HBC", "Remada Alta", "Crucifixo Inverso"],
  "Braços": ["Rosca Direta HBM", "Tríceps Testa", "Rosca Martelo", "Tríceps Corda"],
  "Core": ["Prancha Ventral", "Abdominal Infra Solo", "Mata-borrão"]
};

export function ProfessorDashboard({ students, onLogout, onSelect }: { students: Student[], onLogout: () => void, onSelect: (s: Student) => void }) {
  return (
    <div className="p-6 animate-fadeIn text-white pb-10 h-screen overflow-y-auto custom-scrollbar text-left">
      <header className="flex justify-between items-start mb-12">
        <Logo size="text-4xl" subSize="text-[8px]" />
        <button onClick={onLogout} className="p-3 bg-zinc-900 rounded-2xl text-white shadow-xl active:scale-95 transition-all hover:bg-red-600"><LogOut className="w-4 h-4" /></button>
      </header>
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] px-4 mb-2">Diretoria de Atletas ABFIT</h3>
        {students.map(s => (
          <button key={s.id} onClick={() => onSelect(s)} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-xl hover:border-red-600/30">
            <div className="flex items-center gap-5 text-left">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 bg-zinc-800 shadow-2xl">
                <img src={s.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-full h-full object-cover" alt="Perfil" />
              </div>
              <div className="text-left">
                <p className="font-black uppercase text-base leading-tight text-white tracking-tighter">{s.nome}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">{s.email}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-inner"><ChevronRight className="text-zinc-700 group-hover:text-white" /></div>
          </button>
        ))}
      </div>
      <EliteFooter />
    </div>
  );
}

export function StudentManagement({ student, onBack, onNavigate }: { student: Student, onBack: () => void, onNavigate: (v: string) => void }) {
  return (
    <div className="p-6 animate-fadeIn pb-32 text-white h-screen overflow-y-auto custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Gestão do Aluno</h2>
      </header>
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3.5rem] text-center mb-8 relative overflow-hidden shadow-2xl">
        <img src={student.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-28 h-28 rounded-[2.5rem] mx-auto border-4 border-red-600 mb-4 shadow-2xl bg-zinc-800 object-cover" alt="Perfil" />
        <h3 className="text-3xl font-black italic uppercase leading-none tracking-tighter">{student.nome}</h3>
      </div>
      <div className="space-y-4">
        <button onClick={() => onNavigate('PERIODIZATION')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between text-white active:bg-zinc-800 shadow-lg group transition-all hover:border-indigo-500/50">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors"><Brain className="w-6 h-6 text-indigo-500 group-hover:text-white" /></div>
              <div><span className="font-black uppercase text-sm italic tracking-tighter">Periodização PhD</span><p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">Macro/Meso & Variáveis</p></div>
           </div>
           <ChevronRight size={20} className="text-zinc-700 group-hover:text-white" />
        </button>
        <button onClick={() => onNavigate('WORKOUT_EDITOR')} className="w-full bg-red-600 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl active:scale-95 transition-all text-white group hover:bg-red-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><Edit3 className="w-6 h-6 text-white" /></div>
            <div><span className="font-black uppercase text-sm italic tracking-tighter">Prescrever Exercícios</span><p className="text-[7px] text-white/50 font-bold uppercase tracking-widest">Montagem Técnica</p></div>
          </div>
          <Plus size={20} />
        </button>
      </div>
      <EliteFooter />
    </div>
  );
}

export function PeriodizationView({ student, onBack, onProceedToWorkout }: { student: Student, onBack: () => void, onProceedToWorkout: () => void }) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: student.nome,
    level: 'intermediario',
    goal: 'hipertrofia_miofibrilar',
    phase: 'base',
    model: 'ondulatorio',
    daysPerWeek: '4',
    concurrent: true,
    injuries: student.injuryHistory || ''
  });
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setStep('loading');
    setErrorMsg(null);
    try {
      const plan = await generatePeriodizationPlan(formData);
      if (plan) {
        setResult(plan);
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
          await setDoc(docRef, { periodization: { ...plan, startDate: new Date().toISOString() } }, { merge: true });
        } catch (dbErr) {
          console.error("Firestore Save Error:", dbErr);
          setErrorMsg("Aviso: Plano gerado, mas erro ao salvar no banco (API do Firebase desativada).");
        }
        setStep('result');
      } else {
        throw new Error("Falha na geração da IA");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erro ao gerar periodização. Tente novamente.");
      setStep('form');
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left bg-black">
      <header className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
           <h2 className="text-xl font-black italic uppercase tracking-tighter">Periodização<span className="text-red-600">PhD</span></h2>
         </div>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {step === 'form' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <Card className="p-8 bg-zinc-900/50 border-l-4 border-l-indigo-600 border border-white/5">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20"><BookOpen size={24} className="text-white"/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Setup Científico</h3>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Metodologia: EEFD/UFRJ & Matveev</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nível Biológico</label>
                      <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors">
                         <option value="iniciante">Iniciante (Adaptação)</option>
                         <option value="intermediario">Intermediário (Consolidação)</option>
                         <option value="avancado">Avançado (Elite)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Modelo Teórico</label>
                      <select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors">
                         <option value="linear">Linear Clássica</option>
                         <option value="ondulatorio">Ondulatória Diária/Semanal</option>
                         <option value="blocos">Blocos ATR</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Fase do Macrociclo</label>
                      <select value={formData.phase} onChange={e => setFormData({...formData, phase: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors">
                         <option value="base">Acumulação / Base</option>
                         <option value="especifica">Transposição / Específica</option>
                         <option value="competitiva">Realização / Polimento</option>
                         <option value="transicao">Transição / Off-Season</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Treino Concorrente?</label>
                      <select value={formData.concurrent ? 'yes' : 'no'} onChange={e => setFormData({...formData, concurrent: e.target.value === 'yes'})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors">
                         <option value="yes">Sim (Foco Misto/Endurance)</option>
                         <option value="no">Não (Foco Força Pura)</option>
                      </select>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foco Específico</label>
                   <input type="text" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} placeholder="Ex: Hipertrofia Miofibrilar e Potência de Salto" className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors"/>
                </div>
             </div>

             <button onClick={handleGenerate} className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Brain size={20}/> PROCESSAR PLANILHA DE CARGA
             </button>
          </Card>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in">
           <div className="relative">
              <Loader2 size={80} className="text-indigo-600 animate-spin opacity-20"/>
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={32} />
           </div>
           <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.4em] text-white">Analisando Biomecânica & Carga</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 tracking-widest">Aplicando algoritmos de Issurin & Verkhoshansky...</p>
           </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 max-w-4xl mx-auto">
           <Card className="p-8 bg-zinc-900 border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Target size={200} className="text-indigo-500"/></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-md uppercase">PROTOCOLOS PhD</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest italic">{result.modelo_teorico}</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-6 tracking-tighter">{result.titulo}</h1>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2"><Target size={14}/> Estratégia do Meso</h4>
                       <p className="text-zinc-300 leading-relaxed font-medium">{result.objetivo_longo_prazo}</p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-rose-400 tracking-widest flex items-center gap-2"><Zap size={14}/> Gestão de Volume</h4>
                       <p className="text-zinc-300 leading-relaxed font-medium">{result.distribuicao_volume}</p>
                    </div>
                 </div>
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {result.microciclos.map((m: any, i: number) => (
                <div key={i} className={`p-6 rounded-[2.5rem] border transition-all ${m.tipo === 'Choque' ? 'bg-red-950/40 border-red-500' : 'bg-zinc-900 border-white/5'}`}>
                   <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${m.tipo === 'Choque' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>Semana {m.semana}</span>
                      <TrendingUp size={16} className={m.tipo === 'Choque' ? "text-red-400" : "text-zinc-700"} />
                   </div>
                   <h3 className="font-black text-base mb-4 uppercase italic tracking-tight text-white leading-tight">{m.tipo}: {m.foco}</h3>
                   <div className="space-y-3">
                      <div className="bg-black/40 p-3 rounded-2xl">
                         <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Intensidade (RPE)</p>
                         <p className="text-lg font-black text-indigo-400">{m.pse_alvo}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-2xl">
                         <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Volume Alvo</p>
                         <p className="text-sm font-bold text-white">{m.faixa_repeticoes}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <Card className="p-8 bg-black/40 border border-white/5">
              <h4 className="text-[10px] font-black uppercase text-amber-500 mb-4 flex items-center gap-2"><Book size={14}/> Fundamentação Científica</h4>
              <p className="text-xs text-zinc-400 leading-relaxed italic whitespace-pre-wrap">{result.notas_phd}</p>
           </Card>

           <div className="flex gap-4">
              <button onClick={() => setStep('form')} className="flex-1 py-5 bg-zinc-800 rounded-3xl font-black uppercase text-xs tracking-widest text-zinc-400 hover:text-white transition-all">Refazer Anamnese</button>
              <button onClick={onProceedToWorkout} className="flex-[2] py-5 bg-red-600 rounded-3xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"><Edit3 size={16}/> Montar Sequência Técnica</button>
           </div>
        </div>
      )}
      <EliteFooter />
    </div>
  );
}

export function WorkoutEditorView({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({ id: Date.now().toString(), title: "TREINO A", exercises: [] });
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (selectedMuscle) setOptions(EXERCISE_DATABASE[selectedMuscle] || []);
  }, [selectedMuscle]);

  const addEx = async (name: string) => {
    setImageLoading(true);
    try {
      const img = await generateExerciseImage(name);
      const cue = await generateTechnicalCue(name);
      const newEx: Exercise = { id: Math.random().toString(), name, thumb: img, description: cue, sets: '3', reps: '10-12', rest: '60s' };
      setCurrentWorkout({...currentWorkout, exercises: [...currentWorkout.exercises, newEx]});
    } catch (e) {
      alert("Erro ao carregar biomecânica do exercício.");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left bg-black">
      <header className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-white"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Prescreve<span className="text-amber-500">AI</span></h2>
        <button onClick={() => { onSave(student.id, { workouts: [currentWorkout] }); onBack(); }} className="bg-green-600 px-6 py-2 rounded-2xl font-black text-[10px] uppercase">Salvar Planilha</button>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-zinc-900 border-white/5">
             <label className="text-[9px] font-black uppercase text-zinc-500 mb-4 block">Inventário Biomecânico</label>
             <select onChange={e => setSelectedMuscle(e.target.value)} className="w-full bg-black p-4 rounded-2xl text-sm font-bold border border-white/10 mb-4 outline-none">
                <option value="">Grupo Muscular...</option>
                {Object.keys(EXERCISE_DATABASE).map(m => <option key={m} value={m}>{m}</option>)}
             </select>
             <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {options.map(ex => (
                  <button key={ex} onClick={() => addEx(ex)} disabled={imageLoading} className="w-full text-left p-4 rounded-xl text-[10px] font-black uppercase bg-black border border-white/5 hover:border-amber-500 transition-all flex items-center justify-between group">
                    {ex} {imageLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} className="opacity-0 group-hover:opacity-100" />}
                  </button>
                ))}
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-2">Sessão Montada</h3>
              {currentWorkout.exercises.length === 0 && <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-600 italic">Vincule exercícios para iniciar a montagem técnica.</div>}
              {currentWorkout.exercises.map((ex, i) => (
                <Card key={ex.id} className="p-6 bg-zinc-900 flex items-center gap-6 border-white/5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black shrink-0 border border-white/10">
                    {ex.thumb ? <img src={ex.thumb} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={20}/></div>}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-sm italic">{ex.name}</h4>
                    <p className="text-[9px] text-zinc-500 mt-1 line-clamp-1">{ex.description}</p>
                    <div className="flex gap-4 mt-3">
                       <input className="w-16 bg-black border border-white/10 p-2 rounded-lg text-[10px] font-black text-center" defaultValue={ex.sets} placeholder="Séries" />
                       <input className="w-20 bg-black border border-white/10 p-2 rounded-lg text-[10px] font-black text-center" defaultValue={ex.reps} placeholder="Reps" />
                    </div>
                  </div>
                  <button onClick={() => setCurrentWorkout({...currentWorkout, exercises: currentWorkout.exercises.filter((_, idx) => idx !== i)})} className="p-3 text-zinc-700 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                </Card>
              ))}
           </div>
        </div>
      </div>
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
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left bg-black">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Ficha PhD: <span className="text-blue-500">{student.nome}</span></h2>
      </header>
      <div className="space-y-6 max-w-lg mx-auto">
        <Card className="p-6 bg-zinc-900 border-zinc-800">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Peso (kg)</label><input type="number" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Altura (cm)</label><input type="number" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/></div>
           </div>
        </Card>
        <button onClick={handleSave} className="w-full py-5 bg-blue-600 rounded-3xl font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">Finalizar Registro</button>
      </div>
    </div>
  );
}
