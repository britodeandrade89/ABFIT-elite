import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // === 1. TREINOS PRESCRITOS PELO PROFESSOR ===
      treinosPrescritos: [
        {
          id: 1,
          alunoId: 'aluno1',
          tipo: 'Corrida',
          titulo: 'Treino de Limiar',
          diasSemana: ['Seg', 'Qua', 'Sex'],
          estimulo: 'Fartlek',
          descricao: '10min aquecimento + 6x (3min forte / 2min leve) + 10min desaquecimento',
          velocidade: '4:30 - 5:00 min/km',
          intensidade: '8/10',
          tempoTotal: '50 min',
          observacoes: 'Manter FC na Zona 4'
        }
      ],
      
      // === 2. TREINOS EXECUTADOS (LOGS DO GALAXY WATCH) ===
      treinosExecutados: [],
      
      // Funções para adicionar treinos
      adicionarTreinoPrescrito: (novoTreino) =>
        set((state) => ({
          treinosPrescritos: [...state.treinosPrescritos, {
            id: Date.now(),
            ...novoTreino
          }]
        })),
        
      adicionarTreinoExecutado: (novoLog) =>
        set((state) => ({
          treinosExecutados: [...state.treinosExecutados, {
            id: Date.now(),
            ...novoLog,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }]
        })),
        
      // Marcar treino como concluído
      marcarComoConcluido: (treinoId) =>
        set((state) => ({
          treinosPrescritos: state.treinosPrescritos.map(t =>
            t.id === treinoId ? { ...t, concluido: true } : t
          )
        })),
    }),
    {
      name: 'abfit-storage-aerobico',
    }
  )
);

export default useAppStore;