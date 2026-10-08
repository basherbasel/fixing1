import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, Sparkles, Terminal, Play, CheckCircle2 } from 'lucide-react';
import { quantumNanobotEngine, NanobotTask } from '../services/quantum-nanobot-engine';
import { useI18n } from '../context/I18nContext';

export const QuantumNanobotStudio: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [selectedTarget, setSelectedTarget] = useState('SoC Snapdragon 8 Gen 3 / APU Core');
  const [activeTask, setActiveTask] = useState<NanobotTask | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = quantumNanobotEngine.subscribe((task) => {
      setActiveTask(task);
      setLogs(task.logs);
    });
    return () => unsubscribe();
  }, []);

  const handleDeploy = (op: NanobotTask['operation']) => {
    setLogs([]);
    quantumNanobotEngine.deploySwarm(selectedTarget, op);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80 rounded-2xl border border-cyan-500/30 p-6 space-y-6 text-slate-200 shadow-[0_0_30px_rgba(6,182,212,0.15)] custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isRTL ? 'معمل النانوروبوتات الكمومية وإصلاح السيليكون الضوئي' : 'Quantum Nanobot & Photonic Silicon Studio'}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-mono">v2028.9 Quantum</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? 'إبرام ميكروكود تصحيح الأخطاء وإصلاح البوابات السيليكونية على المستوى الذري' : 'Photonic microcode injection, atomic cold-welding, and volumetric PCB tomography'}
            </p>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Target Component</label>
          <select 
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="SoC Snapdragon 8 Gen 3 / APU Core">SoC Snapdragon 8 Gen 3 / APU Core</option>
            <option value="UFS 4.0 Flash Storage Controller">UFS 4.0 Flash Storage Controller</option>
            <option value="PMIC Power Rail S12 (Micro-fracture)">PMIC Power Rail S12 (Micro-fracture)</option>
            <option value="RF Transceiver & Antenna Array">RF Transceiver & Antenna Array</option>
          </select>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleDeploy('PHOTONIC_INJECTION')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRTL ? 'حقن الميكروكود الضوئي' : 'Photonic Microcode Injection'}</span>
            </button>
            <button
              onClick={() => handleDeploy('COLD_WELDING')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isRTL ? 'اللحام البارد الجزيئي للدوائر' : 'Molecular Cold-Welding'}</span>
            </button>
            <button
              onClick={() => handleDeploy('TOMOGRAPHY_SCAN')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isRTL ? 'مسح الأشعة السينية ثلاثي الأبعاد' : '3D Volumetric Tomography'}</span>
            </button>
          </div>
        </div>

        {/* Status & Progress */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isRTL ? 'حالة أسراب النانوروبوتات والتشغيل الذري' : 'Swarm Telemetry & Execution Log'}</span>
            </span>
            {activeTask && (
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono ${
                activeTask.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                activeTask.status === 'EXECUTING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {activeTask.status} ({activeTask.progress}%)
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1.5 overflow-y-auto custom-scrollbar min-h-[160px] max-h-[220px]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-8">
                <Sparkles className="w-8 h-8 mb-2 opacity-30 animate-spin" />
                <span>{isRTL ? 'اختر هدفاً وابدأ عملية النانوروبوتات الكمومية...' : 'Select a target and deploy nanobot swarm...'}</span>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
