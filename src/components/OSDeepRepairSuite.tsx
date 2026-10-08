import React, { useState } from 'react';
import { 
  Box, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Activity, 
  RefreshCw, 
  Terminal,
  FileCode,
  Layers,
  AlertTriangle,
  HardDrive,
  GitBranch,
  Settings
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const OSDeepRepairSuite: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [repairing, setRepairing] = useState(false);
  const [repairLog, setRepairLog] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'repairing' | 'finished'>('idle');
  const [kernelTrace, setKernelTrace] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setRepairLog(prev => [...prev, `[OS-REPAIR] ${msg}`]);
  };

  React.useEffect(() => {
    if (repairing) {
      const traceInterval = setInterval(() => {
        const trace = [
          'pc : [<ffffffd30b62e49c>] lr : [<ffffffd30b62e480>] pstate: 60400005',
          'sp : ffffffc00b46be10',
          'x29: ffffffc00b46be10 x28: ffffff8008b46000',
          'x27: 0000000000000000 x26: ffffff8008b46000',
          'Call trace:',
          '[<ffffffd30b62e49c>] dwc3_qcom_interrupt+0x34/0x50',
          '[<ffffffd30b0f49c0>] __handle_irq_event_percpu+0x6c/0x168',
        ];
        setKernelTrace(prev => [trace[Math.floor(Math.random() * trace.length)], ...prev].slice(0, 5));
      }, 1000);
      return () => clearInterval(traceInterval);
    }
  }, [repairing]);

  const startRepair = () => {
    setRepairing(true);
    setStatus('scanning');
    setRepairLog([]);
    
    const repairSteps = [
      'Attaching to system kernel debug port (KDP) via USB...',
      'Analyzing system partition checksums (SHA-512) for block-level integrity...',
      'Corruption detected in /system_root/framework/services.jar (Block 0x4892)',
      'DM-Verity integrity check failed on /vendor_dlkm partition.',
      'Checking Super Partition metadata slots (A/B slots)...',
      'Logical block mismatch found in slot B header.',
      'Switching status to REPAIRING...',
      'Patching kernel boot parameters (cmdline: disable_dm_verity=1)...',
      'Reconstructing Super Partition metadata from secondary backup (Slot A)...',
      'Injecting missing kernel modules to /boot/dtb (Device Tree Blob)...',
      'Rebuilding SELinux policy file (sepolicy) for repaired system hooks...',
      'Signing system images with OEM-trusted PQC keys...',
      'Cleaning Dalvik/ART cache for repaired core modules...',
      'Kernel integrity re-verification (AVB 3.0)... PASSED',
      'Deep Repair Complete. System integrity successfully restored.'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < repairSteps.length) {
        addLog(repairSteps[index]);
        if (index === 6) setStatus('repairing');
        index++;
      } else {
        clearInterval(interval);
        setStatus('finished');
        setRepairing(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center gap-3">
            <Box className="w-8 h-8 text-purple-500" />
            {t('osDeepRepair')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Kernel-Level OS Integrity & System Image Reconstruction Suite</p>
        </div>
        <button
          onClick={startRepair}
          disabled={repairing}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
        >
          {repairing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {repairing ? 'Repairing Kernel...' : 'Start Deep Repair'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrity Logs */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 h-[450px] flex flex-col font-mono text-[11px] overflow-hidden shadow-2xl">
           <div className="flex items-center justify-between mb-4 text-slate-500 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2 uppercase tracking-widest font-bold">
                 <Terminal className="w-4 h-4" />
                 Integrity_Engine_Logs
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px]">DEBUG_MODE_ON</span>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {repairLog.length === 0 && <p className="text-slate-700 italic">No operations active. Click "Start Deep Repair" to begin.</p>}
              {repairLog.map((log, i) => (
                <div key={i} className={log.includes('Complete') || log.includes('restored') ? 'text-green-400 font-bold' : log.includes('detected') || log.includes('failed') ? 'text-red-400' : 'text-slate-400'}>
                   {log}
                </div>
              ))}
           </div>

           {repairing && (
             <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-4 font-mono text-[9px] text-cyan-500/80 space-y-1">
                <div className="flex items-center gap-2 mb-1 text-cyan-400 font-bold uppercase">
                   <Activity className="w-3 h-3" /> Live Kernel Trace
                </div>
                {kernelTrace.map((line, i) => (
                  <div key={i} className="truncate">{line}</div>
                ))}
             </div>
           )}

           {repairing && (
             <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] text-purple-400 animate-pulse uppercase font-bold tracking-tighter">
                      {status === 'scanning' ? 'Scanning_Partitions...' : 'Reconstructing_Kernel_Sectors...'}
                   </span>
                   <Activity className="w-4 h-4 text-purple-500 animate-bounce" />
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 animate-progress w-[40%]" />
                </div>
             </div>
           )}
        </div>

        {/* System Overview */}
        <div className="space-y-6">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Settings className="w-4 h-4" />
                 OS Profile
              </h3>
              <div className="space-y-3">
                 {[
                   { label: 'OS Type', value: 'HyperOS / Android 14' },
                   { label: 'Kernel', value: '6.1.25-Nexus-v2' },
                   { label: 'Build ID', value: 'UKQ1.230917.001' },
                   { label: 'Security Patch', value: '2024-05-01' }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-medium">{item.label}</span>
                      <span className="text-slate-300 font-mono">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Layers className="w-4 h-4" />
                 System Partition Health
              </h3>
              <div className="space-y-4">
                 {[
                   { name: '/system', health: 42, color: 'bg-red-500' },
                   { name: '/vendor', health: 85, color: 'bg-green-500' },
                   { name: '/product', health: 98, color: 'bg-green-500' },
                   { name: '/boot', health: 12, color: 'bg-red-500' }
                 ].map((part, i) => (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                         <span className="text-slate-400">{part.name}</span>
                         <span className="text-slate-500">{part.health}%</span>
                      </div>
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                         <div className={`h-full ${part.color}`} style={{ width: `${part.health}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
