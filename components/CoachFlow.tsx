import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, LogOut, ChevronRight, Edit3, Plus, Ruler, 
  Trash2, Video, Play, Loader2, Brain, Activity, RotateCcw,
  Target, TrendingUp, Flame, BookOpen, Clock, ListFilter,
  Save, Layout, Zap, Footprints, Sparkles, Repeat, AlertCircle, Dumbbell,
  RefreshCcw, Image as ImageIcon, Scale, MousePointer2, FilePlus, Check, Calendar,
  ZapIcon, Lightbulb, UserPlus, FileText
} from 'lucide-react';
import { Card, EliteFooter, Logo } from './Layout';
import { Student, Exercise, PhysicalAssessment, PeriodizationPlan, Workout, AppNotification } from '../types';
import { callGemini, generateExerciseImage, generatePeriodizationPlan, generateBioInsight, generateTechnicalCue, analyzeExerciseBiomechanics } from '../services/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { RunTrackCoachView } from './RunTrack';

// --- DATABASE ATUALIZADA (PRESCREVE AI) ---
const EXERCISE_DATABASE: Record<string, string[]> = {
  "Peito": [
    "Crucifixo aberto alternado com HBC no banco declinado",
    "Crucifixo aberto alternado com HBC no banco inclinado",
    "Crucifixo aberto alternado com HBC no banco reto",
    "Crucifixo aberto com HBC no banco declinado",
    "Crucifixo aberto com HBC no banco inclinado",
    "Crucifixo aberto com HBC no banco reto",
    "Crucifixo aberto na máquina",
    "Crucifixo alternado na máquina",
    "Crucifixo em pé no cross polia alta",
    "Crucifixo em pé no cross polia média",
    "Crucifixo unilateral na máquina",
    "Extensão de cotovelos no solo (Flexão de Braços)",
    "PullUp na polia baixa pegada supinada",
    "Supino aberto banco declinado no smith",
    "Supino aberto banco inclinado no smith",
    "Supino aberto no banco reto no smith",
    "Supino alternado banco 45° fechado no crossover",
    "Supino alternado banco 45° no crossover",
    "Supino alternado banco 75° aberto no crossover",
    "Supino alternado banco 75° fechado no crossover",
    "Supino alternado banco reto aberto no crossover",
    "Supino alternado banco reto fechado no crossover",
    "Supino alternado deitado aberto na máquina",
    "Supino alternado deitado fechado na máquina",
    "Supino alternado inclinado aberto na máquina",
    "Supino alternado inclinado fechado na máquina",
    "Supino alternado sentado aberto na máquina",
    "Supino alternado sentado fechado na máquina",
    "Supino banco 45º aberto no crossover",
    "Supino banco 45º fechado no crossover",
    "Supino banco 75º aberto no crossover",
    "Supino banco 75º fechado no crossover",
    "Supino banco reto aberto no crossover",
    "Supino banco reto fechado no crossover",
    "Supino declinado alternado com HBC",
    "Supino declinado com HBC",
    "Supino declinado com HBL",
    "Supino deitado aberto na máquina",
    "Supino deitado fechado na máquina",
    "Supino inclinado aberto na máquina",
    "Supino inclinado alternado com HBC",
    "Supino inclinado com HBC",
    "Supino inclinado com HBL",
    "Supino inclinado fechado na máquina",
    "Supino Reto com HBL",
    "Supino reto alternado com HBC",
    "Supino reto com HBC",
    "Supino sentado aberto na máquina",
    "Supino sentado fechado na máquina",
    "Supino unilateral deitado aberto na máquina",
    "Supino unilateral deitado fechado na máquina",
    "Supino unilateral inclinado aberto na máquina",
    "Supino unilateral inclinado fechado na máquina",
    "Supino unilateral sentado aberto na máquina",
    "Supino unilateral sentado fechado na máquina",
    "Voador peitoral"
  ],
  "Ombro": [
    "Abdução de ombros banco 75º com HBC pegada neutra",
    "Abdução de ombros banco 75º com HBC pegada pronada",
    "Abdução de ombros em pé com HBC pegada neutra",
    "Abdução de ombros em pé com HBC pegada pronada",
    "Abdução de ombros unilateral em decúbito lateral no banco 45º HBC",
    "Abdução de ombros unilateral em decúbito lateral no banco 45º no cross",
    "Abdução de ombros unilateral no cross",
    "Desenvolvimento aberto banco 75º no smith",
    "Desenvolvimento aberto na máquina",
    "Desenvolvimento banco 75º aberto com HBC",
    "Desenvolvimento banco 75º aberto com HBM",
    "Desenvolvimento banco 75º arnold com HBC",
    "Desenvolvimento banco 75º fechado pronado com HBC",
    "Desenvolvimento banco 75º fechado pronado com HBM",
    "Desenvolvimento banco 75º fechado supinado com HBC",
    "Desenvolvimento banco 75º fechado supinado com HBM",
    "Desenvolvimento em pé aberto com HBC",
    "Desenvolvimento em pé aberto com HBM",
    "Desenvolvimento em pé arnold com HBC",
    "Desenvolvimento em pé fechado pronado com HBC",
    "Desenvolvimento em pé fechado pronado com HBM",
    "Desenvolvimento em pé fechado supinado com HBC",
    "Desenvolvimento em pé fechado supinado com HBM",
    "Desenvolvimento fechado pronado banco 75º no smith",
    "Desenvolvimento fechado supinado banco 75º no smith",
    "Encolhimento de ombros com HBC",
    "Encolhimento de ombros with HBM",
    "Encolhimento de ombros no cross",
    "Flexão de ombro with HBM pegada pronada",
    "Flexão de ombro simultâneo com HBC pegada neutra",
    "Flexão de ombro simultâneo com HBC pegada pronada",
    "Flexão de ombro unilateral com HBC pegada neutra",
    "Flexão de ombro unilateral com HBC pegada pronada",
    "Flexão de ombro unilateral no cross",
    "Remada alta banco 45º cross",
    "Remada alta com HBM no banco 45º",
    "Remada alta com Kettlebell",
    "Remada alta em decúbito dorsal cross",
    "Remada alta em pé com HBC",
    "Remada alta em pé com HBL",
    "Remada alta em pé com HBM",
    "Remada alta em pé no cross"
  ],
  "Triceps": [
    "Extensão de cotovelos fechados no solo (Flexão de braços)",
    "Tríceps banco 75º francês com HBC simultâneo",
    "Tríceps banco 75º francês com HBC unilateral",
    "Tríceps coice curvado com HBC simultâneo",
    "Tríceps coice curvado com HBC unilateral",
    "Tríceps coice curvado no cross",
    "Tríceps em pé francês com HBC simultâneo",
    "Tríceps em pé francês com HBC unilateral",
    "Tríceps francês no cross simultâneo",
    "Tríceps francês no cross unilateral",
    "Tríceps mergulho no banco reto",
    "Tríceps no cross com barra reta",
    "Tríceps no cross com barra reta inverso",
    "Tríceps no cross com barra V",
    "Tríceps no cross com barra W",
    "Tríceps no cross com corda",
    "Tríceps no cross inverso unilateral",
    "Tríceps superman no cross segurando nos cabos",
    "Tríceps supinado com HBM banco reto",
    "Tríceps supinado no smith banco reto",
    "Tríceps supinado pegada neutra com HBC",
    "Tríceps testa HBM banco reto",
    "Tríceps testa simultâneo HBC banco reto",
    "Tríceps testa simultâneo no cross",
    "Tríceps testa unilateral HBC banco reto",
    "Tríceps testa unilateral no cross"
  ],
  "Costas e Cintura Escapular": [
    "Crucifixo inverso na máquina",
    "Crucifixo inverso simultâneo no cross polia média",
    "Crucifixo inverso unilateral no cross polia média",
    "Extensão de ombros no cross barra reta",
    "Pullover no banco reto com HBC",
    "Puxada aberta com barra reta no cross polia alta",
    "Puxada aberta com barra romana pulley alto",
    "Puxada aberta no pulley alto",
    "Puxada com triângulo no pulley alto",
    "Puxada supinada com barra reta no cross polia alta",
    "Puxada supinada no pulley alto",
    "Remada aberta com barra reta no cross polia média",
    "Remada aberta com HBC decúbito ventral no banco 45°",
    "Remada aberta alternada com HBC decúbito ventral no banco 45°",
    "Remada aberta declinada no smith",
    "Remada aberta na máquina",
    "Remada baixa barra reta pegada supinada",
    "Remada baixa com barra reta",
    "Remada baixa com triângulo",
    "Remada cavalo com HBL",
    "Remada curvada aberta com cross",
    "Remada curvada aberta com cross unilateral",
    "Remada curvada aberta com HBC",
    "Remada curvada aberta com HBM",
    "Remada curvada supinada com cross",
    "Remada curvada supinada com cross unilateral",
    "Remada curvada supinada com HBC",
    "Remada curvada supinada com HBM",
    "Remada fechada alternada com HBC decubito ventral no banco 45°",
    "Remada fechada com HBC decúbito ventral no banco 45°",
    "Remada fechada na máquina",
    "Remada no banco em 3 apoios pegada aberta com HBC unilateral",
    "Remada no banco em 3 apoios pegada neutra com HBC unilateral",
    "Remada no banco em 3 apoios pegada neutra no cross unilateral",
    "Remada no banco em 3 apoios pegada supinada com HBC unilateral",
    "Remada no banco em 3 apoios pegada supinada no cross unilateral",
    "Remada supinada com barra reta no cross polia média"
  ],
  "Biceps": [
    "Bíceps banco 45º com HBC pegada neutra simultâneo",
    "Bíceps banco 45º com HBC pegada neutra unilateral",
    "Bíceps banco 45º com HBC pegada pronada simultâneo",
    "Bíceps banco 45º com HBC pegada pronada unilateral",
    "Bíceps banco 45º com HBC pegada supinada simultâneo",
    "Bíceps banco 45º com HBC pegada supinada unilateral",
    "Bíceps banco 75º com HBC pegada neutra simultâneo",
    "Bíceps banco 75º com HBC pegada neutra unilateral",
    "Bíceps banco 75º com HBC pegada pronada simultâneo",
    "Bíceps banco 75º com HBC pegada pronada unilateral",
    "Bíceps banco 75º com HBC pegada supinada simultâneo",
    "Bíceps banco 75º com HBC pegada supinada unilateral",
    "Bíceps concentrado com HBC unilateral",
    "Bíceps em pé com HBC pegada neutra alternado",
    "Bíceps em pé com HBC pegada neutra simultâneo",
    "Bíceps em pé com HBC pegada neutra unilateral",
    "Bíceps em pé com HBC pegada pronada alternado",
    "Bíceps em pé com HBC pegada pronada simultâneo",
    "Bíceps em pé com HBC pegada pronada unilateral",
    "Bíceps em pé com HBC pegada supinada alternado",
    "Bíceps em pé com HBC pegada supinada simultâneo",
    "Bíceps em pé com HBC pegada supinada unilateral",
    "Bíceps em pé com HBM pegada pronada",
    "Bíceps em pé com HBM pegada supinada",
    "Bíceps no banco scott with HBC simultâneo",
    "Bíceps no banco scott with HBC unilateral",
    "Bíceps no banco scott with HBM pronado",
    "Bíceps no banco scott with HBM supinado",
    "Bíceps no banco scott with HBW simultâneo",
    "Bíceps no cross barra reta",
    "Bíceps no cross polia baixa unilateral",
    "Bíceps superman no cross simultâneo",
    "Bíceps superman no cross unilateral"
  ],
  "Core e Abdomen": [
    "Abdominal diagonal na bola",
    "Abdominal diagonal no bosu",
    "Abdominal diagonal no solo",
    "Abdominal infra no solo puxando as pernas",
    "Abdominal infra pernas estendidas",
    "Abdominal supra na bola",
    "Abdominal supra no bosu",
    "Abdominal supra no solo",
    "Abdominal vela no solo",
    "Prancha lateral na bola em isometria",
    "Prancha lateral no bosu em isometria",
    "Prancha lateral no solo em isometria",
    "Prancha ventral na bola em isometria",
    "Prancha ventral no bosu em isometria",
    "Prancha ventral no solo em isometria"
  ],
  "Paravertebrais": [
    "Elevação de quadril em isometria no solo",
    "Mata-borrão isométrico no solo (super-man)",
    "Perdigueiro em isometria no solo"
  ],
  "Quadríceps e Adutores": [
    "Adução de quadril em decúbito dorsal",
    "Adução de quadril em decúbito lateral no solo",
    "Adução de quadril em pé no cross",
    "Agachamento búlgaro",
    "Agachamento em passada com HBC",
    "Agachamento em passada com HBL",
    "Agachamento em passada com HBM",
    "Agachamento em passada com step a frente com HBC",
    "Agachamento em passada com step a frente com HBL",
    "Agachamento em passada com step a frente com HBM",
    "Agachamento em passada com step a frente",
    "Agachamento em passada com step atrás com HBC",
    "Agachamento em passada com step atrás com HBL",
    "Agachamento em passada com step atrás com HBM",
    "Agachamento em passada com step atrás",
    "Agachamento em passada no smith",
    "Agachamento em passada com step a frente no smith",
    "Agachamento em passada com step atrás no Smith",
    "Agachamento livre com HBC",
    "Agachamento livre com HBL barra sobre ombros",
    "Agachamento livre with HBL",
    "Agachamento livre with HBM barra sobre ombros",
    "Agachamento livre",
    "Agachamento no hack machine",
    "Agachamento no sissy",
    "Agachamento no Smith barra sobre os ombros",
    "Agachamento no smith",
    "Cadeira adutora",
    "Cadeira extensora alternado",
    "Cadeira extensora unilateral",
    "Cadeira extensora",
    "Flexão de quadril e joelho em decúbito dorsal no solo com caneleira",
    "Flexão de quadril e joelho em pé com caneleira",
    "Flexão de quadril e joelho em pé no cross",
    "Flexão de quadril em decúbito dorsal no solo com caneleira",
    "Flexão de quadril em pé com caneleira",
    "Flexão de quadril em pé no cross",
    "Leg press horizontal unilateral",
    "Leg press horizontal",
    "Leg press inclinado unilateral",
    "Leg press inclinado",
    "Levantar e sentar do banco reto com HBM",
    "Levantar e sentar no banco reto com HBC",
    "Levantar e sentar no banco reto"
  ],
  "Glúteos e Posteriores": [
    "Abdução de quadril decúbito lateral no solo caneleira",
    "Abdução de quadril em pé com caneleira",
    "Agachamento sumô com HBC",
    "Agachamento sumô com HBM",
    "Cadeira flexora alternado",
    "Cadeira flexora unilateral",
    "Cadeira flexora",
    "Elevação de quadril no banco reto com HBM",
    "Elevação de Quadril no solo com anilha",
    "Extensão de quadril e joelho em pé caneleira",
    "Extensão de quadril e joelho em pé no cross",
    "Extensão de quadril e joelho no cross",
    "Extensão de quadril e joelho no solo caneleira",
    "Extensão de quadril em pé caneleira",
    "Extensão de quadril em pé no cross",
    "Extensão de quadril no cross",
    "Extensão de quadril no solo caneleira",
    "Flexão de joelho em 3 apoios com caneleira",
    "Flexão de joelho em pé com caneleira",
    "Flexão de joelho em pé no cross",
    "Levantamento terra com HBC",
    "Levantamento terra com HBL",
    "Levantamento terra com HBM",
    "Levantamento terra no cross",
    "Levantamento terra romeno com HBM",
    "Mesa flexora alternado",
    "Mesa flexora unilateral",
    "Mesa flexora",
    "Stiff com HBC simultâneo",
    "Stiff com HBC unilateral",
    "Stiff com HBM simultâneo",
    "Stiff “bom dia” com HBM",
    "Subida no step"
  ],
  "Panturrilha": [
    "Cadeira solear",
    "Flexão plantar com Halteres.",
    "Flexão plantar em pé na Máquina",
    "Flexão plantar em pé Unilateral",
    "Flexão plantar no Leg press inclinado",
    "Flexão plantar no leg press horizontal"
  ]
};

