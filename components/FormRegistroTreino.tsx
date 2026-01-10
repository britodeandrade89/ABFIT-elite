import React, { useState } from 'react';
import { useAppStore } from '../store';
import { X, Save, Watch, Activity, Flame, Heart, Timer, MapPin, Wind, Zap, Mountain } from 'lucide-react';

const FormRegistroTreino = ({ onClose }: { onClose: () => void }) => {
  const { adicionarTreinoExecutado } = useAppStore();
  
  const [formData, setFormData] = useState({
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdvancedChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metricasAvancadas: {
        ...prev.metricasAvancadas,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculate Pace if missing
    let finalPace = formData.ritmoMedio;
    if (!finalPace && formData.distancia && formData.duracao) {
      // Assuming duracao is in minutes or mm:ss
      let totalMinutes = 0;
      if (formData.duracao.includes(':')) {
        const [mins, secs] = formData.duracao.split(':').map(Number);
        totalMinutes = mins + (secs / 60);
      } else {
        totalMinutes = parseFloat(formData.duracao);
      }
      
      const paceDec = totalMinutes / parseFloat(formData.distancia);
      const min = Math.floor(paceDec);
      const sec = Math.round((paceDec - min) * 60);
      finalPace = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    adicionarTreinoExecutado({
      ...formData,
      ritmoMedio: finalPace,
      metricasAvancadas: {
        assimetria: Number(formData.metricasAvancadas.assimetria),
        tempoSolo: Number(formData.metricasAvancadas.tempoSolo),
        vertical: Number(formData.metricasAvancadas.vertical),
        rigidez: Number(formData.metricasAvancadas.rigidez)
      }
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Watch className="text-white" size={24} />
             </div>
             <div>
                <h3 className="text-lg font-black uppercase italic text-white leading-none">Registrar Treino</h3>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Sincronização Manual Galaxy Watch</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Info */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Activity size={12}/> Dados Principais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Atividade</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => handleChange('tipo', e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500"
                  >
                    <option value="Corrida">🏃‍♂️ Corrida</option>
                    <option value="Caminhada">🚶‍♂️ Caminhada</option>
                    <option value="Ciclismo">🚴‍♂️ Ciclismo</option>
                    <option value="Esteira">🏃‍♂️ Esteira</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Distância (km)</label>
                  <input type="number" step="0.01" value={formData.distancia} onChange={e => handleChange('distancia', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" placeholder="0.00" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Duração (mm:ss ou min)</label>
                  <input type="text" value={formData.duracao} onChange={e => handleChange('duracao', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" placeholder="00:00" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Calorias (kcal)</label>
                  <input type="number" value={formData.calorias} onChange={e => handleChange('calorias', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Physiology */}
            <div className="space-y-4 pt-4 border-t border-white/5">
               <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Heart size={12}/> Fisiologia</h4>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">FC Média (bpm)</label>
                    <input type="number" value={formData.fcMedia} onChange={e => handleChange('fcMedia', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">FC Máxima (bpm)</label>
                    <input type="number" value={formData.fcMaxima} onChange={e => handleChange('fcMaxima', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">VO₂ Max</label>
                    <input type="number" step="0.1" value={formData.vo2Max} onChange={e => handleChange('vo2Max', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500" />
                  </div>
               </div>
            </div>

            {/* Advanced Metrics */}
            <div className="space-y-4 pt-4 border-t border-white/5">
               <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Zap size={12}/> Métricas Avançadas (Galaxy Watch)</h4>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-800/30 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Cadência (spm)</label>
                    <input type="number" value={formData.cadenciaMedia} onChange={e => handleChange('cadenciaMedia', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Elev. Ganho (m)</label>
                    <input type="number" value={formData.ganhoElevacao} onChange={e => handleChange('ganhoElevacao', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Suor (ml)</label>
                    <input type="number" value={formData.perdaSuor} onChange={e => handleChange('perdaSuor', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Assimetria (%)</label>
                    <input type="number" step="0.1" value={formData.metricasAvancadas.assimetria} onChange={e => handleAdvancedChange('assimetria', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Tempo Solo (ms)</label>
                    <input type="number" value={formData.metricasAvancadas.tempoSolo} onChange={e => handleAdvancedChange('tempoSolo', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Osc. Vertical (cm)</label>
                    <input type="number" step="0.1" value={formData.metricasAvancadas.vertical} onChange={e => handleAdvancedChange('vertical', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-zinc-500">Rigidez (kN)</label>
                    <input type="number" step="0.1" value={formData.metricasAvancadas.rigidez} onChange={e => handleAdvancedChange('rigidez', e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white font-bold outline-none focus:border-blue-500" />
                  </div>
               </div>
            </div>

            <div className="pt-4 flex gap-3">
               <button type="button" onClick={onClose} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-black uppercase text-xs text-zinc-400 transition-colors">Cancelar</button>
               <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> Salvar Treino
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default FormRegistroTreino;