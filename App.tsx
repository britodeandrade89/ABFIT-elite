import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User as UserIcon, Loader2, Dumbbell, 
  CheckCircle2, HeartPulse, Trophy, Camera, LayoutDashboard 
} from 'lucide-react';
import { Logo, BackgroundWrapper, EliteFooter, WeatherWidget, NotificationBadge } from './components/Layout';
import { ProfessorDashboard, StudentManagement, WorkoutEditorView, CoachAssessmentView, PeriodizationView } from './components/CoachFlow';
import { WorkoutSessionView, WorkoutCounterView, StudentAssessmentView, CorreRJView } from './components/StudentFlow';
import { RunTrackCoachView } from './components/RunTrack';
import { NutritionView } from './components/Nutrition';
import { AnalyticsDashboard } from './components/Analytics';
import PerfilAluno from './components/PerfilAluno';
import { InstallPrompt } from './components/InstallPrompt';
import { collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db, appId } from './services/firebase';
import { Student, Workout } from './types';
import { useAppStore } from './store';

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
  
  // ZUSTAND INTEGRATION
  const { students, setStudents, updateStudent, initDefaults } = useAppStore();
  
  // Derived State for Selection
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId) || null
  , [students, selectedStudentId]);

  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Use o padrão de inicialização segura do Check-in GO
  useEffect(() => {
    const registerSW = async () => {
        if ('serviceWorker' in navigator) {
            try {
                navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.debug);
            } catch (err) {}
        }
    };
    registerSW();
    
    // Ensure default students exist in store (persisted)
    initDefaults();
  }, []);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => { 
        try { 
            await signInAnonymously(auth); 
        } catch (err: any) { 
            if (!mounted) return;
            console.warn("Auth mode: Demo (Backend unconfigured/failed)", err.code);
            setUser({ uid: "demo-user", isAnonymous: true });
            setLoading(false);
        } 
    };
    initAuth();
    
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

  // Firebase Sync (Optional / Enhancement)
  useEffect(() => {
    if (!user || user.uid === "demo-user") return;

    try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
        const unsub = onSnapshot(q, (snapshot) => { 
            const fbStudents = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
            // Only update store if we actually got data (prevents wiping local data if FB is empty/broken)
            if (fbStudents.length > 0) {
              setStudents(fbStudents);
            }
        }, (error) => {
            console.warn("Firestore access denied, using local storage.", error);
        });
        return () => unsub();
    } catch (e) {
        console.warn("Firestore error", e);
    }
  }, [user]);

  const handleLogin = (val: string) => {
    setLoginError('');
    const cleanVal = val.trim().toLowerCase();
    if (cleanVal === "professor") { 
        setView('PROFESSOR_DASH'); 
        return; 
    }
    
    // Find in Store
    const student = students.find(s => s.email?.trim().toLowerCase() === cleanVal);
    
    if (student) { 
        setSelectedStudentId(student.id);
        setView('DASHBOARD'); 
    } else { 
        setLoginError('IDENTIFICAÇÃO NÃO RECONHECIDA'); 
    }
  };

  const handleSaveData = async (sid: string, data: any) => {
    try { 
      // 1. Update Local Store (Instant & Persistent)
      updateStudent(sid, data);

      // 2. Try Update Firebase (Background)
      if (user?.uid !== "demo-user") {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', sid);
          await setDoc(docRef, data, { merge: true });
      }
    } catch (e) { 
        console.error("Save error", e); 
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSaveData(selectedStudent.id, { photoUrl: reader.result as string });
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
             {/* Profile Section with Notification Bell */}
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
                
                {/* Notification Bell Badge positioned over the profile */}
                <div className="absolute -top-2 -right-2 z-20">
                   <NotificationBadge 
                      notifications={selectedStudent.notifications || []} 
                      onClick={() => alert("Central de Notificações: Nenhuma novidade no momento.")} 
                   />
                </div>
             </div>
             
             {/* Weather Widget */}
             <WeatherWidget />
          </div>
          <div className="mb-10 text-center"><Logo size="text-6xl" subSize="text-[9px]" /></div>
          
          {/* Main Menu Grid */}
          <div className="mt-12 space-y-4 pb-10 text-left text-white">
            
            {/* NOVO BOTÃO: PERFIL DO ALUNO */}
            <button onClick={() => setView('PERFIL_ALUNO')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-blue-600/30 mb-2">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-blue-500 transition-colors text-white text-left">Perfil & Relógio</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Integração Galaxy Watch</p>
                </div>
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 transition-colors shadow-inner text-white">
                    <LayoutDashboard className="text-blue-600 group-hover:text-white" />
                </div>
            </button>

            <button onClick={() => setView('WORKOUTS')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-red-600/30">
                <span className="font-black italic uppercase text-lg group-hover:text-red-600 transition-colors text-white text-left">Meus Treinos</span>
                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-600 transition-colors shadow-inner text-white">
                    <Dumbbell className="text-red-600 group-hover:text-white" />
                </div>
            </button>
            <button onClick={() => setView('WORKOUT_COUNTER')} className="w-full bg-zinc-900 p-7 rounded-[3rem] border border-zinc-800 flex items-center justify-between text-white active:scale-95 transition-all shadow-xl group text-left hover:border-emerald-500/30">
                <div>
                    <span className="font-black italic uppercase text-lg group-hover:text-emerald-500 transition-colors text-white text-left">Contador de Treinos</span>
                    <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mt-1 text-left text-white">Check-in & Consistência</p>
                </div>
                <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 transition-colors shadow-inner text-white">
                    <CheckCircle2 className="text-emerald-600 group-hover:text-white" />
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

      {view === 'PERFIL_ALUNO' && selectedStudent && <PerfilAluno onBack={() => setView('DASHBOARD')} />}
      {view === 'WORKOUTS' && selectedStudent && <WorkoutSessionView user={selectedStudent} onBack={() => setView('DASHBOARD')} onSave={handleSaveData} />}
      {view === 'WORKOUT_COUNTER' && selectedStudent && <WorkoutCounterView student={selectedStudent} onBack={() => setView('DASHBOARD')} onSaveHistory={(h) => handleSaveData(selectedStudent.id, { workoutHistory: h })} />}
      {view === 'STUDENT_ASSESSMENT' && selectedStudent && <StudentAssessmentView student={selectedStudent} onBack={() => setView('DASHBOARD')} />}
      {view === 'CORRE_RJ' && selectedStudent && <CorreRJView onBack={() => setView('DASHBOARD')} />}
      
      {/* Updated ProfessorDashboard to handle student selection by ID via setSelectedStudentId */}
      {view === 'PROFESSOR_DASH' && <ProfessorDashboard students={students} onLogout={() => setView('LOGIN')} onSelect={(s) => { setSelectedStudentId(s.id); setView('STUDENT_MGMT'); }} />}
      {view === 'STUDENT_MGMT' && selectedStudent && <StudentManagement student={selectedStudent} onBack={() => setView('PROFESSOR_DASH')} onNavigate={setView} onEditWorkout={setEditingWorkout} />}
      {view === 'PERIODIZATION' && selectedStudent && <PeriodizationView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onProceedToWorkout={() => { setEditingWorkout(null); setView('WORKOUT_EDITOR'); }} />}
      {view === 'COACH_ASSESSMENT' && selectedStudent && <CoachAssessmentView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'WORKOUT_EDITOR' && selectedStudent && <WorkoutEditorView student={selectedStudent} workoutToEdit={editingWorkout} onBack={() => setView('STUDENT_MGMT')} onSave={handleSaveData} />}
      {view === 'RUN_TRACK_COACH' && selectedStudent && <RunTrackCoachView student={selectedStudent} onBack={() => setView('STUDENT_MGMT')} />}
    </BackgroundWrapper>
  );
}