const MUSCLE_GROUPS = Object.keys(EXERCISE_DATABASE);

// --- STYLES FOR LOOP ANIMATION (Shared) ---
const animationStyles = `
  @keyframes biomechanicalVideo {
    0% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1); }
    40% { transform: scale(1.05) translateY(-5px); filter: brightness(1.1) contrast(1.1); }
    60% { transform: scale(1.05) translateY(-5px); filter: brightness(1.1) contrast(1.1); }
    100% { transform: scale(1) translateY(0); filter: brightness(1) contrast(1); }
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
    peso: '', altura: '', dc_peitoral: '', dc_abdominal: '', dc_coxa: '', dc_tricipital: '', dc_suprailiaca: '',
    bio_percentual_gordura: '', bio_massa_magra: '', bio_musculo_esqueletico: '', bio_massa_ossea: '',
    bio_agua_corporal: '', bio_gordura_visceral: '', bio_idade_metabolica: '', bio_tmb: '', p_cintura: '', p_quadril: '',
  });

  const handleSave = () => {
    const assessment = { id: Date.now().toString(), ...formData, peso: formData.peso || 0, altura: formData.altura || 0 } as PhysicalAssessment;
    const currentAssessments = student.physicalAssessments || [];
    onSave(student.id, { physicalAssessments: [assessment, ...currentAssessments] });
    onBack();
  };

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-8 text-left">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-left">Avaliação: <span className="text-blue-500">{student.nome.split(' ')[0]}</span></h2>
      </header>
      <div className="space-y-6">
        <Card className="p-6 bg-zinc-900 border-zinc-800"><div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase">DATA</label><input type="date" value={formData.data} onChange={(e) => handleChange('data', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/></div></Card>
        <Card className="p-6 bg-zinc-900 border-zinc-800"><h3 className="text-sm font-black uppercase text-blue-500 mb-4 tracking-widest flex items-center gap-2"><Scale size={16}/> Dados Básicos</h3><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase">Peso (kg)</label><input type="number" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/></div><div className="space-y-2"><label className="text-[10px] font-bold text-zinc-500 uppercase">Altura (cm)</label><input type="number" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white font-bold outline-none focus:border-blue-500"/></div></div></Card>
        <button onClick={handleSave} className="w-full py-5 bg-green-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all hover:bg-green-700 flex items-center justify-center gap-2 text-lg">FINALIZAR AVALIAÇÃO</button>
      </div>
    </div>
  );
}

// --- PERIODIZATION GENERATOR ---
export function PeriodizationView({ student, onBack, onProceedToWorkout }: { student: Student, onBack: () => void, onProceedToWorkout: () => void }) {
  // ... (Periodization implementation unchanged, using generatePeriodizationPlan from gemini.ts)
  const [step, setStep] = useState<'avaliacao' | 'gerando' | 'painel'>('avaliacao');
  const [formData, setFormData] = useState({ name: student.nome, regularity: 'voltando', goal: 'hipertrofia', daysPerWeek: '4', splitPreference: 'anterior_posterior', type: 'STRENGTH' });
  const [periodization, setPeriodization] = useState<any>(null);

  const handleGenerate = async () => {
    setStep('gerando');
    const result = await generatePeriodizationPlan(formData);
    if (result) {
      const pData: PeriodizationPlan = { ...result, id: Date.now().toString(), startDate: new Date().toISOString(), type: formData.type };
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id);
        const updateData = formData.type === 'RUNNING' ? { runningPeriodization: pData } : { periodization: pData };
        await setDoc(docRef, updateData, { merge: true });
        setPeriodization(pData);
        setStep('painel');
      } catch (e) { console.error(e); setPeriodization(pData); setStep('painel'); }
    } else { setStep('avaliacao'); alert("Erro ao gerar periodização."); }
  };

  return (
    <div className="p-6 h-screen overflow-y-auto pb-48 text-white custom-scrollbar text-left">
      <header className="flex items-center justify-between mb-8 text-left">
         <div className="flex items-center gap-4"><button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button><h2 className="text-xl font-black italic uppercase tracking-tighter text-left">Ciência<span className="text-red-600">Força</span></h2></div>
         {step === 'painel' && (<button onClick={() => setStep('avaliacao')} className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 hover:text-white transition-colors"><RotateCcw size={12}/> Reiniciar</button>)}
      </header>
      {step === 'avaliacao' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="p-8 mb-6 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-4 mb-6"><div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-2xl"><Brain size={24}/></div><div><h2 className="text-2xl font-black uppercase italic tracking-tighter">Anamnese Avançada</h2><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Protocolo PBE • EEFD/UFRJ</p></div></div>
              <div className="space-y-6">
                 <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Condição Biológica Atual</label><select value={formData.regularity} onChange={e => setFormData({...formData, regularity: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors"><option value="sedentary">Iniciante / Sedentário</option><option value="voltando">Retomada (Sem ritmo)</option><option value="regular">Regular (Consistente)</option><option value="stagnated">Estagnado (Platô)</option><option value="performance">Alta Performance</option></select></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Dias/Semana</label><input type="number" value={formData.daysPerWeek} onChange={e => setFormData({...formData, daysPerWeek: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Objetivo</label><select value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-indigo-500 transition-colors"><option value="emagrecimento">Emagrecimento</option><option value="hipertrofia">Hipertrofia</option><option value="forca_pura">Força Pura</option></select></div></div>
              </div>
              <button onClick={handleGenerate} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"><Brain size={18}/> Gerar Planilha de Carga</button>
           </Card>
        </div>
      )}
      {step === 'gerando' && (<div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in"><div className="relative"><Loader2 size={64} className="text-indigo-600 animate-spin"/><Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={20} /></div><p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 animate-pulse">Analisando Biomecânica...</p></div>)}
      {step === 'painel' && periodization && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
            <Card className="p-6 bg-zinc-900 border-indigo-500/30 relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10"><Target size={120} className="text-indigo-500"/></div><div className="relative z-10"><div className="flex items-center gap-2 mb-2"><span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Ciência da Força</span><span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">PBE • UFRJ</span></div><h1 className="text-3xl font-black italic uppercase leading-none mb-4">{periodization.titulo}</h1><button onClick={onProceedToWorkout} className="bg-red-600 hover:bg-red-700 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-all"><Edit3 size={16}/> Configurar Treinos (Exercícios)</button></div></Card>
            <div className="grid grid-cols-2 gap-3">{periodization.microciclos.map((m: any, i: number) => (<div key={i} className={`p-4 rounded-2xl border transition-all ${i === 3 ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-zinc-900 border-zinc-800'}`}><div className="flex justify-between items-start mb-2"><span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${i === 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>Semana {m.semana}</span><TrendingUp size={14} className={i === 3 ? "text-emerald-500" : "text-zinc-600"} /></div><h3 className="font-black text-sm mb-3 uppercase leading-tight text-white">{m.foco}</h3><div className="space-y-1"><div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400"><Flame size={10} className={i === 3 ? "text-amber-400" : "text-zinc-600"}/> PSE: {m.pse_alvo}</div><div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400"><Activity size={10} className={i === 3 ? "text-white" : "text-zinc-600"}/> REPS: {m.faixa_repeticoes}</div></div></div>))}</div>
         </div>
      )}
      <EliteFooter />
    </div>
  );
}

