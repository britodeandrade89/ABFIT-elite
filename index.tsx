import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ArrowLeft, User as UserIcon, Loader2, Dumbbell, CheckCircle2, HeartPulse, 
  Trophy, Camera, Brain, Ruler, Footprints, AlertCircle, LogOut, ChevronRight,
  Edit3, Plus, Trash2, Activity, Target, TrendingUp, BookOpen, Zap, Info,
  Search, RefreshCw, Sun, CloudRain, Bell, MapPin, Navigation, Clock, Save,
  ChevronDown, LayoutGrid, FileText, Folder, ChefHat, Utensils, Repeat, Sparkles,
  Timer, RotateCw, Power, FastForward, Maximize2, X, Star, ExternalLink, List, Calendar
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, addDoc, deleteDoc, where, getDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';

// --- CONFIGURAÇÃO INICIAL E SERVIÇOS ---

const firebaseConfig = window.__firebase_config || { apiKey: "dummy" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = window.__app_id || 'abfit-elite-production';

// Inicialização segura do Gemini
const getAiClient = () => {
  const key = process.env.API_KEY || (window as any).process?.env?.API_KEY;
  return new GoogleGenAI({ apiKey: key });
};
const ai = getAiClient();
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

// --- TIPOS ---

export interface Exercise {
  id?: string;
  name: string;
  description?: string;
  thumb?: string | null;
  sets?: string;
  reps?: string;
  rest?: string;
}

export interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
  startDate?: string;
  endDate?: string;
  frequencyWeekly?: number;
}

export interface PeriodizationPlan {
  id: string;
  titulo: string;
  modelo_teorico?: string;
  objetivo_longo_prazo?: string;
  microciclos: any[];
  notas_phd?: string;
}

export interface Student {
  id: string;
  nome: string;
  email: string;
  photoUrl?: string;
  workouts?: Workout[];
  periodization?: PeriodizationPlan;
  weight?: string | number;
  goal?: string;
  daysPerWeek?: string | number;
}

// --- SERVIÇOS IA ---

const cleanJson = (t: string) => t.replace(/```json|```/g, "").trim();

async function generatePeriodization(data: any) {
  try {
    const res = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Gere um mesociclo de 4 semanas para atleta: ${data.nome}, objetivo: ${data.goal}, frequencia: ${data.daysPerWeek}x. Retorne apenas JSON: {titulo, modelo_teorico, objetivo_longo_prazo, microciclos:[{semana, tipo, foco, faixa_repeticoes, pse_alvo}], notas_phd}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(res.text || "{}"));
  } catch (e) { return null; }
}

