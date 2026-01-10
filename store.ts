import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Student, Workout, WorkoutHistoryEntry } from './types';

interface AppState {
  // Gestão de Alunos (Estado Global)
  students: Student[];
  setStudents: (students: Student[]) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  initDefaults: () => void;

  // Gestão de Treinos Prescritos (Aeróbico/Específico)
  treinosPrescritos: Workout[];
  adicionarTreinoPrescrito: (novoTreino: Partial<Workout>) => void;
  marcarComoConcluido: (treinoId: string) => void;

  // Gestão de Treinos Executados (Logs Galaxy Watch)
  treinosExecutados: WorkoutHistoryEntry[];
  adicionarTreinoExecutado: (novoLog: Partial<WorkoutHistoryEntry>) => void;
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
      workouts: [
        {
          id: 'treino-a-fixed',
          title: 'Treino A',
          exercises: [] 
        }
      ]
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
        let updated = [...state.students];
        let changed = false;
        DEFAULT_STUDENTS.forEach(def => {
            if (!updated.find(s => s.id === def.id)) {
                updated.push(def);
                changed = true;
            }
        });
        return changed ? { students: updated } : state;
      }),

      // === TREINOS PRESCRITOS ===
      treinosPrescritos: [
        {
          id: 'prescrito-1',
          studentId: 'fixed-andre',
          tipo: 'Corrida',
          title: 'Treino de Limiar',
          diasSemana: ['Seg', 'Qua', 'Sex'],
          estimulo: 'Fartlek',
          descricao: '10min aquecimento + 6x (3min forte / 2min leve) + 10min desaquecimento',
          velocidade: '4:30 - 5:00 min/km',
          intensidade: '8/10',
          tempoTotal: '50 min',
          observacoes: 'Manter FC na Zona 4',
          exercises: []
        }
      ],

      adicionarTreinoPrescrito: (novoTreino) =>
        set((state) => ({
          treinosPrescritos: [...state.treinosPrescritos, {
            id: Date.now().toString(),
            title: novoTreino.title || 'Treino Novo',
            exercises: [],
            ...novoTreino
          } as Workout]
        })),

      marcarComoConcluido: (treinoId) =>
        set((state) => ({
          treinosPrescritos: state.treinosPrescritos.map(t =>
            t.id === treinoId ? { ...t, concluido: true } : t
          )
        })),

      // === TREINOS EXECUTADOS ===
      treinosExecutados: [],

      adicionarTreinoExecutado: (novoLog) =>
        set((state) => ({
          treinosExecutados: [...state.treinosExecutados, {
            id: Date.now().toString(),
            timestamp: Date.now(),
            name: novoLog.name || 'Treino Realizado',
            duration: novoLog.duration || '0',
            date: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            ...novoLog
          } as WorkoutHistoryEntry]
        })),
    }),
    {
      name: 'abfit-elite-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
