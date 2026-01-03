import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, LogOut, ChevronRight, Edit3, Plus, Ruler, 
  Trash2, Video, Play, Loader2, Brain, Activity, RotateCcw,
  Target, TrendingUp, Flame, BookOpen, Clock, ListFilter,
  Save, Layout, Zap, Footprints, Sparkles, Repeat, AlertCircle, Dumbbell,
  RefreshCcw, Image as ImageIcon, Scale, MousePointer2, FilePlus, Check, Calendar
} from 'lucide-react';
import { Card, EliteFooter, Logo } from './Layout';
import { Student, Exercise, PhysicalAssessment, PeriodizationPlan, Workout, AppNotification } from '../types';
import { callGemini, generateExerciseImage, generatePeriodizationPlan } from '../services/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { RunTrackCoachView } from './RunTrack';

// --- DATABASE ATUALIZADA (PRESCREVE AI) ---
const EXERCISE_DATABASE: Record<string, string[]> = {
  "Peito": [
    "Supino Reto com HBL", "Supino reto com HBC", "Supino reto alternado com HBC", 
    "Supino inclinado com HBL", "Supino inclinado com HBC", "Supino inclinado alternado com HBC", 
    "Supino declinado com HBL", "Supino declinado com HBC", "Supino declinado alternado com HBC", 
    "Crucifixo aberto com HBC no banco reto", "Crucifixo aberto alternado com HBC no banco reto", 
    "Crucifixo aberto com HBC no banco declinado", "Crucifixo aberto alternado com HBC no banco declinado", 
    "Crucifixo aberto com HBC no banco inclinado", "Crucifixo aberto alternado com HBC no banco inclinado", 
    "Supino sentado aberto na máquina", "Supino unilateral sentado aberto na máquina", "Supino alternado sentado aberto na máquina", 
    "Supino sentado fechado na máquina", "Supino unilateral sentado fechado na máquina", "Supino alternado sentado fechado na máquina", 
    "Supino inclinado aberto na máquina", "Supino unilateral inclinado aberto na máquina", "Supino alternado inclinado aberto na máquina", 
    "Supino inclinado fechado na máquina", "Supino unilateral inclinado fechado na máquina", "Supino alternado inclinado fechado na máquina", 
    "Supino deitado aberto na máquina", "Supino unilateral deitado aberto na máquina", "Supino alternado deitado aberto na máquina", 
    "Supino deitado fechado na máquina", "Supino unilateral deitado fechado na máquina", "Supino alternado deitado fechado na máquina", 
    "Supino banco 75º aberto no crossover", "Supino alternado banco 75° aberto no crossover", "Supino banco 75º fechado no crossover", 
    "Supino alternado banco 75° fechado no crossover", "Supino banco 45º aberto no crossover", "Supino alternado banco 45° no crossover", 
    "Supino banco 45º fechado no crossover", "Supino alternado banco 45° fechado no crossover", "Supino banco reto aberto no crossover", 
    "Supino alternado banco reto aberto no crossover", "Supino banco reto fechado no crossover", "Supino alternado banco reto fechado no crossover", 
    "Crucifixo aberto na máquina", "Crucifixo alternado na máquina", "Crucifixo unilateral na máquina", 
    "Crucifixo em pé no cross polia média", "Crucifixo em pé no cross polia alta", "Voador peitoral", 
    "PullUp na polia baixa pegada supinada", "Supino aberto no banco reto no smith", "Supino aberto banco inclinado no smith", 
    "Supino aberto banco declinado no smith", "Extensão de cotovelos no solo (Flexão de Braços)"
  ],
  "Ombro": [
    "Desenvolvimento em pé aberto com HBM", "Desenvolvimento em pé fechado supinado com HBM", "Desenvolvimento em pé fechado pronado with HBM",
    "Desenvolvimento em pé aberto com HBC", "Desenvolvimento em pé fechado supinado com HBC", "Desenvolvimento em pé fechado pronado com HBC",
    "Desenvolvimento em pé arnold com HBC", "Desenvolvimento banco 75º aberto com HBM", "Desenvolvimento banco 75º fechado supinado com HBM",
    "Desenvolvimento banco 75º fechado pronado com HBM", "Desenvolvimento banco 75º aberto com HBC", "Desenvolvimento banco 75º fechado supinado com HBC",
    "Desenvolvimento banco 75º fechado pronado com HBC", "Desenvolvimento banco 75º arnold com HBC", "Remada alta em pé com HBM",
    "Remada alta em pé com HBL", "Remada alta em pé com HBC", "Remada alta em pé no cross",
    "Remada alta em decúbito dorsal cross", "Remada alta banco 45º cross", "Flexão de ombro unilateral no cross",
    "Flexão de ombro unilateral com HBC pegada neutra", "Flexão de ombro unilateral com HBC pegada pronada", "Flexão de ombro simultâneo com HBC pegada neutra",
    "Flexão de ombro simultâneo com HBC pegada pronada", "Flexão de ombro com HBM pegada pronada", "Abdução de ombros em pé com HBC pegada pronada",
    "Abdução de ombros em pé com HBC pegada neutra", "Abdução de ombros banco 75º com HBC pegada pronada", "Abdução de ombros banco 75º com HBC pegada neutra",
    "Abdução de ombros unilateral em decúbito lateral no banco 45º HBC", "Abdução de ombros unilateral em decúbito lateral no banco 45º no cross", "Abdução de ombros unilateral no cross",
    "Remada alta com Kettlebell", "Desenvolvimento aberto na máquina", "Desenvolvimento aberto banco 75º no smith",
    "Desenvolvimento fechado supinado banco 75º no smith", "Desenvolvimento fechado pronado banco 75º no smith", "Encolhimento de ombros no cross",
    "Encolhimento de ombros com HBM", "Encolhimento de ombros com HBC", "Remada alta com HBM no banco 45º"
  ],
  "Triceps": [
    "Tríceps testa simultâneo no cross", "Tríceps testa unilateral no cross", "Tríceps testa unilateral HBC banco reto",
    "Tríceps testa simultâneo HBC banco reto", "Tríceps testa HBM banco reto", "Tríceps supinado com HBM banco reto",
    "Tríceps supinado no smith banco reto", "Tríceps supinado pegada neutra com HBC", "Tríceps mergulho no banco reto",
    "Tríceps em pé francês com HBC unilateral", "Tríceps em pé francês com HBC simultâneo", "Tríceps banco 75º francês com HBC unilateral",
    "Tríceps banco 75º francês com HBC simultâneo", "Tríceps coice curvado com HBC simultâneo", "Tríceps coice curvado com HBC unilateral",
    "Tríceps francês no cross unilateral", "Tríceps francês no cross simultâneo", "Tríceps no cross com corda",
    "Tríceps no cross com barra reta", "Tríceps no cross com barra V", "Tríceps no cross com barra W",
    "Tríceps no cross com barra reta inverso", "Tríceps no cross inverso unilateral", "Tríceps coice curvado no cross",
    "Tríceps superman no cross segurando nos cabos", "Extensão de cotovelos fechados no solo (Flexão de braços)"
  ],
  "Costas e Cintura Escapular": [
    "Remada curvada supinada com HBM", "Remada curvada aberta com HBM", "Remada curvada supinada com HBC",
    "Remada curvada aberta com HBC", "Remada curvada supinada com cross", "Remada curvada aberta com cross",
    "Remada curvada supinada com cross unilateral", "Remada curvada aberta com cross unilateral", "Remada no banco em 3 apoios pegada neutra no cross unilateral",
    "Remada no banco em 3 apoios pegada supinada no cross unilateral", "Remada no banco em 3 apoios pegada neutra com HBC unilateral", "Remada no banco em 3 apoios pegada supinada com HBC unilateral",
    "Remada no banco em 3 apoios pegada aberta com HBC unilateral", "Remada aberta com barra reta no cross polia média", "Remada supinada com barra reta no cross polia média",
    "Puxada aberta com barra reta no cross polia alta", "Puxada supinada com barra reta no cross polia alta", "Puxada aberta no pulley alto",
    "Puxada supinada no pulley alto", "Puxada aberta com barra romana pulley alto", "Puxada com triângulo no pulley alto",
    "Remada baixa com barra reta", "Remada baixa barra reta pegada supinada", "Remada baixa com triângulo",
    "Remada aberta na máquina", "Remada fechada na máquina", "Remada cavalo com HBL",
    "Remada aberta declinada no smith", "Extensão de ombros no cross barra reta", "Pullover no banco reto com HBC",
    "Crucifixo inverso na máquina", "Crucifixo inverso unilateral no cross polia média", "Crucifixo inverso simultâneo no cross polia média",
    "Remada aberta com HBC decúbito ventral no banco 45°", "Remada aberta alternada com HBC decúbito ventral no banco 45°", "Remada fechada com HBC decúbito ventral no banco 45°",
    "Remada fechada alternada com HBC decubito ventral no banco 45°"
  ],
  "Biceps": [
    "Bíceps em pé com HBM pegada supinada", "Bíceps em pé com HBM pegada pronada", "Bíceps em pé com HBC pegada supinada simultâneo",
    "Bíceps em pé com HBC pegada neutra simultâneo", "Bíceps em pé com HBC pegada pronada simultâneo", "Bíceps em pé com HBC pegada supinada unilateral",
    "Bíceps em pé com HBC pegada neutra unilateral", "Bíceps em pé com HBC pegada pronada unilateral", "Bíceps banco 75º com HBC pegada supinada simultâneo",
    "Bíceps banco 75º com HBC pegada neutra simultâneo", "Bíceps banco 75º com HBC pegada pronada simultâneo", "Bíceps banco 75º com HBC pegada supinada unilateral",
    "Bíceps banco 75º com HBC pegada neutra unilateral", "Bíceps banco 75º com HBC pegada pronada unilateral", "Bíceps banco 45º com HBC pegada supinada simultâneo",
    "Bíceps banco 45º com HBC pegada neutra simultâneo", "Bíceps banco 45º com HBC pegada pronada simultâneo", "Bíceps banco 45º com HBC pegada supinada unilateral",
    "Bíceps banco 45º com HBC pegada neutra unilateral", "Bíceps banco 45º com HBC pegada pronada unilateral", "Bíceps em pé com HBC pegada supinada alternado",
    "Bíceps em pé com HBC pegada neutra alternado", "Bíceps em pé com HBC pegada pronada alternado", "Bíceps concentrado com HBC unilateral",
    "Bíceps no banco scott com HBC simultâneo", "Bíceps no banco scott com HBC unilateral", "Bíceps no banco scott com HBW simultâneo",
    "Bíceps no banco scott com HBM supinado", "Bíceps no banco scott com HBM pronado", "Bíceps no cross barra reta",
    "Bíceps no cross polia baixa unilateral", "Bíceps superman no cross simultâneo", "Bíceps superman no cross unilateral"
  ],
  "Core e Abdomen": [
    "Abdominal supra no solo", "Abdominal supra na bola", "Abdominal supra no bosu",
    "Abdominal diagonal no solo", "Abdominal diagonal na bola", "Abdominal diagonal no bosu",
    "Abdominal infra no solo puxando as pernas", "Abdominal infra pernas estendidas", "Abdominal vela no solo",
    "Prancha ventral no solo em isometria", "Prancha lateral no solo em isometria", "Prancha ventral no bosu em isometria",
    "Prancha ventral na bola em isometria", "Prancha lateral no bosu em isometria", "Prancha lateral na bola em isometria"
  ],
  "Paravertebrais": [
    "Mata-borrão isométrico no solo (super-man)", "Perdigueiro em isometria no solo", "Elevação de quadril em isometria no solo"
  ],
  "Quadríceps e Adutores": [
    "Agachamento livre com HBL", "Agachamento livre com HBL barra sobre ombros", "Agachamento livre com HBM barra sobre ombros",
    "Agachamento no Smith barra sobre os ombros", "Agachamento no hack machine", "Agachamento no smith",
    "Agachamento no sissy", "Agachamento livre com HBC", "Agachamento livre",
    "Levantar e sentar no banco reto", "Levantar e sentar no banco reto com HBC", "Levantar e sentar do banco reto com HBM",
    "Agachamento em passada com HBC", "Agachamento em passada com HBM", "Agachamento em passada com HBL",
    "Agachamento búlgaro", "Agachamento em passada com step a frente", "Agachamento em passada com step a frente com HBC",
    "Agachamento em passada com step a frente com HBM", "Agachamento em passada com step a frente com HBL", "Agachamento em passada com step atrás",
    "Agachamento em passada com step atrás com HBC", "Agachamento em passada com step atrás com HBM", "Agachamento em passada com step atrás com HBL",
    "Agachamento em passada no smith", "Agachamento em passada com step a frente no smith", "Agachamento em passada com step atrás no Smith",
    "Leg press inclinado", "Leg press inclinado unilateral", "Leg press horizontal",
    "Leg press horizontal unilateral", "Cadeira extensora", "Cadeira extensora unilateral",
    "Cadeira adutora", "Adução de quadril em pé no cross", "Adução de quadril em decúbito lateral no solo",
    "Adução de quadril em decúbito dorsal"
  ],
  "Glúteos e Posteriores": [
    "Levantamento terra com HBM", "Levantamento terra com HBC", "Levantamento terra com HBL",
    "Levantamento terra no cross", "Levantamento terra romeno com HBM", "Elevação de Quadril no solo com anilha",
    "Elevação de quadril no banco reto com HBM", "Stiff com HBM simultâneo", "Stiff com HBC simultâneo",
    "Stiff com HBC unilateral", "Stiff “bom dia” com HBM", "Mesa flexora",
    "Mesa flexora unilateral", "Cadeira flexora", "Cadeira flexora unilateral",
    "Flexão de joelho em pé com caneleira", "Flexão de joelho em pé no cross", "Flexão de joelho em 3 apoios com caneleira",
    "Agachamento sumô com HBC", "Agachamento sumô com HBM", "Extensão de quadril no solo caneleira",
    "Extensão de quadril em pé caneleira", "Extensão de quadril e joelho no solo caneleira", "Extensão de quadril e joelho em pé caneleira",
    "Extensão de quadril no cross", "Extensão de quadril em pé no cross", "Extensão de quadril e joelho no cross",
    "Extensão de quadril e joelho em pé no cross", "Abdução de quadril em pé com caneleira", "Abdução de quadril decúbito lateral no solo caneleira"
  ],
  "Panturrilha": [
    "Cadeira solear", "Flexão plantar em pé na Máquina", "Flexão plantar no Leg press inclinado",
    "Flexão plantar no leg press horizontal", "Flexão plantar em pé Unilateral", "Flexão plantar com Halteres."
  ]
};

