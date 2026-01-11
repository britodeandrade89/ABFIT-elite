import React from 'react';
import { useAppStore } from '../store';
import { CheckCircle2, Clock, Zap, Activity, CalendarDays, FileText } from 'lucide-react';
import { Workout } from '../types';

interface CardTreinoPrescritoProps {
  treino: Workout;
}

const CardTreinoPrescrito: React.FC<CardTreinoPrescritoProps> = ({ treino }) => {
  const { marcarComoConcluido } = useAppStore();

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 mb-6 transition-all border-l-4 shadow-xl ${treino.concluido ? 'bg-zinc-900/50 border-green-600 opacity-75' : 'bg-zinc-900 border-blue-500'}`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black italic uppercase text-white flex items-center gap-2 tracking-tighter">
            {treino.title || treino.titulo}
            {treino.concluido && <CheckCircle2 className="text-green-500" size={20} />}
          </h3>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                <CalendarDays size={10} /> {treino.diasSemana?.join(', ') || 'Flexível'}
             </span>
             <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                <Activity size={10} /> {treino.estimulo || 'Geral'}
             </span>
          </div>
        </div>
        
        {!treino.concluido && (
          <button
            onClick={() => marcarComoConcluido(treino.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/50 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={14} /> Concluir
          </button>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-zinc-300 leading-relaxed font-medium bg-black/30 p-4 rounded-xl border border-white/5">
            {treino.descricao || 'Siga a planilha conforme orientação.'}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricaItem icon={<Activity size={14} className="text-blue-500" />} label="Velocidade" valor={treino.velocidade || '-'} />
        <MetricaItem icon={<Zap size={14} className="text-amber-500" />} label="Intensidade" valor={treino.intensidade || '-'} />
        <MetricaItem icon={<Clock size={14} className="text-zinc-400" />} label="Tempo" valor={treino.tempoTotal || '-'} />
      </div>

      {/* Observations */}
      {treino.observacoes && (
        <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <FileText size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
              <strong className="block text-[9px] font-black uppercase text-emerald-500 tracking-wider mb-1">Observações do Coach:</strong>
              <p className="text-xs text-emerald-100/80 leading-snug">{treino.observacoes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricaItem = ({ label, valor, icon }: { label: string, valor: string, icon: React.ReactNode }) => (
  <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
    <div className="mb-1 opacity-80">{icon}</div>
    <div className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-0.5">{label}</div>
    <div className="text-xs md:text-sm font-black text-white italic">{valor}</div>
  </div>
);

export default CardTreinoPrescrito;