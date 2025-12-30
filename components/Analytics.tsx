import React from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { Card, EliteFooter } from './Layout';
import { Student } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  student: Student;
  onBack: () => void;
}

export function AnalyticsDashboard({ student, onBack }: AnalyticsProps) {
  const analytics = student.analytics || { exercises: {}, sessionsCompleted: 0, streakDays: 0 };
  const history = student.workoutHistory || [];

  // Prepare Data for Charts
  const exerciseData = Object.entries(analytics.exercises).map(([name, stats]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    completed: stats.completed,
    skipped: stats.skipped,
    rate: Math.round((stats.completed / ((stats.completed + stats.skipped) || 1)) * 100)
  })).sort((a,b) => b.completed - a.completed).slice(0, 6);

  // Frequency Data (Last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const frequencyData = last7Days.map(date => ({
    date: date.split('-')[2] + '/' + date.split('-')[1],
    count: history.filter(h => h.date === date).length
  }));

  return (
    <div className="p-6 pb-48 animate-fadeIn text-white overflow-y-auto h-screen custom-scrollbar text-left">
      <header className="flex items-center gap-4 mb-10 text-left">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full shadow-lg text-white hover:bg-red-600 transition-colors"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Performance Analytics</h2>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <Card className="p-5 bg-gradient-to-br from-zinc-900 to-black text-center">
            <h3 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2">Total de Sessões</h3>
            <p className="text-3xl font-black text-white">{history.length}</p>
         </Card>
         <Card className="p-5 bg-gradient-to-br from-zinc-900 to-black text-center border-red-900/30">
            <h3 className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-2">Streak Atual</h3>
            <div className="flex items-center justify-center gap-2">
               <p className="text-3xl font-black text-red-600">{analytics.streakDays}</p>
               <TrendingUp size={16} className="text-red-600"/>
            </div>
         </Card>
      </div>

      <div className="space-y-8">
         <div className="space-y-4">
            <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest pl-2 flex items-center gap-2"><Activity size={12}/> Frequência (7 Dias)</h3>
            <div className="h-48 w-full bg-zinc-900/50 rounded-3xl border border-white/5 p-4">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={frequencyData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                     <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px' }}
                     />
                     <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={3} dot={{r: 4, fill:'#dc2626'}} activeDot={{r: 6, fill: '#fff'}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest pl-2 flex items-center gap-2"><CheckCircle2 size={12}/> Top Exercícios (Completados)</h3>
            <div className="h-64 w-full bg-zinc-900/50 rounded-3xl border border-white/5 p-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={exerciseData}>
                     <XAxis type="number" stroke="#666" fontSize={10} hide />
                     <YAxis dataKey="name" type="category" stroke="#999" fontSize={10} width={80} tickLine={false} axisLine={false}/>
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff', fontSize: '10px' }}/>
                     <Bar dataKey="completed" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-[12px] font-black uppercase text-zinc-400 tracking-widest pl-2 flex items-center gap-2"><AlertTriangle size={12}/> Taxa de Skips</h3>
            <div className="bg-zinc-900 rounded-3xl p-4 space-y-3">
               {exerciseData.filter(e => e.skipped > 0).map((ex, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-bold">{ex.name}</span>
                    <div className="flex items-center gap-3">
                       <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${(ex.skipped / (ex.completed + ex.skipped)) * 100}%` }}></div>
                       </div>
                       <span className="text-[10px] font-black text-amber-500">{ex.skipped} Skips</span>
                    </div>
                 </div>
               ))}
               {exerciseData.filter(e => e.skipped > 0).length === 0 && <p className="text-xs text-zinc-500 text-center italic py-2">Nenhum exercício pulado recentemente.</p>}
            </div>
         </div>
      </div>
      <EliteFooter />
    </div>
  );
}