const MUSCLE_GROUPS = Object.keys(EXERCISE_DATABASE);

// --- STYLES FOR LOOP ANIMATION (Shared) ---
const animationStyles = `
  @keyframes biomechanicalVideo {
    0% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
    40% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    60% { transform: scale(1.06) translateY(-8px); filter: brightness(1.15) contrast(1.1) saturate(1.2); }
    100% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1) saturate(1); }
  }
  .video-motion-engine { animation: biomechanicalVideo 5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
`;

// --- PROFESSOR DASHBOARD ---
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
          <button key={`prof-dash-student-${s.id}`} onClick={() => onSelect(s)} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-xl hover:border-red-600/30">
            <div className="flex items-center gap-5 text-left">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 bg-zinc-800 shadow-2xl">
                <img src={s.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-full h-full object-cover" alt="Perfil" />
              </div>
              <div className="text-left text-white">
                <p className="font-black uppercase text-base leading-tight text-white tracking-tighter text-left">{s.nome || "Atleta"}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-widest text-left">{s.email}</p>
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

// --- STUDENT MANAGEMENT ---
export function StudentManagement({ student, onBack, onNavigate }: { student: Student, onBack: () => void, onNavigate: (v: string) => void }) {
  return (
    <div className="p-6 animate-fadeIn pb-32 text-white h-screen overflow-y-auto custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-10 text-left">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Gestão do Aluno</h2>
      </header>
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3.5rem] text-center mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <img src={student.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-28 h-28 rounded-[2.5rem] mx-auto border-4 border-red-600 mb-4 shadow-2xl bg-zinc-800 object-cover" alt="Perfil" />
        <h3 className="text-3xl font-black italic uppercase leading-none tracking-tighter text-center">{student.nome}</h3>
        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-2 tracking-[0.2em] text-center">{student.email}</p>
      </div>
      <div className="space-y-4">
        <button onClick={() => onNavigate('PERIODIZATION')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between text-white active:bg-zinc-800 shadow-lg group transition-all text-left hover:border-indigo-500/50">
           <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors">
                 <Brain className="w-6 h-6 text-indigo-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                 <span className="font-black uppercase text-sm italic tracking-tighter text-left">Periodização (IA)</span>
                 <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest text-left">Criar Macrociclo & Volume</p>
              </div>
           </div>
           <ChevronRight size={20} className="text-zinc-700 group-hover:text-white" />
        </button>

        <button onClick={() => onNavigate('COACH_ASSESSMENT')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between text-white active:bg-zinc-800 shadow-lg group transition-all text-left hover:border-emerald-500/30">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 transition-colors">
              <Ruler className="w-6 h-6 text-emerald-500 group-hover:text-white" />
            </div>
            <div className="text-left">
              <span className="font-black uppercase text-sm italic tracking-tighter text-left">Avaliação Física</span>
              <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest text-left">Ficha PhysioApp PhD</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-700 group-hover:text-white" />
        </button>

        <button onClick={() => onNavigate('RUNNING_MANAGER')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between text-white active:bg-zinc-800 shadow-lg group transition-all text-left hover:border-orange-500/30">
           <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-600 transition-colors">
                 <Footprints className="w-6 h-6 text-orange-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                 <span className="font-black uppercase text-sm italic tracking-tighter text-left">RunTrack Elite</span>
                 <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest text-left">Montagem de Treino de Corrida</p>
              </div>
           </div>
           <ChevronRight size={20} className="text-zinc-700 group-hover:text-white" />
        </button>

        <button onClick={() => onNavigate('WORKOUT_EDITOR')} className="w-full bg-red-600 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl active:scale-95 transition-all text-white group text-left hover:bg-red-700">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-left text-white">
              <span className="font-black uppercase text-sm italic tracking-tighter text-left">Prescrever Treino</span>
              <p className="text-[7px] text-white/50 font-bold uppercase tracking-widest text-left">Metodologia Elite ✨</p>
            </div>
          </div>
          <Plus size={20} />
        </button>
      </div>
      <EliteFooter />
    </div>
  );
}

// --- COACH ASSESSMENT VIEW ---
export function CoachAssessmentView({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const [formData, setFormData] = useState<Partial<PhysicalAssessment>>({
    data: new Date().toISOString().split('T')[0],
    peso: '',
    altura: '',
    dc_peitoral: '',
    dc_abdominal: '',
    dc_coxa: '',
    dc_tricipital: '',
    dc_suprailiaca: '',
    bio_percentual_gordura: '',
    bio_massa_magra: '',
    bio_musculo_esqueletico: '',
    bio_massa_ossea: '',
    bio_agua_corporal: '',
    bio_gordura_visceral: '',
    bio_idade_metabolica: '',
    bio_tmb: '',
    p_cintura: '',
    p_quadril: '',
  });

  const handleSave = () => {
    const assessment: PhysicalAssessment = {
      id: Date.now().toString(),
      ...formData,
      peso: formData.peso || 0,
      altura: formData.altura || 0,
    } as PhysicalAssessment;

    const currentAssessments = student.physicalAssessments || [];
    const updatedAssessments = [assessment, ...currentAssessments];
    
    // Add Notification for student
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      type: 'ASSESSMENT',
      message: `Nova Avaliação Física disponível. Data: ${new Date().toLocaleDateString('pt-BR')}`,
      timestamp: Date.now(),
      read: false
    };
    
    onSave(student.id, { 
      physicalAssessments: updatedAssessments, 
      notifications: [newNotification, ...(student.notifications || [])] 
    });
    onBack();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-8 text-left">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-left">Avaliação: <span className="text-blue-500">{student.nome.split(' ')[0]}</span></h2>
      </header>

      <div className="space-y-6">
        
        {/* DATA */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">DATA</label>
                <input type="date" value={formData.data} onChange={(e) => handleChange('data', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
            </div>
        </Card>

        {/* DADOS BÁSICOS */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-black uppercase text-blue-500 mb-4 tracking-widest flex items-center gap-2"><Scale size={16}/> Dados Básicos</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Peso (kg)</label>
                    <input type="number" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Altura (cm)</label>
                    <input type="number" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
            </div>
        </Card>

        {/* DOBRAS CUTÂNEAS */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-black uppercase text-blue-500 mb-4 tracking-widest flex items-center gap-2"><MousePointer2 size={16}/> Dobras Cutâneas (mm)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Coxa</label>
                    <input type="number" value={formData.dc_coxa} onChange={(e) => handleChange('dc_coxa', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Peitoral</label>
                    <input type="number" value={formData.dc_peitoral} onChange={(e) => handleChange('dc_peitoral', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Abdominal</label>
                    <input type="number" value={formData.dc_abdominal} onChange={(e) => handleChange('dc_abdominal', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
                {/* Keeping standard ones available if needed, though hidden in screenshot */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Tricipital (Opc.)</label>
                    <input type="number" value={formData.dc_tricipital} onChange={(e) => handleChange('dc_tricipital', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/>
                </div>
            </div>
        </Card>

        {/* BIOIMPEDÂNCIA */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-black uppercase text-emerald-500 mb-4 tracking-widest flex items-center gap-2"><Zap size={16}/> Bioimpedância Detalhada</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Gordura Corp. (%)</label>
                    <input type="number" value={formData.bio_percentual_gordura} onChange={(e) => handleChange('bio_percentual_gordura', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Massa Magra (kg)</label>
                    <input type="number" value={formData.bio_massa_magra} onChange={(e) => handleChange('bio_massa_magra', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Músc. Esq. (kg)</label>
                    <input type="number" value={formData.bio_musculo_esqueletico} onChange={(e) => handleChange('bio_musculo_esqueletico', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Massa Óssea (kg)</label>
                    <input type="number" value={formData.bio_massa_ossea} onChange={(e) => handleChange('bio_massa_ossea', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Água Corp. (%)</label>
                    <input type="number" value={formData.bio_agua_corporal} onChange={(e) => handleChange('bio_agua_corporal', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">G. Visceral</label>
                    <input type="number" value={formData.bio_gordura_visceral} onChange={(e) => handleChange('bio_gordura_visceral', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Idade Metabólica</label>
                    <input type="number" value={formData.bio_idade_metabolica} onChange={(e) => handleChange('bio_idade_metabolica', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">TMB (kcal)</label>
                    <input type="number" value={formData.bio_tmb} onChange={(e) => handleChange('bio_tmb', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-emerald-500"/>
                </div>
            </div>
        </Card>

        {/* PERÍMETROS */}
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-black uppercase text-orange-500 mb-4 tracking-widest flex items-center gap-2"><Ruler size={16}/> Perímetros (cm)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Cintura</label>
                    <input type="number" value={formData.p_cintura} onChange={(e) => handleChange('p_cintura', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-orange-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Quadril</label>
                    <input type="number" value={formData.p_quadril} onChange={(e) => handleChange('p_quadril', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-orange-500"/>
                </div>
            </div>
        </Card>

        <button onClick={handleSave} className="w-full py-5 bg-green-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all hover:bg-green-700 flex items-center justify-center gap-2 text-lg">
            FINALIZAR AVALIAÇÃO
        </button>
      </div>
    </div>
  );
}

// --- PERIODIZATION GENERATOR ---
export function PeriodizationView({ student, onBack, onProceedToWorkout }: { student: Student, onBack: () => void, onProceedToWorkout: () => void }) {
  const [step, setStep] = useState<'avaliacao' | 'gerando' | 'painel'>('avaliacao');
  const [formData, setFormData] = useState({
    name: student.nome,
    regularity: 'voltando',
    goal: 'hipertrofia',
    daysPerWeek: '4',
    splitPreference: 'anterior_posterior',
    type: 'STRENGTH' // STRENGTH is now the only option
  });
  const [periodization, setPeriodization] = useState<any>(null);

  const handleGenerate = async () => {
    setStep('gerando');
    const result = await generatePeriodizationPlan(formData);
    
    if (result) {
      // SAVE TO FIRESTORE IMMEDIATELY
      const pData: PeriodizationPlan = {
        ...result,
        id: Date.now().toString(),
        startDate: new Date().toISOString(),
        type: formData.type
      };

      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
        // Save to specific field based on type
        const updateData = formData.type === 'RUNNING' 
          ? { runningPeriodization: pData } 
          : { periodization: pData };
        
        await setDoc(docRef, updateData, { merge: true });
        
        setPeriodization(pData);
        setStep('painel');
      } catch (e) {
        console.error("Firebase Save Error:", e);
        // Still show panel even if save fails visually
        setPeriodization(pData);
        setStep('painel');
      }
    } else {
      setStep('avaliacao'); // On error
      alert("Erro ao gerar periodização. Tente novamente.");
    }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left">
      <header className="flex items-center justify-between mb-8 text-left">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-left">Ciência<span className="text-red-600">Força</span></h2>
         </div>
         {step === 'painel' && (
           <button onClick={() => setStep('avaliacao')} className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 hover:text-white transition-colors">
              <RotateCcw size={12}/> Reiniciar
           </button>
         )}
      </header>

      {step === 'avaliacao' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="p-8 mb-6 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-2xl"><Brain size={24}/></div>
                 <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Anamnese Avançada</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Protocolo PBE • EEFD/UFRJ</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tipo de Periodização</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors">
                       <option value="STRENGTH">Musculação / Força</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Condição Biológica Atual</label>
                    <select value={formData.regularity} onChange={e => setFormData({...formData, regularity: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors">
                       <option value="sedentary">Iniciante / Sedentário</option>
                       <option value="voltando">Retomada (Sem ritmo)</option>
                       <option value="regular">Regular (Consistente)</option>
                       <option value="stagnated">Estagnado (Platô)</option>
                       <option value="performance">Alta Performance</option>
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Dias/Semana</label>
                       <input type="number" value={formData.daysPerWeek} onChange={e => setFormData({...formData, daysPerWeek: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Objetivo</label>
                       <select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors">
                          <option value="emagrecimento">Emagrecimento</option>
                          <option value="hipertrofia">Hipertrofia</option>
                          <option value="forca_pura">Força Pura</option>
                       </select>
                    </div>
                 </div>

                 {formData.type === 'STRENGTH' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Estrutura de Divisão</label>
                        <select value={formData.splitPreference} onChange={e => setFormData({...formData, splitPreference: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors">
                        <option value="full_body">Full Body (Corpo Todo)</option>
                        <option value="anterior_posterior">A/B: Anterior / Posterior</option>
                        <option value="upper_lower">A/B: Superior / Inferior</option>
                        <option value="abc_ppl">ABC: Push / Pull / Legs</option>
                        <option value="abcd">ABCD (Intensidade Alta)</option>
                        <option value="abcde">ABCDE (Volume por Músculo)</option>
                        </select>
                    </div>
                 )}
              </div>

              <button onClick={handleGenerate} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                 <Brain size={18}/> Gerar Planilha de Carga
              </button>
           </Card>
        </div>
      )}

      {step === 'gerando' && (
         <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in">
             <div className="relative">
                <Loader2 size={64} className="text-indigo-600 animate-spin"/>
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={20} />
             </div>
             <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Analisando Biomecânica...</p>
         </div>
      )}

      {step === 'painel' && periodization && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <Card className="p-6 bg-zinc-900 border-indigo-500/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={120} className="text-indigo-500"/></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Ciência da Força</span>
                     <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">PBE • UFRJ</span>
                  </div>
                  <h1 className="text-3xl font-black italic uppercase leading-none mb-4">{periodization.titulo}</h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                     <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Atleta: {student.nome}</span>
                     <span className="bg-indigo-900/40 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Ritmo: {formData.regularity}</span>
                     <span className="bg-indigo-900/40 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Tipo: {formData.type}</span>
                  </div>
                  <button onClick={onProceedToWorkout} className="bg-red-600 hover:bg-red-700 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all">
                     <Edit3 size={16}/> Configurar Treinos (Exercícios)
                  </button>
               </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
               {periodization.microciclos.map((m: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${i === 3 ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${i === 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>Semana {m.semana}</span>
                        <TrendingUp size={14} className={i === 3 ? "text-emerald-500" : "text-zinc-600"} />
                     </div>
                     <h3 className="font-black text-sm mb-3 uppercase leading-tight text-white">{m.foco}</h3>
                     <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                           <Flame size={10} className={i === 3 ? "text-amber-400" : "text-zinc-600"}/> PSE: {m.pse_alvo}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400">
                           <Activity size={10} className={i === 3 ? "text-white" : "text-zinc-600"}/> REPS: {m.faixa_repeticoes}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <Card className="p-0 overflow-hidden bg-zinc-900">
               <div className="bg-indigo-600 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-white/20 p-2 rounded-xl"><BookOpen size={18} className="text-white"/></div>
                     <h3 className="text-lg font-black uppercase tracking-tighter">Planilha Detalhada</h3>
                  </div>
               </div>
               <div className="p-6">
                  <div className="bg-black p-6 rounded-2xl text-zinc-300 font-mono text-xs leading-relaxed border border-white/5 whitespace-pre-line">
                     {periodization.detalhes_treino}
                  </div>
                  <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                     <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2 flex items-center gap-2"><ListFilter size={12}/> Volume Prescrito:</h4>
                     <p className="text-xs text-zinc-300 font-medium">{periodization.volume_por_grupo}</p>
                  </div>
               </div>
            </Card>
         </div>
      )}
      <EliteFooter />
    </div>
  );
}

// --- WORKOUT EDITOR ---
export function WorkoutEditorView({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  // Local state to manage list of workouts being edited
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>(student.workouts || []);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(student.workouts?.[0]?.id || null);
  const [workoutTitle, setWorkoutTitle] = useState(student.workouts?.[0]?.title || "Treino A");
  
  // Schedule State
  const [startDate, setStartDate] = useState(student.workouts?.[0]?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(student.workouts?.[0]?.endDate || "");
  const [frequency, setFrequency] = useState<number>(student.workouts?.[0]?.frequencyWeekly || 3);

  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exerciseOptions, setExerciseOptions] = useState<Exercise[]>([]); 
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseImage, setExerciseImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Current exercises for the workout being edited
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<Exercise[]>(student.workouts?.[0]?.exercises || []);

  // Exercise config state (for adding new ones)
  const [exConfig, setExConfig] = useState({ sets: '3', reps: '10-12', rest: '60' });

  // UPDATE: Load exercises from STATIC database instead of Gemini
  useEffect(() => {
    if (selectedMuscle) {
      setLoadingOptions(true);
      const list = EXERCISE_DATABASE[selectedMuscle] || [];
      const formattedList = list.map(name => ({
        name: name,
        description: "Exercício Padrão Elite",
        benefits: ""
      }));
      setExerciseOptions(formattedList);
      setLoadingOptions(false);
    } else {
      setExerciseOptions([]);
    }
  }, [selectedMuscle]);

  // Calculate Projected Sessions when dates change
  const projectedSessions = useMemo(() => {
    if (!startDate || !endDate) return 10; // Default
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const weeks = diffDays / 7;
    
    // Rough logic based on frequency. If frequency is weekly:
    // This implies this specific Workout (e.g. A) is done 'frequency' times? 
    // Usually Frequency is Total. Let's assume Frequency is for THIS workout for now for simplicity, 
    // or calculate based on total split.
    // If user inputs "3x week" for "Treino A", it means 3*weeks.
    return Math.round(weeks * frequency);
  }, [startDate, endDate, frequency]);

  const generateImg = async (exName: string) => {
    setImageLoading(true); 
    setExerciseImage(null);
    const imgUrl = await generateExerciseImage(exName);
    setExerciseImage(imgUrl);
    setImageLoading(false);
  };

  const addExercise = () => {
    if (!selectedExercise) return;
    setCurrentWorkoutExercises([
      ...currentWorkoutExercises, 
      { 
        ...selectedExercise, 
        id: Date.now().toString() + Math.random(), 
        thumb: exerciseImage,
        sets: exConfig.sets,
        reps: exConfig.reps,
        rest: exConfig.rest
      }
    ]);
    setSelectedExercise(null);
  };

  // Helper to update exercises in the list
  const updateExercise = (id: string, field: string, value: string) => {
    setCurrentWorkoutExercises(prev => prev.map(ex => 
        ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const handleSaveWorkout = () => {
    const newWorkout: Workout = {
        id: currentWorkoutId || Date.now().toString(),
        title: workoutTitle,
        exercises: currentWorkoutExercises,
        startDate,
        endDate,
        frequencyWeekly: frequency,
        projectedSessions
    };

    let updatedWorkouts = [...allWorkouts];
    const index = updatedWorkouts.findIndex(w => w.id === newWorkout.id);
    
    if (index >= 0) {
        updatedWorkouts[index] = newWorkout;
    } else {
        updatedWorkouts.push(newWorkout);
    }

    setAllWorkouts(updatedWorkouts);
    setCurrentWorkoutId(newWorkout.id); // Stay on this workout

    // Save to Firebase
    // Add Notification
    const notif: AppNotification = {
      id: Date.now().toString(),
      type: 'WORKOUT',
      message: `Novo Treino "${workoutTitle}" prescrito! Válido até ${new Date(endDate).toLocaleDateString('pt-BR')}`,
      timestamp: Date.now(),
      read: false
    };

    onSave(student.id, { 
      workouts: updatedWorkouts,
      notifications: [notif, ...(student.notifications || [])]
    });
    
    alert("Treino salvo e notificação enviada ao aluno!");
  };

  const handleNewWorkout = () => {
    setWorkoutTitle("Novo Treino");
    setCurrentWorkoutExercises([]);
    setCurrentWorkoutId(null);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate("");
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left">
      <style>{animationStyles}</style>
      <header className="flex items-center justify-between mb-10 text-left">
        <div className="flex items-center gap-4 text-left">
          <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
          <h2 className="text-xl font-black italic uppercase text-left">Prescreve <span className="text-red-600">AI</span></h2>
        </div>
        <div className="flex gap-2">
            <button onClick={handleNewWorkout} className="bg-zinc-800 px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center gap-2">
               <FilePlus size={14}/> Novo
            </button>
            <button onClick={onBack} className="bg-green-600 px-6 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg text-white hover:bg-green-700 transition-all flex items-center gap-2">
               <Check size={14}/> Concluir
            </button>
        </div>
      </header>

      {/* Workout Naming Section */}
      <div className="mb-8">
         <Card className="p-6 bg-zinc-900 border-red-600/30">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-red-500 mb-2 block tracking-widest">Identificação do Treino</label>
                <div className="flex items-center gap-3">
                   <Layout className="text-zinc-500"/>
                   <input 
                     type="text" 
                     value={workoutTitle} 
                     onChange={(e) => setWorkoutTitle(e.target.value)} 
                     className="bg-transparent border-b-2 border-zinc-700 w-full text-2xl font-black uppercase italic text-white focus:border-red-600 outline-none placeholder:text-zinc-700"
                     placeholder="EX: TREINO A - PEITO E TRÍCEPS"
                   />
                </div>
              </div>

              {/* SCHEDULE INPUTS */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                 <div>
                    <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Início</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-red-600" />
                 </div>
                 <div>
                    <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Renovação (Fim)</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-red-600" />
                 </div>
                 <div>
                    <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Freq. Semanal (Deste Treino)</label>
                    <input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-red-600" placeholder="Ex: 2" />
                 </div>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500">Total Projetado:</span>
                  <span className="text-red-500 font-black">{projectedSessions} Sessões</span>
              </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
        <aside className="lg:col-span-4 space-y-6 text-white text-left">
          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-white/5 text-left text-white">
             <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block text-left">Músculo Alvo</label>
             <select className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white font-bold" onChange={e => setSelectedMuscle(e.target.value)}>
                <option value="">Selecione...</option>
                {Object.keys(EXERCISE_DATABASE).map(m => <option key={`sel-muscle-${m}`} value={m}>{m}</option>)}
             </select>
             <div className="mt-6 space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                {loadingOptions ? <Loader2 className="animate-spin mx-auto text-red-600" /> : exerciseOptions.map((ex, i) => (
                  <button key={`opt-ex-edit-${i}`} onClick={() => { setSelectedExercise(ex); generateImg(ex.name); }} className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase border transition-all flex items-center justify-between ${selectedExercise?.name === ex.name ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-white/5 text-zinc-500 hover:bg-zinc-800'}`}>
                    {ex.name} <Play size={10} fill="currentColor"/>
                  </button>
                ))}
             </div>
          </div>
          {currentWorkoutExercises.length > 0 && (
             <div className="bg-zinc-900 p-6 rounded-[2.5rem] space-y-3 text-left">
                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest text-left">Sequência: {workoutTitle}</h3>
                {currentWorkoutExercises.map((ex, i) => (
                  <div key={`seq-edit-${ex.id}-${i}`} className="flex flex-col gap-2 p-3 bg-black rounded-xl border border-white/5 text-white text-left shadow-inner">
                     <div className="flex items-center gap-3">
                        {/* Ordinal Number */}
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                           <span className="text-[10px] font-black text-white">{i + 1}º</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                          <img src={ex.thumb || ""} className="w-full h-full object-cover" alt=""/>
                        </div>
                        <span className="text-[9px] font-black uppercase truncate flex-1">{ex.name}</span>
                        <button onClick={() => setCurrentWorkoutExercises(currentWorkoutExercises.filter(x => x.id !== ex.id))}><Trash2 size={12} className="text-red-600"/></button>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col">
                           <label className="text-[6px] uppercase font-bold text-zinc-500">Séries</label>
                           <input 
                              type="text" 
                              value={ex.sets || ''} 
                              onChange={(e) => ex.id && updateExercise(ex.id, 'sets', e.target.value)}
                              className="bg-zinc-900 border border-white/5 p-1 rounded text-[10px] text-center text-white" 
                           />
                        </div>
                        <div className="flex flex-col">
                           <label className="text-[6px] uppercase font-bold text-zinc-500">Reps</label>
                           <input 
                              type="text" 
                              value={ex.reps || ''} 
                              onChange={(e) => ex.id && updateExercise(ex.id, 'reps', e.target.value)}
                              className="bg-zinc-900 border border-white/5 p-1 rounded text-[10px] text-center text-white" 
                           />
                        </div>
                        <div className="flex flex-col">
                           <label className="text-[6px] uppercase font-bold text-zinc-500">Rec(s)</label>
                           <input 
                              type="text" 
                              value={ex.rest || ''} 
                              onChange={(e) => ex.id && updateExercise(ex.id, 'rest', e.target.value)}
                              className="bg-zinc-900 border border-white/5 p-1 rounded text-[10px] text-center text-white" 
                           />
                        </div>
                     </div>
                  </div>
                ))}
                
                {/* SAVE BUTTON FOR THE LIST */}
                <button onClick={handleSaveWorkout} className="w-full mt-4 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Save size={16}/> Salvar Prescrição & Notificar
                </button>
             </div>
          )}
        </aside>

        <section className="lg:col-span-8 text-white">
           {selectedExercise ? (
             <Card className="bg-zinc-900/50 border-white/10 shadow-2xl text-white">
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                   {imageLoading ? (
                       <div className="text-center text-white">
                           <Loader2 className="animate-spin text-red-600 mb-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white text-center">A carregar...</span>
                       </div>
                   ) : (
                       <>
                           <div className="w-full h-full relative video-motion-engine">
                               <img src={exerciseImage || ""} className="w-full h-full object-cover" alt={selectedExercise.name}/>
                           </div>
                           <button 
                             onClick={() => generateImg(selectedExercise.name)} 
                             className="absolute top-4 right-4 bg-black/60 hover:bg-red-600 p-2 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                             title="Regenerar Imagem"
                           >
                              <RefreshCcw size={16} />
                           </button>
                       </>
                   )}
                </div>
                <div className="p-10 text-white text-left">
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter text-left">{selectedExercise.name}</h2>
                   <p className="text-sm text-zinc-400 mt-4 leading-relaxed italic text-left">"{selectedExercise.description}"</p>
                   
                   {/* Editor Controls for Adding */}
                   <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase text-zinc-500">Séries</label>
                         <input type="text" value={exConfig.sets} onChange={e => setExConfig({...exConfig, sets: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase text-zinc-500">Repetições</label>
                         <input type="text" value={exConfig.reps} onChange={e => setExConfig({...exConfig, reps: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase text-zinc-500">Descanso (s)</label>
                         <input type="text" value={exConfig.rest} onChange={e => setExConfig({...exConfig, rest: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/>
                      </div>
                   </div>

                   <button onClick={addExercise} className="w-full mt-8 py-5 bg-red-600 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-white hover:bg-red-700">Adicionar ao Treino</button>
                </div>
             </Card>
           ) : <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center opacity-20 text-center"><Video size={48} className="mb-4"/><p className="text-[10px] font-black uppercase text-white">Laboratório PhD ABFIT</p></div>}
        </section>
      </div>
    </div>
  );
}

// --- RUNNING WORKOUT MANAGER ---
export function RunningWorkoutManager({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  return (
    <div className="h-screen overflow-y-auto bg-slate-950">
        <RunTrackCoachView student={student} onBack={onBack} />
    </div>
  );
}