async function getExerciseImage(name: string) {
  try {
    const res = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: `High quality shot of athlete doing ${name}` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = res.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (e) { return null; }
}

// --- COMPONENTES UI ---

const Logo = ({ size = "text-8xl", subSize = "text-[10px]" }: any) => (
  <div className="text-center flex flex-col items-center">
    <h1 className={`${size} font-black italic transform -skew-x-12 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white uppercase`}>
      <span className="text-red-600">AB</span>FIT
    </h1>
    <p className={`${subSize} text-zinc-500 tracking-[0.2em] uppercase font-bold mt-1`}>Assessoria em Treinamentos Físicos</p>
  </div>
);

const Card = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden ${className}`}>{children}</div>
);

// --- COMPONENTES DE FLUXO ---

function StudentView({ student, onNavigate }: any) {
  return (
    <div className="p-6 text-white text-center pt-10 animate-fadeIn h-screen overflow-y-auto pb-32">
      <div className="flex justify-between items-start mb-12">
         <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border-2 border-red-600 overflow-hidden shadow-2xl">
            {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover" /> : <div className="p-4"><UserIcon className="text-zinc-700 w-full h-full" /></div>}
         </div>
         <div className="bg-zinc-900 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
            <Sun className="text-amber-500" size={14} /> <span className="text-xs font-black">28°C</span>
         </div>
      </div>
      
      <div className="mb-14"><Logo size="text-6xl" subSize="text-[9px]" /></div>
      
      <div className="space-y-4 text-left">
        <button onClick={() => onNavigate('STUDENT_PERIODIZATION')} className="w-full bg-zinc-900 p-8 rounded-[3rem] border border-zinc-800 flex items-center justify-between group">
            <div className="flex flex-col items-start"><span className="font-black italic uppercase text-lg">Periodização PhD</span><p className="text-[8px] text-zinc-500 font-bold uppercase">Planejamento Científico</p></div>
            <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20"><Brain className="text-indigo-500" /></div>
        </button>

        <button onClick={() => onNavigate('WORKOUTS')} className="w-full bg-zinc-900 p-8 rounded-[3rem] border border-zinc-800 flex items-center justify-between group">
            <div className="flex flex-col items-start"><span className="font-black italic uppercase text-lg">Meus Treinos</span><p className="text-[8px] text-zinc-500 font-bold uppercase">Sessões Prescritas</p></div>
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20"><Dumbbell className="text-red-600" /></div>
        </button>
      </div>
    </div>
  );
}

function CoachView({ students, onLogout, onSelect }: any) {
  const [search, setSearch] = useState('');
  const filtered = students.filter((s: Student) => s.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 animate-fadeIn h-screen overflow-y-auto text-left pb-32">
      <header className="flex items-center justify-between mb-10">
        <Logo size="text-4xl" />
        <button onClick={onLogout} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-red-600"><LogOut size={20} /></button>
      </header>
      
      <div className="relative mb-8">
        <input 
          type="text" placeholder="BUSCAR ALUNO..." 
          className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] text-white outline-none focus:border-red-600 text-sm font-black uppercase"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((student: Student) => (
          <Card key={student.id} onClick={() => onSelect(student)} className="p-6 hover:border-red-600/50 cursor-pointer group transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden">
                <img src={student.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&fit=crop"} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-black uppercase text-lg leading-none mb-1">{student.nome}</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">{student.email}</p>
              </div>
              <ChevronRight size={20} className="text-zinc-800 group-hover:text-red-600" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- APP CORE ---

function App() {
  const [view, setView] = useState('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInput, setLoginInput] = useState('');

  useEffect(() => {
    const init = async () => {
      try { await signInAnonymously(auth); } catch (e) { console.error("Firebase Auth Error"); }
      onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    });
  }, [user]);

  const handleLogin = () => {
    const val = loginInput.trim().toLowerCase();
    if (val === 'professor') { setView('PROFESSOR_DASH'); return; }
    const student = students.find(s => s.email.toLowerCase() === val);
    if (student) { setSelectedStudent(student); setView('STUDENT_DASH'); }
    else { alert("E-mail não encontrado."); }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Iniciando ABFIT Elite</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <main className="max-w-lg mx-auto min-h-screen relative">
        {view === 'LOGIN' && (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 animate-fadeIn">
            <Logo />
            <div className="w-full mt-16 space-y-6">
              <input 
                type="text" placeholder="E-MAIL OU 'PROFESSOR'" 
                className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] text-white outline-none focus:border-red-600 text-center font-black uppercase tracking-tighter"
                value={loginInput} onChange={e => setLoginInput(e.target.value)}
              />
              <button onClick={handleLogin} className="w-full bg-red-600 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-white shadow-xl hover:bg-red-700 active:scale-95 transition-all italic text-sm">Entrar</button>
            </div>
          </div>
        )}

        {view === 'STUDENT_DASH' && selectedStudent && <StudentView student={selectedStudent} onNavigate={setView} />}
        
        {view === 'PROFESSOR_DASH' && (
          <CoachView students={students} onLogout={() => setView('LOGIN')} onSelect={(s: Student) => { setSelectedStudent(s); setView('STUDENT_MGMT'); }} />
        )}

        {view === 'STUDENT_MGMT' && selectedStudent && (
          <div className="p-6 animate-fadeIn h-screen overflow-y-auto text-left">
             <header className="flex items-center gap-4 mb-10">
                <button onClick={() => setView('PROFESSOR_DASH')} className="p-2 bg-zinc-900 rounded-full"><ArrowLeft size={20}/></button>
                <h2 className="text-xl font-black italic uppercase">Gestão Aluno</h2>
             </header>
             <Card className="p-8 text-center mb-8 border-2 border-red-600/30">
                <div className="w-20 h-20 rounded-full mx-auto border-4 border-red-600 mb-4 overflow-hidden bg-zinc-800 shadow-xl">
                   <img src={selectedStudent.photoUrl || ""} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-black italic uppercase leading-none">{selectedStudent.nome}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">{selectedStudent.email}</p>
             </Card>
             <div className="space-y-4">
                <button onClick={() => setView('COACH_PERIODIZATION')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center"><Brain className="text-indigo-500" /></div>
                      <div className="text-left"><span className="font-black uppercase text-sm italic">Periodização IA</span><p className="text-[7px] text-zinc-500 font-bold uppercase">Matveev & Bompa</p></div>
                   </div>
                   <ChevronRight size={20} className="text-zinc-700" />
                </button>
             </div>
          </div>
        )}
      </main>
      
      <footer className="fixed bottom-6 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[8px] font-black uppercase tracking-[0.4em]">ABFIT Elite v1.8.7 • PhD Base</p>
      </footer>
    </div>
  );
}

// Fallback do renderizador
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  }
} catch (e) {
  console.error("Critical Render Error:", e);
  document.body.innerHTML = `<div style="color:white; padding:20px; font-family:sans-serif; background:black; height:100vh;">
    <h1>Ops! Ocorreu um erro ao carregar o app.</h1>
    <p>Detalhes: ${e.message}</p>
    <button onclick="location.reload()" style="background:red; color:white; border:none; padding:10px 20px; border-radius:5px;">Tentar Novamente</button>
  </div>`;
}