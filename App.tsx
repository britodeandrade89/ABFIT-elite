import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User as UserIcon, Loader2, Dumbbell, 
  CheckCircle2, HeartPulse, Trophy, Camera 
} from 'lucide-react';
import { Logo, Card, BackgroundWrapper, EliteFooter, WeatherWidget } from './components/Layout';
import { ProfessorDashboard, StudentManagement, WorkoutEditorView, CoachAssessmentView, PeriodizationView, RunningWorkoutManager } from './components/CoachFlow';
import { WorkoutSessionView, WorkoutCounterView, StudentAssessmentView, RunningDashboard } from './components/StudentFlow';
import { NutritionView } from './components/Nutrition';
import { AnalyticsDashboard } from './components/Analytics';
import { InstallPrompt } from './components/InstallPrompt';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './services/firebase';
import { Student } from './types';

function LoginScreen({ onLogin, error }: { onLogin: (val: string) => void, error: string }) {
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
      <div className="w-full max-w-sm mt-12 space-y-4 animate-in slide-in-from-bottom-10 duration-1000 relative">
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
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => { 
        // Check if we are using the mock API key from index.html or if it's missing
        const config = window.__firebase_config;
        const isMock = !config || !config.apiKey || config.apiKey === "mock-api-key";

        if (isMock) {
            console.warn("ABFIT Elite: Running in DEMO mode (Mock/Missing Config).");
            if (mounted) {
              setUser({ uid: "demo-user", isAnonymous: true });
              setLoading(false);
            }
            return;
        }

        try { 
            await signInAnonymously(auth); 
        } catch (err: any) { 
            if (!mounted) return;
            // Handle auth/configuration-not-found or other auth errors gracefully
            // This ensures the app continues to work even if Firebase isn't fully configured
            console.warn("Firebase Auth Warning: Could not sign in anonymously. Switching to Fallback/Demo User.", err.code);
            setUser({ uid: "fallback-demo-user", isAnonymous: true });
            setLoading(false);
        } 
    };
    initAuth();
    
    // Only listen to auth changes if not manually set to demo user
    const unsub = onAuthStateChanged(auth, (u) => { 
        if (u && mounted) {
            setUser(u); 
            setLoading(false); 
        }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // In demo mode, skipping real Firestore connection if likely to fail
    if (user.uid === "demo-user" || user.uid === "fallback-demo-user") {
        setStudents([]);
        return;
    }

    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
        const unsub = onSnapshot(q, (snapshot) => { 
            setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student))); 
        }, (error) => {
            console.warn("Firestore snapshot error (expected in demo if rules deny):", error);
            // Fallback for demo if no backend access
            setStudents([]); 
        });
        return () => unsub();
    } catch (e) {
        console.warn("Firestore init error", e);
        setStudents([]);
    }
  }, [user]);

  const allStudentsForCoach = useMemo(() => {
    const defaultStudents: Student[] = [
        { 
          id: 'fixed-andre', 
          nome: 'André Brito', 
          email: 'britodeandrade@gmail.com', 
          physicalAssessments: [], 
          weightHistory: [], 
          workoutHistory: [], 
          sexo: 'Masculino',
          workouts: [
            {
              id: 'treino-a-fixed',
              title: 'Treino A',
              exercises: [
                { id: 'ex1', name: 'Supino Reto com Barra (Barbell Bench Press)', description: 'Peitoral maior, deltoide anterior, tríceps.' },
                { id: 'ex2', name: 'Supino Inclinado com Halteres (Incline Dumbbell Press)', description: 'Foco na porção superior do peitoral.' },
                { id: 'ex3', name: 'Desenvolvimento de Ombro (Overhead Press)', description: 'Ombros e tríceps com força total.' },
                { id: 'ex4', name: 'Remada Alta (Upright Row) - Modificada', description: 'Trapézio e deltoide lateral.' },
                { id: 'ex5', name: 'Leg Press (Pernas)', description: 'Quadríceps e glúteos com alta carga.' },
                { id: 'ex6', name: 'Safety Bar Squat (Agachamento com Barra de Segurança)', description: 'Agachamento seguro para coluna e ombros.' },
                { id: 'ex7', name: 'Sissy Squat (Agachamento Isolado do Joelho)', description: 'Isolamento extremo de quadríceps.' },
                { id: 'ex8', name: 'Swiss Ball Crunch (Crunch na Bola Suíça)', description: 'Abdominal com instabilidade.' },
                { id: 'ex9', name: 'Prancha (Plank)', description: 'Estabilidade do Core.' }
              ]
            }
          ]
        }, 
        { id: 'fixed-marcelly', nome: 'Marcelly Bispo', email: 'marcellybispo92@gmail.com', physicalAssessments: [], weightHistory: [], workoutHistory: [], workouts: [], sexo: 'Feminino' }
    ];
    // Merge real firebase students with defaults (or override defaults if they exist in DB)
    const merged = [...students];
    defaultStudents.forEach(def => { 
        if (!merged.find(s => s.id === def.id || s.email === def.email)) merged.push(def); 
    });
    return merged;
  }, [students]);

  const handleLogin = (val: string) => {
    setLoginError('');
    const cleanVal = val.trim().toLowerCase();
    if (cleanVal === "professor") { 
        setView('PROFESSOR_DASH'); 
        return; 
    }
    const student = allStudentsForCoach.find(s => s.email?.trim().toLowerCase() === cleanVal);
    if (student) { 
        setSelectedStudent(student); 
        setView('DASHBOARD'); 
    } else { 
        setLoginError('IDENTIFICAÇÃO NÃO RECONHECIDA'); 
    }
  };

  const handleSaveData = async (sid: string, data: any) => {
    try { 
      // Only try to save if not in demo mode with mock user
      if (user?.uid !== "demo-user" && user?.uid !== "fallback-demo-user") {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', sid);
          await setDoc(docRef, data, { merge: true });
      } else {
        console.log("Demo Mode: Data not saved to backend", data);
      }
      
      // Local state update is critical for demo
      setStudents(prev => prev.map(s => s.id === sid ? { ...s, ...data } : s));
      if (selectedStudent && selectedStudent.id === sid) {
          setSelectedStudent(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (e) { 
        console.error("Save error", e); 
        // Mock update for demo
        if (selectedStudent && selectedStudent.id === sid) {
            setSelectedStudent(prev => prev ? { ...prev, ...data } : null);
        }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSaveData(selectedStudent.id, { photoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <BackgroundWrapper>
      <InstallPrompt />
      {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} error={loginError} />}
      
      {view === 'DASHBOARD' && selectedStudent && (
        <div className="p-6 text-white text-center pt-10 h-screen overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8 text-white">
             <div className="relative group text-left">
                <input type="file" id="photo-upload-main" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                <label htmlFor="photo-upload-main" className="block cursor-pointer relative text-left">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border-2 border-red-600 overflow-hidden shadow-2xl transition-transform active:scale-90 text-left">
                      {selectedStudent?.photoUrl ? <img src={selectedStudent.photoUrl} className="w-full h-full object-cover" alt="Perfil"/> : <div className="w-full h-full flex items-center justify-center"><UserIcon className="text-zinc-700" /></div>}
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-lg p-1 border-2 border-black shadow-lg">
                      <Camera size={10} className="text-white" />
                   </div>
                </label>
             </div>
             <WeatherWidget />
          </div>
          <div className="mb-10 text-center"><Logo size="text-6xl" subSize="text-[9px]" /></div>
          <div className="mt-12 space-y-4 pb-10 text-left text-white">
            <button onClick={() => setView('WORKOUTS')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-red-600/30">
                <span className="font-black italic uppercase text-lg group-hover:text-red-600 transition-colors text-white text-left">Meus Treinos</span>
                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-600 transition-colors shadow-inner text-white">
                    <Dumbbell className="text-red-600 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('WORKOUT_COUNTER')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-blue-500/30">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-blue-500 transition-colors text-white text-left">Contador de Treinos</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Check-in & Consistência</p>
                </div>
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 transition-colors shadow-inner text-white">
                    <CheckCircle2 className="text-blue-600 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('NUTRITION')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-emerald-500/30">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-emerald-500 transition-colors text-white text-left">Nutrição Elite</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Planos AI & Diário</p>
                </div>
                <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 transition-colors shadow-inner text-white">
                    <CheckCircle2 className="text-emerald-600 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('ANALYTICS')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-purple-500/30">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-purple-500 transition-colors text-white text-left">Performance Analytics</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Evolução & Gráficos</p>
                </div>
                <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 transition-colors shadow-inner text-white">
                    <Trophy className="text-purple-600 group-hover:text-white" />
                </div>
            </button>

            <button onClick={() => setView('STUDENT_ASSESSMENT')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-rose-500/30">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-rose-500 transition-colors text-white text-left">Avaliação Física</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Relatório Técnico PhD</p>
                </div>
                <div className="w-12 h-12 bg-rose-600/10 rounded-2xl flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-600 transition-colors shadow-inner text-white text-center">
                    <HeartPulse className="text-rose-500 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('CORRE_RJ')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-orange-500/30">
                <div className="text-left text-white">
                    <span className="font-black italic uppercase text-lg group-hover:text-orange-500 transition-colors text-white text-left">correRJ 2026</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Agenda de Provas 5k</p>
                </div>
                <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-600 transition-colors shadow-inner text-center">
                    <Trophy className="text-orange-600 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('LOGIN')} className="mt-16 py-4 px-12 border border-white/5 rounded-full text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] active:bg-zinc-900 transition-all text-white text-center w-full hover:bg-zinc-900 hover:text-white">Sair do Sistema</button>
          </div>
          <EliteFooter />
        </div>
      )}

      {view === 'WORKOUTS' && selectedStudent && <WorkoutSessionView user={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'WORKOUT_COUNTER' && selectedStudent && <WorkoutCounterView student={selectedStudent} onBack={() => setView('DASHBOARD')} onSaveHistory={(h) => handleSaveData(selectedStudent.id, { workoutHistory: h })} />}
      {view === 'STUDENT_ASSESSMENT' && selectedStudent && <StudentAssessmentView student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'NUTRITION' && selectedStudent && <NutritionView student={selectedStudent} onBack={() => setView('DASHBOARD')} onSave={handleSaveData} />}
      {view === 'ANALYTICS' && selectedStudent && <AnalyticsDashboard student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'CORRE_RJ' && selectedStudent && <RunningDashboard student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      
      {view === 'PROFESSOR_DASH' && <ProfessorDashboard students={allStudentsForCoach} onLogout={() => setView('LOGIN')} onSelect={(s) => { setSelectedStudent(s); setView('STUDENT_MGMT'); }} />}
      {view === 'STUDENT_MGMT' && selectedStudent && <StudentManagement student={selectedStudent} onBack={() => setView('PROFESSOR_DASH')} onNavigate={setView} />}
      {view === 'PERIODIZATION' && selectedStudent && <PeriodizationView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onProceedToWorkout={() => setView('WORKOUT_EDITOR')} />}
      {view === 'COACH_ASSESSMENT' && selectedStudent && <CoachAssessmentView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'WORKOUT_EDITOR' && selectedStudent && <WorkoutEditorView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'RUNNING_MANAGER' && selectedStudent && <RunningWorkoutManager student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
    </BackgroundWrapper>
  );
}