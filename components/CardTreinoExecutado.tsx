import React, { useState } from 'react';
import { WorkoutHistoryEntry } from '../types';
import { 
  Activity, Clock, Flame, Heart, Footprints, 
  Mountain, Droplets, ArrowRightLeft, MoveVertical, 
  Zap, Trophy, Timer
} from 'lucide-react';

interface CardTreinoExecutadoProps {
  treino: WorkoutHistoryEntry;
}

const CardTreinoExecutado: React.FC<CardTreinoExecutadoProps> = ({ treino }) => {
  const [abaAtiva, setAbaAtiva] = useState('geral');

  // Helper para formatar a data
  const dataFormatada = new Date(treino.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4">
      
      {/* Cabeçalho do Card */}
      <div className="bg-gradient-to-r from-blue-900/80 to-blue-600/80 p-6 md:p-8 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Activity size={150} className="text-white transform rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                    {treino.tipo || 'Treino Aeróbico'}
                </span>
                <span className="text-[10px] font-bold uppercase text-blue-200 flex items-center gap-1">
                    ⌚ Galaxy Watch 7
                </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none mb-1">
               {treino.distancia || '0'} <span className="text-lg md:text-xl not-italic font-normal opacity-80">km</span>
            </h2>
            <p className="text-xs text-blue-100 font-medium">
              📅 {dataFormatada} • 🕒 {treino.hora}
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center min-w-[80px]">
                <div className="text-[9px] font-black uppercase text-blue-200 mb-1">Ritmo</div>
                <div className="text-xl font-black text-white italic">{treino.ritmoMedio || '-'}</div>
             </div>
             <div className="bg-black/30 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center min-w-[80px]">
                <div className="text-[9px] font-black uppercase text-blue-200 mb-1">Tempo</div>
                <div className="text-xl font-black text-white italic">{treino.duration}</div>
             </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex gap-1 mt-8 overflow-x-auto custom-scrollbar pb-1">
          {[
              { id: 'geral', label: 'Geral', icon: '📊' },
              { id: 'metricas', label: 'Métricas Av.', icon: '📈' },
              { id: 'vo2', label: 'VO₂ Máx', icon: '🫁' },
              { id: 'zonasfc', label: 'Zonas FC', icon: '❤️' },
              { id: 'voltas', label: 'Voltas', icon: '⏱️' }
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  abaAtiva === aba.id 
                  ? 'bg-white text-blue-900 shadow-lg scale-105' 
                  : 'bg-blue-900/40 text-blue-200 hover:bg-blue-800/50'
              }`}
            >
              <span>{aba.icon}</span> {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-6 md:p-8">
        
        {/* ABA GERAL */}
        {abaAtiva === 'geral' && (
          <div className="animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <MetricaDestaque label="Calorias" valor={treino.calorias} icone={<Flame size={18} className="text-orange-500" />} unidade="kcal" />
              <MetricaDestaque label="FC Média" valor={treino.fcMedia} icone={<Heart size={18} className="text-rose-500" />} unidade="bpm" />
              <MetricaDestaque label="Cadência" valor={treino.cadenciaMedia} icone={<Activity size={18} className="text-emerald-500" />} unidade="ppm" />
              <MetricaDestaque label="Passos" valor={treino.passos} icone={<Footprints size={18} className="text-zinc-400" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                    <Mountain size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Elevação</h4>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-zinc-500 font-bold uppercase">Ganho</div>
                    <div className="text-2xl font-black text-white">{treino.ganhoElevacao || '0'} <span className="text-xs text-zinc-500">m</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 font-bold uppercase">Máxima</div>
                    <div className="text-2xl font-black text-white">{treino.maiorElevacao || '0'} <span className="text-xs text-zinc-500">m</span></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-cyan-400">
                    <Droplets size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Hidratação</h4>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-3xl font-black text-white italic">
                        {treino.perdaSuor || '0'} <span className="text-sm text-zinc-500 not-italic">ml</span>
                        </div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase mt-1">
                        Repor aprox. {Math.round(Number(treino.perdaSuor || 0) * 1.5)} ml
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA MÉTRICAS AVANÇADAS */}
        {abaAtiva === 'metricas' && (
          <div className="animate-in fade-in">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                <Activity size={14}/> Biomecânica da Corrida
            </h3>
            {treino.metricasAvancadas ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricaAvancada 
                    label="Assimetria" 
                    valor={`${treino.metricasAvancadas.assimetria || 0}%`}
                    status={Number(treino.metricasAvancadas.assimetria) <= 2 ? 'Ótimo' : 'Atenção'}
                    desc="Equilíbrio Dir/Esq"
                    icon={<ArrowRightLeft size={16} />}
                />
                <MetricaAvancada 
                    label="Tempo no Solo" 
                    valor={`${treino.metricasAvancadas.tempoSolo || 0} ms`}
                    status={Number(treino.metricasAvancadas.tempoSolo) <= 250 ? 'Ótimo' : 'Alto'}
                    desc="Eficiência de contato"
                    icon={<Timer size={16} />}
                />
                <MetricaAvancada 
                    label="Oscilação Vertical" 
                    valor={`${treino.metricasAvancadas.vertical || 0} cm`}
                    status={Number(treino.metricasAvancadas.vertical) <= 10 ? 'Ótimo' : 'Alto'}
                    desc="Deslocamento vertical"
                    icon={<MoveVertical size={16} />}
                />
                <MetricaAvancada 
                    label="Rigidez" 
                    valor={`${treino.metricasAvancadas.rigidez || 0} kN/m`}
                    status={Number(treino.metricasAvancadas.rigidez) >= 40 ? 'Sólido' : 'Baixo'}
                    desc="Mola da perna"
                    icon={<Zap size={16} />}
                />
                </div>
            ) : (
                <p className="text-zinc-500 text-xs italic p-4 text-center border border-dashed border-zinc-800 rounded-xl">Dados biomecânicos não disponíveis para este treino.</p>
            )}
          </div>
        )}

        {/* ABA VO2 MÁXIMO */}
        {abaAtiva === 'vo2' && (
          <div className="animate-in fade-in text-center py-4">
             {treino.vo2Max ? (
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-[2.5rem] relative overflow-hidden border border-purple-500/30 shadow-xl max-w-sm mx-auto">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase text-purple-200 tracking-[0.3em] mb-4">Capacidade Aeróbica</h3>
                        <div className="text-6xl font-black text-white italic tabular-nums tracking-tighter mb-2">
                            {treino.vo2Max}
                        </div>
                        <div className="text-xs text-purple-300 font-bold uppercase tracking-widest mb-6">ml/kg/min</div>
                        
                        <div className={`inline-block px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest shadow-lg ${
                            Number(treino.vo2Max) >= 50 ? 'bg-emerald-500 text-black' : 
                            Number(treino.vo2Max) >= 40 ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
                        }`}>
                            {treino.classificacaoVO2 || 'ANALISANDO'}
                        </div>
                        
                        {treino.porcentagemVO2 && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="text-[9px] text-purple-300 uppercase mb-1">Intensidade do Treino</div>
                                <div className="text-2xl font-black text-white">{treino.porcentagemVO2}% <span className="text-xs font-normal opacity-70">do VO₂ Máx</span></div>
                            </div>
                        )}
                    </div>
                </div>
             ) : (
                 <p className="text-zinc-500 text-xs italic">VO₂ Máx não calculado.</p>
             )}
          </div>
        )}

        {/* ABA ZONAS DE FREQUÊNCIA CARDÍACA */}
        {abaAtiva === 'zonasfc' && (
          <div className="animate-in fade-in">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                <Heart size={14}/> Distribuição de Esforço
            </h3>
            {treino.zonasFC ? (
                <div className="bg-black/40 p-5 rounded-3xl border border-white/5 space-y-4">
                {treino.zonasFC.map((zona, index) => (
                    <div key={index}>
                    <div className="flex justify-between items-end mb-1">
                        <span className={`text-[10px] font-black uppercase ${
                             index === 4 ? 'text-red-500' :
                             index === 3 ? 'text-orange-500' :
                             index === 2 ? 'text-amber-500' :
                             index === 1 ? 'text-blue-400' : 'text-zinc-400'
                        }`}>
                        {zona.nome} <span className="opacity-50 font-normal">({zona.faixa})</span>
                        </span>
                        <span className="text-xs font-bold text-white">{zona.tempo}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${zona.percentual}%`,
                            backgroundColor: 
                               index === 4 ? '#ef4444' :
                               index === 3 ? '#f97316' :
                               index === 2 ? '#eab308' :
                               index === 1 ? '#60a5fa' : '#a1a1aa'
                        }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-zinc-500 text-xs italic">Zonas de FC não disponíveis.</p>
            )}
          </div>
        )}

        {/* ABA VOLTAS */}
        {abaAtiva === 'voltas' && (
          <div className="animate-in fade-in">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                <Timer size={14}/> Splits (1km)
            </h3>
            {treino.voltas && treino.voltas.length > 0 ? (
                <div className="bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-800">
                        <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-wider">Km</th>
                        <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-wider">Tempo</th>
                        <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-wider">Ritmo</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                    {treino.voltas.map((volta, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm font-black text-white italic">#{volta.numero}</td>
                            <td className="p-4 text-xs font-bold text-zinc-300">{volta.tempo}</td>
                            <td className="p-4 text-xs font-bold text-blue-400">{volta.ritmo}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <p className="text-zinc-500 text-xs italic">Dados de voltas não disponíveis.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Componentes auxiliares
const MetricaDestaque = ({ label, valor, icone, unidade }: any) => (
  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
    <div className="mb-2 opacity-90">{icone}</div>
    <div className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-1">{label}</div>
    <div className="text-lg font-black text-white">
      {valor || '-'} <span className="text-[10px] text-zinc-500 font-normal">{unidade}</span>
    </div>
  </div>
);

const MetricaAvancada = ({ label, valor, status, desc, icon }: any) => (
  <div className={`p-4 rounded-2xl border border-l-4 ${status === 'Ótimo' || status === 'Sólido' ? 'bg-emerald-950/20 border-emerald-500/50 border-l-emerald-500' : 'bg-amber-950/20 border-amber-500/50 border-l-amber-500'}`}>
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-zinc-300">
         {icon}
         <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${status === 'Ótimo' || status === 'Sólido' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {status}
      </span>
    </div>
    <div className="text-2xl font-black text-white mb-1">{valor}</div>
    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">{desc}</div>
  </div>
);

export default CardTreinoExecutado;