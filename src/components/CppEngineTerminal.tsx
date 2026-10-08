import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Zap, ShieldCheck, Activity, Search } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const CppEngineTerminal: React.FC = () => {
  const { isRTL } = useI18n();
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const engineLogs = [
      '[C++23] [NEXUS-CORE] Initializing Nexus-X Engine v4.0.0 (Std: C++23)...',
      '[C++23] [PQC] Lattice Signature Core (ML-DSA-65) - Ready.',
      '[C++23] [USB4] Thunderbolt 5 DMA Channel 0 - Initialized (80Gbps).',
      '[C++23] [AI] Local NPU Model loaded via ONNX Runtime (Precision: FP16).',
      '[C++23] [UFS] UFSHCI 4.0 Controller detected. Mapping mmap regions...',
      '[C++23] [PWR] USB-C PD 3.1 Policy Engine: VBus=24V, VConn=Active.',
      '[C++23] [DIAG] Sampling hardware telemetry at 100MHz...',
      '[C++23] [CORE] Engine standby. Awaiting protocol dispatch.'
    ];

    let current = 0;
    const timer = setInterval(() => {
      if (current < engineLogs.length) {
        setLogs(prev => [...prev, engineLogs[current++]]);
      } else {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nexus-X C++23 Engine Runtime</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">Kernel Stable</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] custom-scrollbar space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-600">[{ (i * 0.15).toFixed(3) }s]</span>
            <span className={
              log.includes('[PQC]') ? 'text-purple-400' :
              log.includes('[USB4]') ? 'text-cyan-400' :
              log.includes('[AI]') ? 'text-indigo-400' :
              log.includes('[PWR]') ? 'text-yellow-400' :
              'text-slate-300'
            }>
              {log}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
        {logs.length === 8 && (
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse mt-2">
            <span className="text-sm">_</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 block uppercase font-bold">CPU Usage (Engine)</span>
          <div className="flex items-center gap-2">
             <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: '12%' }}></div>
             </div>
             <span className="text-[9px] text-cyan-400 font-bold">12%</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Memory Region</span>
          <span className="text-[10px] text-white font-mono uppercase tracking-tighter">0x7FFF1234AA00</span>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Threads</span>
          <span className="text-[10px] text-white font-mono">16 (PQC-Enc)</span>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Latency</span>
          <span className="text-[10px] text-emerald-400 font-mono">&lt; 0.1ms</span>
        </div>
      </div>
    </div>
  );
};
