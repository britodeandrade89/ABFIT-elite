import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, ChevronDown, Clock, 
  HeartPulse, Target, TrendingUp, Plus, Save, Trash2, X,
  ArrowRight, Flame, Zap, BrainCircuit, History, 
  Lock, RefreshCw, Sparkles, CheckCircle2, Repeat, AlertCircle, User, Users
} from 'lucide-react';
import { 
  collection, doc, setDoc, getDoc, 
  onSnapshot, addDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { db, appId, auth } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Student } from '../types';

// --- UI COMPONENTS FROM RUNTRACK AI (Themed for ABFIT Elite) ---

const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-zinc-900 rounded-[2.5rem] shadow-xl border border-zinc-800 p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", loading = false, disabled = false }: any) => {
  const variants: any = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20",
    ai: "bg-zinc-800 border border-red-600/50 hover:bg-zinc-700 text-white shadow-lg shadow-red-500/10",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5",
    outline: "border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white",
  };
  return (
    <button 
      disabled={disabled || loading}
      onClick={onClick} 
      className={`px-6 py-3.5 rounded-2xl font-bold uppercase tracking-tight transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-xs md:text-sm ${variants[variant]} ${className}`}
    >
      {loading ? <RefreshCw className="animate-spin" size={16} /> : children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, className = "" }: any) => (
  <div className={`flex flex-col gap-1.5 w-full ${className}`}>
    {label && <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{label}</label>}
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      className="px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-black border border-white/10 focus:border-red-600 transition-all font-bold text-white outline-none w-full placeholder:text-zinc-700 text-xs md:text-sm" 
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }: any) => (
  <div className={`flex flex-col gap-1.5 w-full relative ${className}`}>
    {label && <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 ml-1">{label}</label>}
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-black border border-white/10 focus:border-red-600 transition-all font-bold appearance-none cursor-pointer pr-10 text-white outline-none text-xs md:text-sm"
      >
        {options.map((o: any) => <option key={o.value} value={o.value} className="bg-zinc-900 text-white">{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle }: any) => (
  <div className="mb-8 px-2 text-left">
    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{title}</h3>
    {subtitle && <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-3 italic tracking-widest">{subtitle}</p>}
  </div>
);

function getDayIndex(day: string) {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  return days.indexOf(day);
}

function getWorkoutColor(type: string) {
  switch (type) {
    case 'tiro': return 'bg-rose-600';
    case 'ritmo': return 'bg-orange-600';
    case 'longao': return 'bg-red-800';
    case 'fartlek': return 'bg-purple-600';
    default: return 'bg-zinc-700';
  }
}

function formatPace(decimalPace: number) {
  if (!decimalPace || isNaN(decimalPace) || !isFinite(decimalPace)) return '0:00';
  const min = Math.floor(decimalPace);
  const sec = Math.round((decimalPace - min) * 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec} min/km`;
}

// --- ANAMNESE VIEW ---

export function RunTrackAnamnese({ student, onSave, onBack }: { student: Student, onSave: (data: any) => void, onBack: () => void }) {
  const [data, setData] = useState({ 
    age: student.age || "", weight: student.weight || "", height: student.height || "", 
    goal: student.goal || "conditioning", environment: student.environment || "asphalt", timeOfDay: student.timeOfDay || "morning", 
    usesWatch: student.usesWatch || "no", limitations: student.limitations || "", medications: student.medications || "", 
    injuryHistory: student.injuryHistory || "", activeNow: student.activeNow || "yes", strengthTraining: student.strengthTraining || "yes", 
    daysPerWeek: student.daysPerWeek || "3", otherSports: student.otherSports || "" 
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
        // Save to student profile in Firebase
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
        const updatedData = { ...data, anamneseComplete: true };
        await setDoc(docRef, updatedData, { merge: true });
        onSave(updatedData);
    } catch (e) {
        console.error("Error saving anamnese", e);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 text-left">
      <SectionHeader title="Bio-Intelligence Audit" subtitle="Base científica para fundamentação da carga técnica." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-red-600 shadow-xl relative overflow-hidden bg-zinc-900">
          <User className="absolute right-4 top-4 opacity-5 pointer-events-none text-white" size={80} />
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2 italic"><User size={12} /> Antropometria Primária</h4>
          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-3 gap-4">
              <Input label="Idade" type="number" value={data.age} onChange={(v: string) => setData({...data, age: v})} />
              <Input label="Peso (kg)" type="number" value={data.weight} onChange={(v: string) => setData({...data, weight: v})} />
              <Input label="Altura (cm)" type="number" value={data.height} onChange={(v: string) => setData({...data, height: v})} />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-800 shadow-xl relative overflow-hidden bg-zinc-900">
          <Target className="absolute right-4 top-4 opacity-5 pointer-events-none text-white" size={80} />
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2 italic"><Target size={12} /> Objetivos do Treino</h4>
          <div className="space-y-4 relative z-10">
            <Select label="Objetivo Primário" value={data.goal} onChange={(v: string) => setData({...data, goal: v})} options={[{ value: "weight-loss", label: "Emagrecimento / Oxidação" }, { value: "conditioning", label: "Condicionamento" }, { value: "5k", label: "Preparação 5km" }, { value: "10k", label: "Preparação 10km" }, { value: "21k", label: "Meia Maratona" }, { value: "42k", label: "Maratona" }, { value: "military", label: "TAF / Militar" }]} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Local Predominante" value={data.environment} onChange={(v: string) => setData({...data, environment: v})} options={[{ value: "asphalt", label: "Asfalto / Rua" }, { value: "treadmill", label: "Esteira" }, { value: "trail", label: "Trilha" }]} />
              <Select label="Monitoramento GPS" value={data.usesWatch} onChange={(v: string) => setData({...data, usesWatch: v})} options={[{ value: "yes", label: "Usa Garmin/Apple" }, { value: "no", label: "Não possui" }]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Disponibilidade" value={data.daysPerWeek} onChange={(v: string) => setData({...data, daysPerWeek: v})} options={[{ value: "2", label: "2x semana" }, { value: "3", label: "3x semana" }, { value: "4", label: "4x semana" }, { value: "5", label: "5x semana" }]} />
              <Select label="Turno" value={data.timeOfDay} onChange={(v: string) => setData({...data, timeOfDay: v})} options={[{ value: "morning", label: "Manhã" }, { value: "afternoon", label: "Tarde" }, { value: "night", label: "Noite" }]} />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 border-l-4 border-l-red-500 shadow-xl relative overflow-hidden bg-zinc-900">
          <HeartPulse className="absolute right-4 top-4 opacity-5 pointer-events-none text-white" size={100} />
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2 italic"><HeartPulse size={12} /> Análise Clínica de Risco</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
              <Input label="Histórico de Lesões" value={data.injuryHistory} onChange={(v: string) => setData({...data, injuryHistory: v})} placeholder="Ex: Tendinite, dor no joelho..." />
              <Input label="Medicações em Uso" value={data.medications} onChange={(v: string) => setData({...data, medications: v})} placeholder="Ex: Anti-hipertensivos..." />
              <Input label="Limitações Físicas" value={data.limitations} onChange={(v: string) => setData({...data, limitations: v})} />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select label="Estado de Atividade" value={data.activeNow} onChange={(v: string) => setData({...data, activeNow: v})} options={[{ value: "yes", label: "Já pratica" }, { value: "no", label: "Sedentário" }]} />
                <Select label="Musculação?" value={data.strengthTraining} onChange={(v: string) => setData({...data, strengthTraining: v})} options={[{ value: "yes", label: "Sim" }, { value: "no", label: "Não" }]} />
              </div>
              <Input label="Outros Esportes praticados" value={data.otherSports} onChange={(v: string) => setData({...data, otherSports: v})} placeholder="Ciclismo, Natação..." />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between pt-6 gap-4">
          <Button onClick={onBack} variant="outline" className="w-full md:w-auto px-8 py-4">Voltar</Button>
          <Button onClick={handleSave} loading={saving} className="w-full md:w-auto px-12 py-6 text-sm md:text-lg shadow-red-500/30 rounded-[3rem] hover:scale-105 transform">Concluir Registro Técnico</Button>
      </div>
    </div>
  );
}

// --- COACH WORKSPACE ---

export function RunTrackCoachView({ student, onBack }: { student: Student, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('diagnostico'); 
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modelWorkouts, setModelWorkouts] = useState<any[]>([]);
  const [showAnamnese, setShowAnamnese] = useState(false);

  // New Model State
  const [newModel, setNewModel] = useState({ 
    dayOfWeek: 'Segunda', type: 'rodagem', distance: '', pace: '', description: '',
    warmupTime: '', sets: '1', reps: '1', stimulusTime: '', recoveryTime: '', cooldownTime: ''
  });

  const isAnamneseComplete = student?.anamneseComplete === true;

  // Load Models
  useEffect(() => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'modelWorkouts'), where('studentId', '==', student.id));
      const unsub = onSnapshot(q, (snap) => {
          setModelWorkouts(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });
      return () => unsub();
  }, [student.id]);

  const processAiDiagnosis = () => {
    if (!isAnamneseComplete) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      const h = Number(student.height) / 100;
      const imc = (Number(student.weight) / (h * h)).toFixed(1);
      const report = {
        clinical: student.injuryHistory ? `ALERTA: Histórico de "${student.injuryHistory}". Evitar intensidades explosivas iniciais.` : "Fisiologia estável detectada.",
        science: student.goal === '5k' ? "Referência Jack Daniels: Intervalados em I-Pace sugeridos." : "Referência Stephen Seiler: Modelo Polarizado 80/20.",
        strategy: `Atleta com IMC ${imc}. Volume base ideal: ${Math.round(Number(student.daysPerWeek) * 7)}km semanais.`,
        tips: [
          "Prescreva modelos cíclicos para consolidação motora.",
          "Priorize a Zona 2 (Oxidativa) nas rodagens de base.",
          "O aumento de 5% deve ser aplicado após 4 sessões validadas."
        ]
      };
      setAiReport(report);
      setIsAiProcessing(false);
    }, 1500);
  };

  const calculateTotalTime = (m: any) => {
    const warmup = Number(m.warmupTime) || 0;
    const cooldown = Number(m.cooldownTime) || 0;
    const sets = Number(m.sets) || 1;
    const reps = Number(m.reps) || 1;
    const stim = Number(m.stimulusTime) || 0;
    const rec = (Number(m.recoveryTime) || 0) / 60;
    const mainWork = sets * (reps * stim + reps * rec);
    return Math.round(warmup + mainWork + cooldown);
  };

  const addModelWorkout = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    let finalModel = { ...newModel };
    const basePace = (5.5 + (Number(student.age) / 100) + (Number(student.weight) / 150)).toFixed(1);

    if (!finalModel.warmupTime) finalModel.warmupTime = '10';
    if (!finalModel.cooldownTime) finalModel.cooldownTime = '10';
    
    if (finalModel.type === 'tiro') {
      if (!finalModel.sets) finalModel.sets = '1';
      if (!finalModel.reps) finalModel.reps = '8';
      if (!finalModel.stimulusTime) finalModel.stimulusTime = '2';
      if (!finalModel.recoveryTime) finalModel.recoveryTime = '60';
      if (!finalModel.pace) finalModel.pace = 'Z4 / Forte';
    } else {
      if (!finalModel.distance) finalModel.distance = finalModel.type === 'longao' ? '12' : '6';
      if (!finalModel.pace) finalModel.pace = `${basePace} min/km`;
    }

    const tTotal = calculateTotalTime(finalModel);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'modelWorkouts'), { 
        ...finalModel, 
        studentId: student.id,
        createdAt: new Date().toISOString(),
        totalTime: tTotal,
        isAiOptimized: !newModel.distance && !newModel.stimulusTime
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setNewModel({ dayOfWeek: 'Segunda', type: 'rodagem', distance: '', pace: '', description: '', warmupTime: '', sets: '1', reps: '1', stimulusTime: '', recoveryTime: '', cooldownTime: '' });
    } catch (e) { console.error("Save error:", e); }
    finally { setIsSaving(false); }
  };

  if (showAnamnese) {
      return <RunTrackAnamnese student={student} onSave={() => setShowAnamnese(false)} onBack={() => setShowAnamnese(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-40 text-left">
      <div className="flex items-center gap-4 mb-4">
          <Button onClick={onBack} variant="outline" className="py-2 px-4"><ArrowRight className="rotate-180" size={16}/></Button>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">RunTrack<span className="text-red-600">AI</span></h2>
      </div>

      {!isAnamneseComplete ? (
        <Card className="flex flex-col items-center py-12 md:py-24 text-center bg-zinc-900 border-red-500/20 border-2 border-dashed rounded-[3rem]">
           <Lock size={64} className="text-red-600 mb-6" />
           <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter">Acesso Bloqueado</h3>
           <p className="text-zinc-500 max-w-md mt-4 mb-8 font-bold uppercase text-[9px] tracking-[0.2em] px-4">Preencha a ficha técnica do atleta para libertar o diagnóstico e a prescrição do treinador virtual.</p>
           <Button onClick={() => setShowAnamnese(true)} variant="primary" className="px-12 py-5 text-lg italic uppercase font-black">Abrir Anamnese</Button>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 p-2 bg-black rounded-3xl w-full max-w-2xl mx-auto shadow-inner sticky top-2 z-40 border border-zinc-800">
             {['diagnostico', 'prescricao'].map(t => (
               <button 
                 key={t} 
                 onClick={() => setActiveTab(t)} 
                 className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black italic uppercase transition-all ${activeTab === t ? 'bg-zinc-900 shadow-xl text-red-600 scale-105 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 {t === 'diagnostico' ? '1. Parecer IA' : '2. Planilha Cíclica'}
               </button>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* PAINEL IA */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 z-30">
               <Card className="bg-zinc-900 text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
                  <BrainCircuit className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none text-white" size={120} />
                  <div className="relative z-10">
                    <h4 className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic"><Sparkles size={14}/> Treinador Virtual IA</h4>
                    {!aiReport ? (
                      <div className="space-y-6 text-center">
                        <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter italic">Analise o perfil biométrico para gerar a estratégia científica do atleta.</p>
                        <Button onClick={processAiDiagnosis} loading={isAiProcessing} className="w-full py-4 text-xs italic tracking-widest uppercase bg-zinc-800 border border-red-600 hover:bg-zinc-700">Analisar Perfil</Button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                        <div className="p-4 bg-black/20 border border-white/5 rounded-2xl italic text-[10px] leading-relaxed opacity-90 border-l-4 border-l-red-600 font-bold">"{aiReport.strategy}"</div>
                        <div className="space-y-4">
                           <p className="text-[9px] font-black text-red-500 uppercase tracking-widest border-b border-white/10 pb-2">Instruções Técnicas:</p>
                           {aiReport.tips.map((t: string, i: number) => <div key={i} className="flex gap-2 items-start text-[9px] font-bold opacity-80 leading-relaxed"><Zap size={12} className="text-red-600 shrink-0 mt-0.5" /> {t}</div>)}
                        </div>
                        <div className="pt-4 border-t border-white/10 text-zinc-400">
                           <p className="text-[9px] font-black uppercase mb-2 flex items-center gap-2 italic"><AlertCircle size={12}/> Clínico:</p>
                           <p className="text-[9px] font-bold italic">{aiReport.clinical}</p>
                        </div>
                      </div>
                    )}
                  </div>
               </Card>
            </div>

            {/* ÁREA DE TRABALHO */}
            <div className="lg:col-span-8 space-y-8">
              {activeTab === 'diagnostico' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <SectionHeader title="Diagnóstico Comentado" subtitle="Análise automatizada da ficha técnica do atleta." />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-l-4 border-l-red-600 shadow-xl relative overflow-hidden bg-zinc-900">
                         <h5 className="text-[9px] font-black text-zinc-500 uppercase mb-4 tracking-widest italic">Dados Atuais</h5>
                         <div className="space-y-3 font-bold text-white">
                            <div className="flex justify-between uppercase italic text-xs"><span>Peso:</span><span className="text-red-600 font-black">{student.weight}kg</span></div>
                            <div className="flex justify-between uppercase italic text-xs"><span>IMC:</span><span className="text-red-600 font-black">{(Number(student.weight) / ((Number(student.height)/100)**2)).toFixed(1)}</span></div>
                            <div className="flex justify-between uppercase italic text-xs"><span>Alvo:</span><span className="text-red-600 italic font-black uppercase">{student.goal}</span></div>
                         </div>
                      </Card>
                      <Card className="border-l-4 border-l-red-800 shadow-xl relative overflow-hidden bg-zinc-900">
                         <h5 className="text-[9px] font-black text-zinc-500 uppercase mb-4 tracking-widest italic">Saúde e Risco</h5>
                         <div className="space-y-3 font-bold text-white">
                            <div className="flex justify-between uppercase italic text-xs"><span>Lesões:</span><span className="text-red-500 truncate ml-4 max-w-[120px] text-right">{student.injuryHistory || "Inexistente"}</span></div>
                            <div className="flex justify-between uppercase italic text-xs"><span>Fortalecimento:</span><span className="text-white uppercase">{student.strengthTraining === 'yes' ? 'Sim' : 'Não'}</span></div>
                         </div>
                      </Card>
                   </div>
                   <div className="flex justify-center pt-6"><Button onClick={() => setActiveTab('prescricao')} className="px-16 py-6 text-lg italic uppercase font-black shadow-2xl bg-red-600 hover:bg-red-700">Montar Planilha Cíclica</Button></div>
                </div>
              )}

              {activeTab === 'prescricao' && (
                <div className="space-y-8 animate-in fade-in duration-500 pb-40">
                   <Card className="bg-zinc-900 text-white border border-red-600/30 shadow-2xl p-6 md:p-10 rounded-[3rem] relative overflow-hidden">
                      <Zap className="absolute right-[-10px] bottom-[-10px] opacity-5 pointer-events-none text-red-600" size={150} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic flex items-center gap-2"><Repeat size={14}/> Modelagem Semanal Cíclica</h4>
                          {saveSuccess && <div className="bg-white text-red-600 text-[9px] px-3 py-1 rounded-lg animate-bounce font-black shadow-xl">GRAVADO!</div>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 border-b border-white/10 pb-8">
                           <Select label="Dia de Repetição" value={newModel.dayOfWeek} onChange={(v: string) => setNewModel({...newModel, dayOfWeek: v})} options={[{value: 'Segunda', label: 'Segunda-feira'}, {value: 'Terça', label: 'Terça-feira'}, {value: 'Quarta', label: 'Quarta-feira'}, {value: 'Quinta', label: 'Quinta-feira'}, {value: 'Sexta', label: 'Sexta-feira'}, {value: 'Sábado', label: 'Sábado'}, {value: 'Domingo', label: 'Domingo'}]} />
                           <Select label="Metodologia Técnica" value={newModel.type} onChange={(v: string) => setNewModel({...newModel, type: v})} options={[{value: 'rodagem', label: 'Rodagem (Zona 2)'}, {value: 'tiro', label: 'Intervalado (Zona 5)'}, {value: 'ritmo', label: 'Tempo Run (Ritmo)'}, {value: 'longao', label: 'Longão'}, {value: 'fartlek', label: 'Fartlek'}, {value: 'subida', label: 'Subida (Força)'}]} />
                           <Input label="KM do Modelo" type="number" value={newModel.distance} onChange={(v: string) => setNewModel({...newModel, distance: v})} placeholder="Ex: 10" className="!bg-white/10 !border-white/20 !text-white" />
                        </div>
                        
                        <div className="bg-black/30 p-6 rounded-[2rem] border border-white/10 mb-8">
                           <div className="flex items-center gap-3 mb-6"><Clock size={16} className="text-zinc-400"/><p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Estrutura Técnica de Tempos</p></div>
                           <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                              <Input label="Aquec. (min)" value={newModel.warmupTime} onChange={(v: string) => setNewModel({...newModel, warmupTime: v})} placeholder="Ex: 15" className="!bg-white/10 !border-white/20 !text-white" />
                              <Input label="Nº de Blocos" type="number" value={newModel.sets} onChange={(v: string) => setNewModel({...newModel, sets: v})} placeholder="Ex: 1" className="!bg-white/10 !border-white/20 !text-white" />
                              <Input label="Tiros / Reps" type="number" value={newModel.reps} onChange={(v: string) => setNewModel({...newModel, reps: v})} placeholder="Ex: 8" className="!bg-white/10 !border-white/20 !text-white" />
                              <Input label="Estímulo (min)" value={newModel.stimulusTime} onChange={(v: string) => setNewModel({...newModel, stimulusTime: v})} placeholder="Ex: 2" className="!bg-white/10 !border-white/20 !text-white" />
                              <Input label="Repouso (seg)" value={newModel.recoveryTime} onChange={(v: string) => setNewModel({...newModel, recoveryTime: v})} placeholder="Ex: 60" className="!bg-white/10 !border-white/20 !text-white" />
                              <Input label="Volta à Calma (min)" value={newModel.cooldownTime} onChange={(v: string) => setNewModel({...newModel, cooldownTime: v})} placeholder="Ex: 10" className="!bg-white/10 !border-white/20 !text-white" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                           <Input label="Pace Sugerido" value={newModel.pace} onChange={(v: string) => setNewModel({...newModel, pace: v})} placeholder="Ex: 5:30" className="!bg-white/10 !border-white/20 !text-white" />
                           <div className="lg:col-span-2"><Input label="Instrução do Coach" value={newModel.description} onChange={(v: string) => setNewModel({...newModel, description: v})} placeholder="Ex: Foco em cadência 180" className="!bg-white/10 !border-white/20 !text-white" /></div>
                        </div>
                        
                        <Button onClick={addModelWorkout} loading={isSaving} variant="secondary" className="w-full py-6 md:py-8 text-lg md:text-2xl shadow-2xl hover:scale-[1.01] transform transition-all group rounded-[2rem]">
                           <Save size={24} className="group-hover:rotate-12 transition-transform" /> SALVAR MODELO DE TREINO
                        </Button>
                      </div>
                   </Card>

                   <div className="space-y-6">
                      <SectionHeader title="Sua Planilha Atual" subtitle="Modelos semanais recorrentes que se adaptam via IA." />
                      <div className="grid grid-cols-1 gap-6">
                         {modelWorkouts.sort((a,b) => getDayIndex(a.dayOfWeek) - getDayIndex(b.dayOfWeek)).map(m => (
                           <Card key={m.id} className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 px-8 border-zinc-800 shadow-sm rounded-3xl relative overflow-hidden bg-zinc-900 group">
                             <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 w-full">
                                <div className="flex items-center gap-4 md:block md:w-20 md:border-r border-zinc-800 md:pr-10 shrink-0 text-center">
                                    <div className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white ${getWorkoutColor(m.type)}`}><Activity size={18}/></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1 text-left md:text-center">Dia</p>
                                        <p className="font-black italic text-white uppercase text-lg md:text-xl text-left md:text-center">{m.dayOfWeek.substring(0,3)}</p>
                                    </div>
                                </div>
                                
                                <div className={`hidden md:flex w-14 h-14 rounded-2xl items-center justify-center text-white ${getWorkoutColor(m.type)} shadow-xl shadow-current/20 shrink-0 group-hover:scale-110 transition-transform`}><Activity size={24}/></div>
                                
                                <div className="flex-1 w-full">
                                   <div className="flex items-center justify-between gap-4 mb-4">
                                      <h5 className="font-black text-xl md:text-2xl italic uppercase text-white leading-none">{m.type}</h5>
                                      <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-lg border border-white/10">
                                         <Clock size={12} className="text-red-500 animate-pulse"/>
                                         <span className="text-[10px] font-black italic tracking-tighter uppercase tabular-nums">{m.totalTime} min</span>
                                      </div>
                                   </div>
                                   <div className="bg-black p-4 rounded-xl border border-white/5 italic font-bold text-[10px] md:text-xs text-zinc-400 leading-relaxed">
                                      "{m.warmupTime} min aquecimento inicial. {m.sets} bloco(s) de {m.reps}x {m.stimulusTime}{isNaN(parseInt(m.stimulusTime)) ? '' : ' min'} de corrida por {m.recoveryTime} segundos de repouso. Finalização de {m.cooldownTime} minutos."
                                   </div>
                                   <div className="flex gap-4 mt-4">
                                      {m.pace && <span className="text-[9px] font-black bg-red-500/10 text-red-400 px-2 py-1 rounded-md uppercase border border-red-500/20">Intensidade: {m.pace}</span>}
                                      {m.distance && <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md uppercase border border-zinc-700">Volume: {m.distance}km</span>}
                                   </div>
                                </div>
                             </div>
                             <button onClick={async () => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'modelWorkouts', m.id))} className="absolute top-4 right-4 md:static md:p-4 text-zinc-500 hover:text-rose-500 transition-all md:opacity-0 md:group-hover:opacity-100"><Trash2 size={18}/></button>
                           </Card>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- STUDENT DASHBOARD ---

export function RunTrackStudentView({ student, onBack }: { student: Student, onBack: () => void }) {
  const [completeModal, setCompleteModal] = useState(false);
  const [stats, setStats] = useState({ distance: '', time: '' });
  const [modelWorkouts, setModelWorkouts] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [showAnamnese, setShowAnamnese] = useState(false);

  useEffect(() => {
      // Fetch models
      const qModels = query(collection(db, 'artifacts', appId, 'public', 'data', 'modelWorkouts'), where('studentId', '==', student.id));
      const unsubModels = onSnapshot(qModels, (snap) => setModelWorkouts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      
      // Fetch history
      const qWorkouts = query(collection(db, 'artifacts', appId, 'public', 'data', 'workouts'), where('studentId', '==', student.id));
      const unsubWorkouts = onSnapshot(qWorkouts, (snap) => setWorkouts(snap.docs.map(d => ({id: d.id, ...d.data()}))));

      return () => { unsubModels(); unsubWorkouts(); };
  }, [student.id]);

  const completedCount = workouts.filter(w => w.completed).length;
  const progressionBonus = Math.floor(completedCount / 4) * 0.05;
  const currentMultiplier = (1.0 + progressionBonus).toFixed(2);

  const finish = async () => {
    if (!stats.distance || !stats.time) return;
    const pace = parseFloat(stats.time) / parseFloat(stats.distance);
    const kcal = Math.round(10 * parseFloat(student.weight as string || '70') * (parseFloat(stats.time) / 60));
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'workouts'), { 
      studentId: student.id, 
      completed: true, 
      realDistance: parseFloat(stats.distance), 
      realTime: parseFloat(stats.time), 
      pace, 
      kcal,
      completedAt: new Date().toISOString()
    });
    setCompleteModal(false);
    setStats({ distance: '', time: '' });
  };

  if (!student.anamneseComplete || showAnamnese) {
      if (showAnamnese) return <RunTrackAnamnese student={student} onSave={() => setShowAnamnese(false)} onBack={() => setShowAnamnese(false)} />;
      
      return (
        <Card className="flex flex-col items-center py-16 md:py-24 text-center bg-zinc-900 border-red-500/20 border-2 border-dashed rounded-[3rem]">
           <Lock size={64} className="text-red-500 mb-6" />
           <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white tracking-tighter">Perfil Incompleto</h3>
           <p className="text-zinc-500 max-w-md mt-4 mb-8 font-bold uppercase text-[9px] tracking-[0.2em] px-4">Precisamos dos seus dados para liberar a planilha.</p>
           <Button onClick={() => setShowAnamnese(true)} variant="primary" className="px-12 py-5 text-lg italic uppercase font-black">Preencher Agora</Button>
        </Card>
      );
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 text-left">
      <div className="flex items-center gap-4 mb-4">
          <Button onClick={onBack} variant="outline" className="py-2 px-4"><ArrowRight className="rotate-180" size={16}/></Button>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">RunTrack<span className="text-red-600">AI</span></h2>
      </div>

      <Card className="bg-zinc-900 text-white border-zinc-800 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center shadow-2xl rounded-[3.5rem] relative overflow-hidden">
          <Sparkles className="absolute right-[-40px] bottom-[-40px] text-white/5 pointer-events-none" size={200} />
          <div className="relative z-10 text-center md:text-left">
            <span className="text-[9px] font-bold uppercase text-red-500 tracking-[0.5em] mb-4 md:mb-6 block opacity-50">Evolução de Performance</span>
            <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">Nível: {currentMultiplier}x</h3>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 md:mt-6 text-red-600"><TrendingUp size={18} /><p className="text-white/50 text-[9px] font-black uppercase tracking-widest italic italic">A cada 4 treinos: +5% intensidade.</p></div>
          </div>
          <div className="text-center md:text-right relative z-10 md:border-l-2 border-white/10 md:pl-12 mt-8 md:mt-0 w-full md:w-auto pt-8 md:pt-0 border-t md:border-t-0 border-white/5">
            <p className="text-6xl md:text-8xl font-black text-red-600 italic tabular-nums leading-none tracking-tighter">{completedCount}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-3 text-white/40 font-black">Sessões Validadas</p>
          </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6 md:space-y-8">
          <SectionHeader title="Sua Planilha" subtitle="Treinos cíclicos recorrentes da sua fase atual." />
          {modelWorkouts.length === 0 && <div className="text-zinc-500 italic text-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl text-sm">Aguardando prescrição do treinador...</div>}
          <div className="grid grid-cols-1 gap-6">
             {modelWorkouts.sort((a,b) => getDayIndex(a.dayOfWeek) - getDayIndex(b.dayOfWeek)).map(m => (
               <Card key={m.id} className="p-6 md:p-10 border-zinc-800 shadow-xl rounded-[3rem] bg-zinc-900 relative overflow-hidden group hover:border-red-600/30 transition-all">
                  <div className={`absolute right-4 top-4 p-3 rounded-2xl ${getWorkoutColor(m.type)} text-white opacity-20 group-hover:opacity-100 transition-opacity`}><Activity size={20}/></div>
                  <div className="flex items-center gap-4 mb-4"><span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 font-bold">{m.dayOfWeek}</span></div>
                  <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{m.type}</h4>
                  <div className="mt-6 bg-black p-5 md:p-6 rounded-2xl border border-white/5 italic font-bold text-[10px] md:text-xs text-zinc-400 leading-relaxed shadow-inner">
                     "{m.warmupTime} min aquecimento. {m.sets} bloco(s) de {m.reps}x {m.stimulusTime}{isNaN(parseInt(m.stimulusTime)) ? '' : ' min'} de corrida por {m.recoveryTime}s de repouso. Finalização de {m.cooldownTime} min."
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
                     <div className="flex flex-col gap-1"><p className="text-[8px] font-black uppercase opacity-40 italic text-zinc-500">Tempo Est.:</p><p className="text-lg md:text-xl font-black italic tracking-tighter text-white">{m.totalTime} min</p></div>
                     <div className="flex flex-col gap-1 text-right"><p className="text-[8px] font-black uppercase opacity-40 italic text-red-500">Pace Alvo:</p><p className="text-lg md:text-xl font-black italic text-red-500 tracking-tighter">{m.pace}</p></div>
                  </div>
               </Card>
             ))}
          </div>
          <Button onClick={() => setCompleteModal(true)} className="px-12 py-8 text-xl md:text-3xl font-black italic uppercase rounded-[2.5rem] w-full mt-8 shadow-2xl shadow-red-600/40 transform hover:scale-[1.02]">Registrar Sessão</Button>
        </div>

        <div className="space-y-6 md:space-y-8">
           <SectionHeader title="Recentes" subtitle="Registo de performance das últimas atividades." />
           <div className="space-y-4">
              {workouts.filter(w => w.completed).sort((a,b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0,4).map(w => (
                <div key={w.id} className="flex justify-between items-center bg-zinc-900 p-5 md:p-6 rounded-[2rem] shadow-lg border border-zinc-800 group hover:border-red-600/30 transition-all">
                   <div className="flex gap-4 md:gap-6 items-center">
                     <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-800 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/10 group-hover:rotate-6 transition-transform shrink-0"><CheckCircle2 size={20} className="text-red-600"/></div>
                     <div><p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 font-bold">{new Date(w.completedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</p><p className="font-black italic uppercase text-lg md:text-xl text-white tracking-tighter">{w.realDistance}km Concluídos</p></div>
                   </div>
                   <div className="text-right pl-2"><p className="text-[9px] font-black text-zinc-500 uppercase mb-1 font-bold">Pace</p><p className="text-red-500 font-black italic text-base md:text-lg">{formatPace(w.pace)}</p></div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {completeModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="max-w-xl w-full p-8 md:p-12 shadow-2xl border border-white/10 rounded-[3rem] bg-zinc-900">
            <div className="text-center mb-8 md:mb-12"><h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Dados Reais</h3><p className="text-[9px] font-black uppercase tracking-[0.5em] text-red-500 mt-4 font-bold">Feed the AI engine</p></div>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <Input label="KM Finalizado" type="number" value={stats.distance} onChange={(v: string) => setStats({...stats, distance: v})} className="text-2xl md:text-3xl font-black py-4" />
                <Input label="Tempo Total (min)" type="number" value={stats.time} onChange={(v: string) => setStats({...stats, time: v})} className="text-2xl md:text-3xl font-black py-4" />
              </div>
              {stats.distance && stats.time && (
                <div className="bg-black p-6 md:p-8 rounded-[2rem] grid grid-cols-2 gap-4 md:gap-10 text-center border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                   <div className="border-r border-white/10"><p className="text-[9px] font-black text-red-400 mb-2 uppercase tracking-widest opacity-60 font-bold">PACE REAL</p><p className="text-3xl md:text-5xl font-black text-white italic tabular-nums tracking-tighter">{formatPace(parseFloat(stats.time)/parseFloat(stats.distance)).split(' ')[0]}</p></div>
                   <div><p className="text-[9px] font-black text-orange-400 mb-2 uppercase tracking-widest opacity-60 font-bold">KCAL</p><p className="text-3xl md:text-5xl font-black text-white italic tabular-nums tracking-tighter">{Math.round(10*parseFloat(student.weight as string || '70')*(parseFloat(stats.time)/60))}</p></div>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-10 md:mt-16">
              <Button variant="outline" onClick={() => setCompleteModal(false)} className="flex-1 py-6 rounded-3xl font-black uppercase italic text-lg">Voltar</Button>
              <Button onClick={finish} className="flex-1 py-6 rounded-3xl font-black uppercase italic text-xl md:text-2xl shadow-red-500/40">Gravar Dados</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}