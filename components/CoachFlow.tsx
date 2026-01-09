import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, LogOut, ChevronRight, Edit3, Plus, 
  Trash2, Loader2, Brain, Activity, Target, TrendingUp, 
  BookOpen, Zap, AlertCircle, Dumbbell,
  Image as ImageIcon, Save, Book, Ruler, Scale, Footprints,
  Users, Info, Sparkles, LayoutGrid, Calendar, Clock, Play, FileText, Folder,
  ChevronDown
} from 'lucide-react';
import { Card, EliteFooter, Logo } from './Layout';
import { Student, Exercise, PhysicalAssessment, Workout } from '../types';
import { generateExerciseImage, generatePeriodizationPlan, generateTechnicalCue } from '../services/gemini';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { RunTrackCoachView } from './RunTrack';

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
          <button onClick={() => onNavigate('RUN_TRACK_COACH')} className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-zinc-800 transition-all shadow-lg">
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

export function WorkoutEditorView({ student, workoutToEdit, onBack, onSave }: { student: Student, workoutToEdit: Workout | null, onBack: () => void, onSave: (id: string, data: any) => void }) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(workoutToEdit || { 
    id: Date.now().toString(), 
    title: '', 
    exercises: [],
    startDate: new Date().toLocaleDateString('pt-BR'),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    frequencyWeekly: 3
  });

  const [selectedMuscle, setSelectedMuscle] = useState("Peito");
  const [options, setOptions] = useState<string[]>(EXERCISE_DATABASE["Peito"] || []);
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
      <header className="flex items-center justify-between mb-8 py-4 border-b border-white/5">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-black italic tracking-tighter uppercase">PRESCREVE<span className="text-red-600">AI</span></h1>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{currentWorkout.title || 'Novo Treino'}</p>
        </div>
        <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 px-8 py-2.5 rounded-xl font-black text-xs uppercase shadow-xl transition-all active:scale-95">
          Salvar
        </button>
      </header>

      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
         <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
            <h4 className="text-orange-500 font-black uppercase text-[9px] tracking-[0.3em] mb-4 flex items-center gap-2 italic">
               <Folder size={12} /> IDENTIFICAÇÃO DO TREINO
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
               <div className="md:col-span-1 space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Planilha</label>
                  <div className="relative">
                     <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                     <input 
                        value={currentWorkout.title} 
                        onChange={e => setCurrentWorkout({...currentWorkout, title: e.target.value})} 
                        className="w-full bg-black/60 p-4 pl-12 rounded-xl text-sm font-black uppercase outline-none focus:border-red-600 border border-white/5 shadow-inner" 
                        placeholder="NOME DA PLANILHA..." 
                     />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Início</label>
                  <input 
                    value={currentWorkout.startDate} 
                    onChange={e => setCurrentWorkout({...currentWorkout, startDate: e.target.value})} 
                    className="w-full bg-black/60 p-4 rounded-xl text-sm font-bold outline-none border border-white/5 text-zinc-400 shadow-inner" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Fim</label>
                  <input 
                    value={currentWorkout.endDate} 
                    onChange={e => setCurrentWorkout({...currentWorkout, endDate: e.target.value})} 
                    className="w-full bg-black/60 p-4 rounded-xl text-sm font-bold outline-none border border-white/5 text-zinc-400 shadow-inner" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1 italic">Freq.</label>
                  <input 
                    type="number" 
                    value={currentWorkout.frequencyWeekly} 
                    onChange={e => setCurrentWorkout({...currentWorkout, frequencyWeekly: Number(e.target.value)})} 
                    className="w-full bg-black/60 p-4 rounded-xl text-sm font-black outline-none border border-white/5 text-white shadow-inner" 
                  />
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl min-h-[500px] flex flex-col">
             <h4 className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-6 italic border-b border-white/5 pb-4">
                INVENTÁRIO PRESCRITO
             </h4>
             
             <div className="relative mb-6">
                <select 
                   onChange={e => setSelectedMuscle(e.target.value)} 
                   className="w-full bg-black p-5 rounded-2xl text-xs font-black uppercase border-2 border-red-600/30 outline-none focus:border-red-600 transition-all text-white appearance-none cursor-pointer"
                >
                   {Object.keys(EXERCISE_DATABASE).map(m => <option key={m} value={m}>{m}...</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
             </div>
             
             <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {options.map(ex => (
                  <button 
                    key={ex} 
                    onClick={() => addEx(ex)} 
                    disabled={imageLoading} 
                    className="w-full text-left p-4 rounded-xl text-[10px] font-black uppercase bg-black/60 border border-white/5 hover:border-red-600/50 hover:bg-zinc-800/50 transition-all flex items-center justify-between group active:scale-[0.98]"
                  >
                    <span className="text-zinc-400 group-hover:text-white truncate max-w-[80%]">{ex}</span>
                    {imageLoading ? (
                        <Loader2 size={14} className="animate-spin text-zinc-600" />
                    ) : (
                        <ChevronRight size={16} className="text-zinc-700 group-hover:text-red-600" />
                    )}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="relative">
              <h4 className="text-[10px] font-black uppercase text-zinc-600 mb-4 flex items-center gap-2 italic tracking-widest ml-4">
                 <LayoutGrid size={14} /> SEQUÊNCIA MONTADA
              </h4>
              
              <div className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-[3rem] min-h-[400px] w-full relative flex flex-col items-center justify-center p-8 overflow-hidden group">
                  {currentWorkout.exercises.length === 0 ? (
                      <div className="flex flex-col items-center gap-6 animate-pulse">
                          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5">
                            <Activity className="text-zinc-700" size={48} />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">SELECIONE EXERCÍCIOS AO LADO PARA</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic mt-1">COMPOR O TREINO</p>
                          </div>
                      </div>
                  ) : (
                      <div className="w-full space-y-6">
                         <div className="aspect-video bg-black rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl">
                            {previewEx?.thumb ? (
                                <img src={previewEx.thumb} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                                   <Activity size={80} className="text-zinc-600 mb-4 animate-pulse" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Análise de Performance</span>
                                </div>
                            )}
                            {previewEx && (
                                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                   <h4 className="text-xl font-black italic uppercase text-white mb-2">{previewEx.name}</h4>
                                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} className="text-red-600" /> Biomecânica validada via IA</p>
                                </div>
                            )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentWorkout.exercises.map((ex, i) => (
                                <div key={ex.id} onClick={() => setPreviewEx(ex)} className={`p-5 rounded-[2rem] flex items-center gap-4 border-2 transition-all cursor-pointer group/item ${previewEx?.id === ex.id ? 'border-red-600/50 bg-zinc-800/50 shadow-lg' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                                        {ex.thumb ? <img src={ex.thumb} className="w-full h-full object-cover" /> : <Activity className="m-auto mt-4 text-zinc-800" size={24}/>}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black uppercase text-xs italic truncate text-zinc-200 group-hover/item:text-white transition-colors">{ex.name}</h4>
                                        <div className="flex gap-2 mt-2">
                                            <div className="bg-black/80 px-2 py-1 rounded text-[8px] font-black text-zinc-500 uppercase tracking-tighter">S: {ex.sets}</div>
                                            <div className="bg-black/80 px-2 py-1 rounded text-[8px] font-black text-zinc-500 uppercase tracking-tighter">R: {ex.reps}</div>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setCurrentWorkout({...currentWorkout, exercises: currentWorkout.exercises.filter((_, idx) => idx !== i)}); }} className="text-zinc-700 hover:text-red-600 p-2 transition-colors">
                                       <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                         </div>
                      </div>
                  )}
              </div>
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