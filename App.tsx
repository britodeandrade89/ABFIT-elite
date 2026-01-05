
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User as UserIcon, Loader2, Dumbbell, 
  CheckCircle2, HeartPulse, Trophy, Camera, Brain, Ruler, Footprints, AlertCircle
} from 'lucide-react';
import { Logo, BackgroundWrapper, EliteFooter, WeatherWidget, NotificationBadge, SyncStatus } from './components/Layout';
import { ProfessorDashboard, StudentManagement, WorkoutEditorView, CoachAssessmentView, PeriodizationView, RunTrackManager } from './components/CoachFlow';
import { WorkoutSessionView, WorkoutCounterView, StudentAssessmentView, CorreRJView, StudentPeriodizationView } from './components/StudentFlow';
import { RunTrackStudentView } from './components/RunTrack';
import { InstallPrompt } from './components/InstallPrompt';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './services/firebase';
import { Student, Workout } from './types';

function LoginScreen({ onLogin, error, isDemo }: { onLogin: (val: string) => void, error: string, isDemo: boolean }) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const registeredOptions = [
    { name: "PROFESSOR", value: "PROFESSOR", type: "COACH" }, 
    { name: "André Brito", value: "britodeandrade@gmail.com", type: "ALUNO" }, 
    { name: "Marcelly Bispo", value: "marcellybispo92@gmail.com", type: "ALUNO" }
  ];
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { 
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center font-sans">
      <div className="animate-in fade-in zoom-in duration-700 text-center"><Logo /></div>
      
      {isDemo && (
        <div className="mt-6 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2 animate-pulse">
          <AlertCircle size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Modo Demonstração Ativo (Firestore Offline)</span>
        </div>
      )}

      <div className="w-full max-w-sm mt-8 space-y-4 animate-in slide-in-from-bottom-10 duration-1000 relative">
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-black text-zinc-500 ml-4 uppercase tracking-widest text-white">Identificação</label>
          <div className="relative" ref={dropdownRef}>
            <input type="text" placeholder="E-MAIL OU 'PROFESSOR'" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[2.5rem] text-white outline-none focus:border-red-600 transition-all text-center font-black tracking-tight uppercase placeholder:text-zinc-700" value={input} autoComplete="off" onChange={e => setInput(e.target.value)} onClick={() => setShowDropdown(true)} onFocus={() => setShowDropdown(true)} />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-zinc-800 bg-black/40 text-center"><p className="text-[8px] font-black text-zinc-500 uppercase text-center tracking-[0.2em]">Selecione um perfil</p></div>
                {registeredOptions.map((opt, idx) => (
                  <button key={`opt-${idx}`} onClick={() => { setInput(opt.value); setShowDropdown(false); }} className="w-full p-4 hover:bg-red-600/10 text-left flex items-center justify-between border-b border-zinc-800/50 transition-colors group">
                    <div className="text-left"><p className="text-white text-xs font-black uppercase tracking-tight text-left">{opt.name}</p><p className="text-[9px] text-zinc-500 lowercase text-left">{opt.value}</p></div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full ${opt.type === 'COACH' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{opt.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 text-[10px] font-black uppercase py-2 tracking-widest text-center">{error}</p>}
        <button onClick={() => onLogin(input)} className="w-full bg-red-600 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-xl shadow-red-900/20 hover:bg-red-700">Aceder ao Sistema</button>
      </div>
      <EliteFooter />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => { 
        try { 
            await signInAnonymously(auth); 
        } catch (err: any) { 
            console.warn("Auth Fallback:", err.message);
            setUser({ uid: "demo-user", isAnonymous: true });
            setLoading(false);
            setIsDemoMode(true);
        } 
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => { 
        if (u) { setUser(u); setLoading(false); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
    const unsub = onSnapshot(q, (snapshot) => { 
        setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student))); 
    }, (error) => {
        console.warn("Firestore access restricted (Entering Demo Mode):", error.message);
        setIsDemoMode(true);
    });
    return () => unsub();
  }, [user]);

  const allStudentsForCoach = useMemo(() => {
    const defaultStudents: Student[] = [
        { id: 'fixed-andre', nome: 'André Brito', email: 'britodeandrade@gmail.com', physicalAssessments: [], weightHistory: [], workoutHistory: [], sexo: 'Masculino', workouts: [] }, 
        { id: 'fixed-marcelly', nome: 'Marcelly Bispo', email: 'marcellybispo92@gmail.com', physicalAssessments: [], weightHistory: [], workoutHistory: [], workouts: [], sexo: 'Feminino' }
    ];
    const merged = [...students];
    defaultStudents.forEach(def => { 
        if (!merged.find(s => s.id === def.id || (s.email && s.email === def.email))) merged.push(def); 
    });
    return merged;
  }, [students]);

  const handleLogin = (val: string) => {
    setLoginError('');
    if (!val) return;
    const cleanVal = val.trim().toLowerCase();
    if (cleanVal === "professor") { setView('PROFESSOR_DASH'); return; }
    
    const student = allStudentsForCoach.find(s => (s.email || "").trim().toLowerCase() === cleanVal);
    if (student) { setSelectedStudent(student); setView('DASHBOARD'); } 
    else { setLoginError('IDENTIFICAÇÃO NÃO RECONHECIDA'); }
  };

  const handleSaveData = async (sid: string, data: any) => {
    // Local update always happens first for responsiveness (Optimistic UI)
    setStudents(prev => prev.map(s => s.id === sid ? { ...s, ...data } : s));
    if (selectedStudent && selectedStudent.id === sid) setSelectedStudent(prev => prev ? { ...prev, ...data } : null);

    if (isDemoMode) {
        console.log("Demo Mode: Data preserved in local session only.");
        return;
    }

    try { 
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', sid);
      await setDoc(docRef, data, { merge: true });
    } catch (e: any) { 
      console.warn("Save Error (Likely Firestore Permission):", e.message); 
      setIsDemoMode(true);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <BackgroundWrapper>
      <InstallPrompt />
      {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} error={loginError} isDemo={isDemoMode} />}
      
      {view === 'DASHBOARD' && selectedStudent && (
        <div className="p-6 text-white text-center pt-10 h-screen overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8 text-white">
             <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border-2 border-red-600 overflow-hidden shadow-2xl">
                {selectedStudent?.photoUrl ? <img src={selectedStudent.photoUrl} className="w-full h-full object-cover" alt="Perfil"/> : <div className="w-full h-full flex items-center justify-center"><UserIcon className="text-zinc-700" /></div>}
             </div>
             <div className="flex flex-col items-end gap-2">
                <WeatherWidget />
                <SyncStatus isDemo={isDemoMode} />
             </div>
          </div>
          <div className="mb-10 text-center"><Logo size="text-6xl" subSize="text-[9px]" /></div>
          
          <div className="mt-12 space-y-4 pb-20 text-left">
            <button onClick={() => setView('STUDENT_PERIODIZATION')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between group hover:border-indigo-600/30 transition-all shadow-xl">
                <div className="flex flex-col items-start"><span className="font-black italic uppercase text-lg group-hover:text-indigo-500 transition-colors">Periodização PhD</span><p className="text-[8px] text-zinc-500 font-bold uppercase">Macrociclo & Planejamento</p></div>
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors"><Brain className="text-indigo-500 group-hover:text-white" /></div>
            </button>

            <button onClick={() => setView('WORKOUTS')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between group hover:border-red-600/30 transition-all shadow-xl">
                <div className="flex flex-col items-start"><span className="font-black italic uppercase text-lg group-hover:text-red-600 transition-colors">Meus Treinos</span><p className="text-[8px] text-zinc-500 font-bold uppercase">Sessões de Força & Hipertrofia</p></div>
                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-600 transition-colors"><Dumbbell className="text-red-600 group-hover:text-white" /></div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView('STUDENT_ASSESSMENT')} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center gap-3 shadow-lg group hover:border-emerald-600/30">
                <Ruler className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="font-black italic uppercase text-[10px]">Avaliação</span>
              </button>
              <button onClick={() => setView('RUNTRACK_STUDENT')} className="bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center gap-3 shadow-lg group hover:border-orange-600/30">
                <Footprints className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-black italic uppercase text-[10px]">RunTrack</span>
              </button>
            </div>

            <button onClick={() => setView('LOGIN')} className="mt-16 py-4 border border-white/5 rounded-full text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] active:bg-zinc-900 transition-all w-full">Sair do Sistema</button>
          </div>
          <EliteFooter />
        </div>
      )}

      {view === 'STUDENT_PERIODIZATION' && selectedStudent && <StudentPeriodizationView student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'WORKOUTS' && selectedStudent && <WorkoutSessionView user={selectedStudent} onBack={() => setView('DASHBOARD')} onSave={handleSaveData} />}
      {view === 'STUDENT_ASSESSMENT' && selectedStudent && <StudentAssessmentView student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'RUNTRACK_STUDENT' && selectedStudent && <RunTrackStudentView student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      
      {view === 'PROFESSOR_DASH' && <ProfessorDashboard students={allStudentsForCoach} onLogout={() => setView('LOGIN')} onSelect={(s) => { setSelectedStudent(s); setView('STUDENT_MGMT'); }} />}
      {view === 'STUDENT_MGMT' && selectedStudent && <StudentManagement student={selectedStudent} onBack={() => setView('PROFESSOR_DASH')} onNavigate={setView} onEditWorkout={setSelectedWorkout} />}
      {view === 'PERIODIZATION' && selectedStudent && <PeriodizationView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onProceedToWorkout={() => { setSelectedWorkout(null); setView('WORKOUT_EDITOR'); }} />}
      {view === 'COACH_ASSESSMENT' && selectedStudent && <CoachAssessmentView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'WORKOUT_EDITOR' && selectedStudent && <WorkoutEditorView student={selectedStudent} workoutToEdit={selectedWorkout} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'RUNTRACK_ELITE' && selectedStudent && <RunTrackManager student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} />}
    </BackgroundWrapper>
  );
}
