import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Student, Workout, WorkoutHistoryEntry } from './types';
import {
  adicionarTreinoPrescrito,
  adicionarTreinoExecutado,
  atualizarTreinoPrescrito,
  escutarTreinosPrescritos,
  escutarTreinosExecutados
} from './services/firebaseService';

interface AppState {
  // Gestão de Alunos (Estado Global - Legado/Coach View)
  students: Student[];
  setStudents: (students: Student[]) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  initDefaults: () => void;

  // Gestão de Treinos (Firebase / Real-time - Student View)
  treinosPrescritos: Workout[];
  treinosExecutados: WorkoutHistoryEntry[];
  
  unsubscribeListeners: (() => void)[];
  iniciarEscutaTempoReal: (alunoId: string) => void;
  limparEscutaTempoReal: () => void;

  adicionarTreinoPrescrito: (novoTreino: Partial<Workout>, professorId?: string) => Promise<void>;
  adicionarTreinoExecutado: (novoLog: Partial<WorkoutHistoryEntry>, alunoId?: string) => Promise<void>;
  marcarComoConcluido: (treinoId: string) => Promise<void>;
}

const DEFAULT_STUDENTS: Student[] = [
    { 
      id: 'fixed-andre', 
      nome: 'André Brito', 
      email: 'britodeandrade@gmail.com', 
      physicalAssessments: [], 
      weightHistory: [], 
      workoutHistory: [], 
      sexo: 'Masculino',
      workouts: []
    }, 
    { 
      id: 'fixed-marcelly', 
      nome: 'Marcelly Bispo', 
      email: 'marcellybispo92@gmail.com', 
      physicalAssessments: [], 
      weightHistory: [], 
      workoutHistory: [], 
      workouts: [], 
      sexo: 'Feminino' 
    }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // === GESTÃO DE ALUNOS ===
      students: DEFAULT_STUDENTS,
      
      setStudents: (newStudents) => {
        const current = get().students;
        if (newStudents.length === 0 && current.length > 0) return;
        set({ students: newStudents });
      },

      updateStudent: (id, data) => set((state) => ({
        students: state.students.map((s) => 
          s.id === id ? { ...s, ...data } : s
        )
      })),

      initDefaults: () => set((state) => {
        if (state.students.length === 0) {
            return { students: DEFAULT_STUDENTS };
        }
        return state;
      }),

      // === FIREBASE REAL-TIME ===
      treinosPrescritos: [],
      treinosExecutados: [],
      unsubscribeListeners: [],

      iniciarEscutaTempoReal: (alunoId) => {
        // Limpar listeners anteriores
        get().limparEscutaTempoReal();
        
        console.log(`📡 Iniciando escuta em tempo real para: ${alunoId}`);

        const unsub1 = escutarTreinosPrescritos(alunoId, (data) => {
          set({ treinosPrescritos: data as Workout[] });
        });

        const unsub2 = escutarTreinosExecutados(alunoId, (data) => {
          set({ treinosExecutados: data as WorkoutHistoryEntry[] });
        });

        set({ unsubscribeListeners: [unsub1, unsub2] });
      },

      limparEscutaTempoReal: () => {
        const { unsubscribeListeners } = get();
        unsubscribeListeners.forEach(unsub => unsub());
        set({ unsubscribeListeners: [] });
      },

      // === AÇÕES DE TREINO ===

      adicionarTreinoPrescrito: async (novoTreino, professorId = 'coach-admin') => {
        try {
          // Salvar no Firebase
          await adicionarTreinoPrescrito(novoTreino, professorId);
        } catch (error) {
          console.error("Store addTreinoPrescrito error:", error);
        }
      },

      adicionarTreinoExecutado: async (novoLog, alunoId) => {
         // Fallback para ID fixo se não fornecido (retrocompatibilidade)
         const targetId = alunoId || 'fixed-andre';
         
         try {
            // Salvar no Firebase
            const id = await adicionarTreinoExecutado(novoLog, targetId);
            
            // O listener atualizará o estado, mas atualizamos localmente para feedback instantâneo
            const logEntry = {
                id: typeof id === 'string' ? id : Date.now().toString(),
                timestamp: Date.now(),
                name: novoLog.name || 'Treino Realizado',
                duration: novoLog.duration || '0',
                date: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                ...novoLog
            } as WorkoutHistoryEntry;

            set((state) => ({
              treinosExecutados: [logEntry, ...state.treinosExecutados]
            }));

         } catch (error) {
            console.error("Store addTreinoExecutado error:", error);
         }
      },

      marcarComoConcluido: async (treinoId) => {
        try {
           await atualizarTreinoPrescrito(treinoId, { concluido: true });
           // Update local state optimistic
           set((state) => ({
             treinosPrescritos: state.treinosPrescritos.map(t =>
               t.id === treinoId ? { ...t, concluido: true } : t
             )
           }));
        } catch (error) {
           console.error("Store concluirTreino error:", error);
        }
      },
    }),
    {
      name: 'abfit-elite-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          students: state.students,
          // Persistir cache para offline
          treinosPrescritos: state.treinosPrescritos,
          treinosExecutados: state.treinosExecutados 
      }),
    }
  )
);
