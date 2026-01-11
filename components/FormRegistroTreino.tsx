import React, { useState } from 'react';
import { useAppStore } from '../store';
import { X, Save, Watch, Activity, Flame, Heart, Timer, ChevronDown, ChevronUp } from 'lucide-react';

const FormRegistroTreino = ({ onClose, studentId }: { onClose: () => void, studentId: string }) => {
  const { adicionarTreinoExecutado } = useAppStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [treino, setTreino] = useState({
    tipo: 'Corrida',
    duracao: '',
    distancia: '',
    ritmoMedio: '',
    calorias: '',
    passos: '',
    fcMedia: '',
    fcMaxima: '',
    cadenciaMedia: '',
    ganhoElevacao: '',
    perdaSuor: '',
    vo2Max: '',
    metricasAvancadas: {
      assimetria: '',
      tempoSolo: '',
      vertical: '',
      rigidez: ''
    }
  });

  const handleChange = (field: string, value: string) => {
    setTreino(prev => ({ ...prev, [field]: value }));
  };

  const handleAdvancedChange = (field: string, value: string) => {
    setTreino(prev => ({
      ...prev,
      metricasAvancadas: {
        ...prev.metricasAvancadas,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mapping state to WorkoutHistoryEntry type and Auto-calculate Pace
    let ritmoCalculado = treino.ritmoMedio;
    if (!ritmoCalculado && treino.distancia && treino.duracao) {
        let minutos = 0;
        // Tratamento simples para "mm:ss" ou minutos inteiros
        if (treino.duracao.includes(':')) {
            const [m, s] = treino.duracao.split(':').map(Number);
            minutos = m + (s / 60);
        } else {
            minutos = parseFloat(treino.duracao);
        }
        
        if (minutos > 0 && parseFloat(treino.distancia) > 0) {
            const paceDecimal = minutos / parseFloat(treino.distancia);
            const paceMin = Math.floor(paceDecimal);
            const paceSec = Math.round((paceDecimal - paceMin) * 60);
            ritmoCalculado = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
        }
    }

    const dadosFinais = {
        ...treino,
        duration: treino.duracao, // Map duracao to duration for types.ts
        ritmoMedio: ritmoCalculado,
        // Ensure numbers where expected by logic, though types allow strings.
        metricasAvancadas: {
            assimetria: Number(treino.metricasAvancadas.assimetria),
            tempoSolo: Number(treino.metricasAvancadas.tempoSolo),
            vertical: Number(treino.metricasAvancadas.vertical),
            rigidez: Number(treino.metricasAvancadas.rigidez)
        }
    };

    await adicionarTreinoExecutado(dadosFinais, studentId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-lg rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Watch className="text-white" size={24} />
             </div>
             <div>
                <h3 className="text-lg font-black uppercase italic text-white leading-none">Novo Registro</h3>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Galaxy Watch Sync</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campos Principais (Simplificado) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tipo de Atividade</label>
                <select
                  value={treino.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="Corrida">🏃‍♂️ Corrida</option>
                  <option value="Caminhada">🚶‍♂️ Caminhada</option>
                  <option value="Ciclismo">🚴‍♂️ Ciclismo</option>
                  <option value="Esteira">🏃‍♂️ Esteira</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Distância (km)</label>
                <input
                  type="number"
                  step="0.01"
                  value={treino.distancia}
                  onChange={(e) => handleChange('distancia', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Duração (mm:ss ou min)</label>
                <input
                  type="text"
                  value={treino.duracao}
                  onChange={(e) => handleChange('duracao', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="00:00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">Calorias (kcal)</label>
                <input
                  type="number"
                  value={treino.calorias}
                  onChange={(e) => handleChange('calorias', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">FC Média (bpm)</label>
                <input
                  type="number"
                  value={treino.fcMedia}
                  onChange={(e) => handleChange('fcMedia', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest ml-1">VO₂ Máximo</label>
                <input
                  type="number"
                  step="0.1"
                  value={treino.vo2Max}
                  onChange={(e) => handleChange('vo2Max', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="Ex: 52.5"
                />
              </div>
            </div>
            
            {/* Toggle Avançado */}
            <div>
               <button 
                 type="button" 
                 onClick={() => setShowAdvanced(!showAdvanced)}
                 className="w-full flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest py-3 border-t border-b border-white/5 hover:bg-white/5 transition-colors px-2"
               >
                 <span>Métricas Avançadas (Galaxy Watch)</span>
                 {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
               </button>

               {showAdvanced && (
                 <div className="grid grid-cols-2 gap-4 mt-4 bg-zinc-800/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">FC Máxima</label>
                      <input type="number" value={treino.fcMaxima} onChange={e => handleChange('fcMaxima', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Cadência (spm)</label>
                      <input type="number" value={treino.cadenciaMedia} onChange={e => handleChange('cadenciaMedia', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Elevação (m)</label>
                      <input type="number" value={treino.ganhoElevacao} onChange={e => handleChange('ganhoElevacao', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Perda Suor (ml)</label>
                      <input type="number" value={treino.perdaSuor} onChange={e => handleChange('perdaSuor', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Assimetria (%)</label>
                      <input type="number" step="0.1" value={treino.metricasAvancadas.assimetria} onChange={e => handleAdvancedChange('assimetria', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0.0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Tempo Solo (ms)</label>
                      <input type="number" value={treino.metricasAvancadas.tempoSolo} onChange={e => handleAdvancedChange('tempoSolo', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Osc. Vertical (cm)</label>
                      <input type="number" step="0.1" value={treino.metricasAvancadas.vertical} onChange={e => handleAdvancedChange('vertical', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0.0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-zinc-500 uppercase">Rigidez (kN)</label>
                      <input type="number" step="0.1" value={treino.metricasAvancadas.rigidez} onChange={e => handleAdvancedChange('rigidez', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white" placeholder="0.0" />
                    </div>
                 </div>
               )}
            </div>

            <div className="flex justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-black uppercase text-xs transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Activity className="animate-spin" size={18} /> : <><Save size={18} /> Salvar Treino</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormRegistroTreino;