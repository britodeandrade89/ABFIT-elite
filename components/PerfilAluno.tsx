import React, { useState } from 'react';
import { useAppStore } from '../store';
import CardTreinoPrescrito from './CardTreinoPrescrito';
import CardTreinoExecutado from './CardTreinoExecutado';
import FormRegistroTreino from './FormRegistroTreino';
import { EliteFooter, SyncStatus } from './Layout';
import { ArrowLeft, User, TrendingUp, Watch, CalendarDays, BarChart3, ClipboardList } from 'lucide-react';

const PerfilAluno = ({ onBack }: { onBack: () => void }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  
  // No modo real, pegaríamos o ID do aluno logado ou selecionado
  const alunoId = 'fixed-andre'; 
  
  const { treinosPrescritos, treinosExecutados, students } = useAppStore();
  
  // Filtros
  const treinosDoAluno = treinosPrescritos.filter(t => t.studentId === alunoId || !t.studentId);
  const logsDoAluno = treinosExecutados;
  const currentStudent = students.find(s => s.id === alunoId) || { nome: 'Aluno Elite', goal: 'Performance' };

  return (
    <div className="p-6 pb-48 animate-fadeIn text-white overflow-y-auto h-screen custom-scrollbar text-left bg-black">
      
      {/* Header Navigation */}
      <header className="flex items-center justify-between mb-8 sticky top-0 bg-black/80 backdrop-blur-md z-40 py-4 -mx-6 px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Perfil do Aluno</h2>
        </div>
        <SyncStatus />
      </header>

      {/* Hero Profile Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 rounded-[3rem] mb-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <User size={150} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
           <div className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] bg-zinc-800 overflow-hidden shrink-0">
               {/* Placeholder de Imagem */}
               <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <span className="text-2xl font-black text-zinc-600">{currentStudent.nome?.charAt(0)}</span>
               </div>
           </div>
           <div className="flex-1">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-600/30">Atleta Elite</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{currentStudent.nome}</h1>
               <p className="text-zinc-400 font-bold text-xs uppercase tracking-wide flex items-center justify-center md:justify-start gap-2">
                  <TrendingUp size={14} className="text-red-600"/> Foco: {currentStudent.goal || 'Alta Performance'}
               </p>
           </div>
           
           <button
            onClick={() => setMostrarForm(true)}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center gap-3 border border-emerald-500/30"
           >
            <Watch size={18} />
            <span>Registrar Galaxy Watch</span>
           </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* COLUNA 1: TREINOS PRESCRITOS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-4">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500"><CalendarDays size={20} /></div>
            <div>
                <h2 className="text-lg font-black uppercase italic text-white leading-none">Prescrições Ativas</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Planos do Coach</p>
            </div>
            <div className="ml-auto bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">{treinosDoAluno.length}</div>
          </div>
          
          {treinosDoAluno.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 border-dashed">
              <ClipboardList size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-bold uppercase text-xs">Nenhum treino prescrito.</p>
            </div>
          ) : (
            treinosDoAluno.map((treino) => (
              <CardTreinoPrescrito key={treino.id} treino={treino} />
            ))
          )}
        </section>

        {/* COLUNA 2: TREINOS EXECUTADOS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-4">
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500"><BarChart3 size={20} /></div>
            <div>
                <h2 className="text-lg font-black uppercase italic text-white leading-none">Histórico de Execução</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Logs do Relógio</p>
            </div>
            <div className="ml-auto bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">{logsDoAluno.length}</div>
          </div>
          
          {logsDoAluno.length === 0 ? (
            <div className="text-center py-20 bg-emerald-900/10 rounded-[2.5rem] border border-emerald-900/30 border-dashed">
              <Watch size={48} className="mx-auto text-emerald-800 mb-4" />
              <p className="text-emerald-700 font-bold uppercase text-xs">Nenhum treino registrado.</p>
              <button onClick={() => setMostrarForm(true)} className="mt-4 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 underline">Registrar agora</button>
            </div>
          ) : (
            // Mostra do mais recente para o mais antigo
            [...logsDoAluno].sort((a,b) => b.timestamp - a.timestamp).map((log) => (
              <CardTreinoExecutado key={log.id} treino={log} />
            ))
          )}
        </section>

      </div>

      {/* Modal Form */}
      {mostrarForm && <FormRegistroTreino onClose={() => setMostrarForm(false)} />}
      
      <EliteFooter />
    </div>
  );
};

export default PerfilAluno;