// --- WORKOUT EDITOR ---
export function WorkoutEditorView({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>(student.workouts || []);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(student.workouts?.[0]?.id || null);
  const [workoutTitle, setWorkoutTitle] = useState(student.workouts?.[0]?.title || "Treino A");
  
  const [startDate, setStartDate] = useState(student.workouts?.[0]?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(student.workouts?.[0]?.endDate || "");
  const [frequency, setFrequency] = useState<number>(student.workouts?.[0]?.frequencyWeekly || 3);

  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  const [exerciseImage, setExerciseImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [bioInsight, setBioInsight] = useState<string>("");
  const [technicalCue, setTechnicalCue] = useState<string>("");
  const [isGeneratingCue, setIsGeneratingCue] = useState(false);
  
  const [currentWorkoutExercises, setCurrentWorkoutExercises] = useState<Exercise[]>(student.workouts?.[0]?.exercises || []);
  const [exConfig, setExConfig] = useState({ sets: '3', reps: '10-12', rest: '60' });

  // Generate Bio-Insight on mount
  useEffect(() => {
    generateBioInsight(student).then(setBioInsight);
  }, [student]);

  useEffect(() => {
    if (selectedMuscle) {
      setExerciseOptions(EXERCISE_DATABASE[selectedMuscle] || []);
    } else {
      setExerciseOptions([]);
    }
  }, [selectedMuscle]);

  const processExerciseSelection = async (exName: string) => {
    setImageLoading(true);
    setExerciseImage(null);
    setTechnicalCue("");
    setSelectedExercise({ name: exName, description: "Aguarde análise biomecânica...", benefits: "" });

    try {
        const analysis = await analyzeExerciseBiomechanics(exName);
        if (analysis) {
            setSelectedExercise({ name: exName, description: analysis.description, benefits: analysis.benefits });
            const img = await generateExerciseImage(exName, analysis.visualPrompt);
            setExerciseImage(img);
            generateTechnicalCue(exName).then(setTechnicalCue);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setImageLoading(false);
    }
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
    setExerciseImage(null);
  };

  const handleSaveWorkout = () => {
    const newWorkout: Workout = {
        id: currentWorkoutId || Date.now().toString(),
        title: workoutTitle,
        exercises: currentWorkoutExercises,
        startDate,
        endDate,
        frequencyWeekly: frequency,
        projectedSessions: Math.round(frequency * 4) // Approx
    };

    let updatedWorkouts = [...allWorkouts];
    const index = updatedWorkouts.findIndex(w => w.id === newWorkout.id);
    
    if (index >= 0) {
        updatedWorkouts[index] = newWorkout;
    } else {
        updatedWorkouts.push(newWorkout);
    }

    setAllWorkouts(updatedWorkouts);
    setCurrentWorkoutId(newWorkout.id);

    const notif: AppNotification = {
      id: Date.now().toString(),
      type: 'WORKOUT',
      message: `Novo Treino "${workoutTitle}" prescrito!`,
      timestamp: Date.now(),
      read: false
    };

    onSave(student.id, { 
      workouts: updatedWorkouts,
      notifications: [notif, ...(student.notifications || [])]
    });
    alert("Treino salvo!");
  };

  const handleNewWorkout = () => {
    setWorkoutTitle("Novo Treino");
    setCurrentWorkoutExercises([]);
    setCurrentWorkoutId(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 overflow-x-hidden p-6 pb-48">
      <style>{animationStyles}</style>
      
      <header className="flex items-center justify-between mb-10 text-left sticky top-0 z-50 bg-black/90 backdrop-blur-md py-4 border-b border-white/5">
        <div className="flex items-center gap-4 text-left">
          <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-1.5 rounded-lg rotate-3 shadow-lg shadow-amber-500/20"><Video className="w-5 h-5 text-black" /></div>
            <h2 className="text-xl font-black italic uppercase text-left">Prescreve <span className="text-amber-500">AI</span></h2>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleNewWorkout} className="bg-zinc-800 px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all flex items-center gap-2"><FilePlus size={14}/> Novo</button>
            <button onClick={onBack} className="bg-green-600 px-6 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg text-white hover:bg-green-700 transition-all flex items-center gap-2"><Check size={14}/> Concluir</button>
        </div>
      </header>

      {/* Workout Metadata */}
      <div className="mb-8">
         <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-amber-500 mb-2 block tracking-widest">Identificação do Treino</label>
                <div className="flex items-center gap-3"><Layout className="text-zinc-500"/><input type="text" value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} className="bg-transparent border-b-2 border-zinc-700 w-full text-2xl font-black uppercase italic text-white focus:border-amber-500 outline-none placeholder:text-zinc-700" placeholder="EX: TREINO A"/></div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                 <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Início</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-amber-500" /></div>
                 <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Fim</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-amber-500" /></div>
                 <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Freq.</label><input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full bg-black border border-white/10 rounded-xl p-2 text-xs font-bold text-white outline-none focus:border-amber-500" /></div>
              </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
        {/* Left Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {bioInsight && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 shadow-xl animate-in slide-in-from-left-4">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-amber-500" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Bio-Insight ✨</span></div>
              <div className="text-[11px] text-neutral-300 leading-relaxed italic whitespace-pre-wrap">{bioInsight}</div>
            </div>
          )}

          <div className="bg-zinc-900 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
             <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block">Inventário Prescrito</label>
             <select className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white font-bold mb-4 focus:border-amber-500 outline-none" onChange={e => setSelectedMuscle(e.target.value)}>
                <option value="">Grupo Muscular...</option>
                {Object.keys(EXERCISE_DATABASE).map(m => <option key={`sel-muscle-${m}`} value={m}>{m}</option>)}
             </select>
             <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {exerciseOptions.map((ex, i) => (
                  <button key={`opt-ex-${i}`} onClick={() => processExerciseSelection(ex)} className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase border transition-all flex items-center justify-between ${selectedExercise?.name === ex ? 'bg-amber-500 border-amber-500 text-black' : 'bg-black border-white/5 text-zinc-500 hover:bg-zinc-800'}`}>
                    <span className="truncate">{ex}</span> <Play size={10} fill="currentColor"/>
                  </button>
                ))}
             </div>
          </div>

          {currentWorkoutExercises.length > 0 && (
             <div className="bg-zinc-900 p-6 rounded-[2.5rem] space-y-3">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Sequência Atual</h3>
                {currentWorkoutExercises.map((ex, i) => (
                  <div key={`seq-edit-${i}`} className="flex items-center gap-3 p-3 bg-black rounded-xl border border-white/5 text-white">
                     <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0"><span className="text-[10px] font-black text-black">{i + 1}</span></div>
                     <span className="text-[9px] font-black uppercase truncate flex-1">{ex.name}</span>
                     <button onClick={() => setCurrentWorkoutExercises(currentWorkoutExercises.filter((_, idx) => idx !== i))}><Trash2 size={12} className="text-red-600"/></button>
                  </div>
                ))}
                <button onClick={handleSaveWorkout} className="w-full mt-4 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={16}/> Salvar Treino</button>
             </div>
          )}
        </aside>

        {/* Main Content (Right) */}
        <section className="lg:col-span-8">
           {!selectedExercise ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-900/20">
                <Video className="w-16 h-16 opacity-10 mb-6" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-amber-500 text-center px-8">Selecione um exercício para ver a biomecânica 8K analisada por IA</p>
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="bg-zinc-900/80 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
                  {/* Video/Image Player */}
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-white/5 group">
                     {imageLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                           <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500 mt-4">Analisando Biomecânica...</span>
                        </div>
                     ) : exerciseImage ? (
                        <div className="w-full h-full relative video-motion-engine">
                           <img src={exerciseImage} alt={selectedExercise.name} className="w-full h-full object-cover" />
                           <div className="absolute top-8 left-8 flex items-center gap-3">
                              <div className="bg-red-600 h-2 w-2 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-md">LIVE BIOMECHANIC FEED</span>
                           </div>
                        </div>
                     ) : <Activity className="text-zinc-700 w-24 h-24"/>}
                  </div>

                  <div className="p-10">
                     <div className="flex justify-between items-start mb-8">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none max-w-lg">{selectedExercise.name}</h2>
                        {technicalCue && (
                           <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-xs">
                              <div className="flex items-center gap-2 mb-2"><Zap className="w-3 h-3 text-amber-500 fill-amber-500"/><span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Dica IA</span></div>
                              <p className="text-xs text-zinc-300 italic leading-relaxed">"{technicalCue}"</p>
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2"><ZapIcon className="w-4 h-4 fill-amber-500" /> Técnica Aplicada</h4>
                           <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-amber-500/20 pl-4">{selectedExercise.description}</p>
                        </div>
                        <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Impacto Fisiológico</h4>
                           <p className="text-zinc-400 text-xs italic whitespace-pre-wrap">{selectedExercise.benefits}</p>
                        </div>
                     </div>

                     {/* Add to Workout Controls */}
                     <div className="bg-zinc-800/50 p-6 rounded-[2rem] border border-white/10">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                           <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-500">Séries</label><input type="text" value={exConfig.sets} onChange={e => setExConfig({...exConfig, sets: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/></div>
                           <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-500">Reps</label><input type="text" value={exConfig.reps} onChange={e => setExConfig({...exConfig, reps: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/></div>
                           <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-500">Desc(s)</label><input type="text" value={exConfig.rest} onChange={e => setExConfig({...exConfig, rest: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white text-center"/></div>
                        </div>
                        <button onClick={addExercise} className="w-full py-4 bg-amber-500 rounded-2xl font-black uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:bg-amber-400">Adicionar ao Treino</button>
                     </div>
                  </div>
               </div>
             </div>
           )}
        </section>
      </div>
    </div>
  );
}

// --- RUNNING WORKOUT MANAGER ---
export function RunningWorkoutManager({ student, onBack, onSave }: { student: Student, onBack: () => void, onSave: (id: string, data: any) => void }) {
  return (
    <div className="h-screen overflow-y-auto bg-black custom-scrollbar">
        <RunTrackCoachView student={student} onBack={onBack} />
    </div>
  );
}