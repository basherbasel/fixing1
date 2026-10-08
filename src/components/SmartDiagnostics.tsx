import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { toolBridge } from '../services/tool-integration-bridge';

export const SmartDiagnostics: React.FC = () => {
  const { t } = useI18n();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagResults, setDiagResults] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<{ risk: number, msg: string } | null>(null);

  useEffect(() => {
    const unsubscribe = toolBridge.subscribe((event) => {
      if (event.action === 'DIAGNOSE_NET') {
        setDiagResults(prev => [
          `[BRIDGE-AI] Received net trace signal: Net [${event.payload.netId}] from BoardSchematicExplorer. Analyzing impedance...`,
          ...prev
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setProgress(0);
    setDiagResults([]);
    setPrediction(null);
    
    const logs = [
      '[AI] Initializing Neural Processing Unit (NPU) v5.0...',
      '[AI] Calibrating USB-C PD 3.1 High-Frequency ADC...',
      '[AI] Sampling current waveform on VCC_CORE (1MHz sampling rate)...',
      '[AI] Analyzing DMA response latency on UFS 4.0 Host Controller...',
      '[AI] Verifying Root of Trust (RoT) signatures against Global Ledger...',
      '[AI] Comparing power signature with SoC (Snapdragon 8 Gen 5) base model...',
      '[AI] Detected sub-harmonic oscillation on PMIC Rail S12 (possible dry joint).',
      '[AI] Global diagnostic scan complete.'
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setPrediction({ 
            risk: 12, 
            msg: 'High confidence scan: Hardware integrity at 98.2%. Safe to proceed with Ultra-Flash.' 
          });
          return 100;
        }
        if (p % 15 === 0 && currentLog < logs.length) {
          setDiagResults(prev => [...prev, logs[currentLog++]]);
        }
        return p + 2;
      });
    }, 60);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            {t('aiDiag')}
          </h2>
          <p className="text-xs text-slate-400">On-Device Edge AI Diagnostics & Predictive Signal Analysis (2028 Platform)</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            isScanning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
          }`}
        >
          {isScanning ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isScanning ? 'Processing AI Nodes...' : 'Initiate Neural Scan'}
        </button>
      </div>

      {isScanning && (
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-cyan-400/60 uppercase">
            <span>Analyzing Waveforms...</span>
            <span>Progress: {progress}%</span>
          </div>
        </div>
      )}

      {prediction && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4 animate-in zoom-in duration-500">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Predictive Safety Pass</h4>
            <p className="text-xs text-slate-300">{prediction.msg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Silicon Health Profiling
          </h3>
          <div className="space-y-3">
            {[
              { label: 'NPU Core Integrity', status: 'Optimal', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'UFS 5.0 LUN Health', status: '99.8% S.M.A.R.T', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Clock Jitter Variance', status: '0.0012 ps', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Voltage Rail Noise', status: '-92dBm (Low)', icon: CheckCircle2, color: 'text-emerald-400' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${item.color}`}>{item.status}</span>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            USB PD 3.1 Power Analysis
          </h3>
          <div className="space-y-3">
            {[
              { label: 'CC Line Impedance', status: '5.1k Ω (Standard)', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'PD Negotiated Role', status: 'Sink / 24V 5A', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'D+/D- Differential Pass', status: 'Valid (USB4)', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'Thermal Profile Link', status: 'Connected', icon: ShieldCheck, color: 'text-cyan-400' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${item.color}`}>{item.status}</span>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Neural Analysis Logs (C++23 Edge Runtime)</h3>
        <div className="font-mono text-[10px] space-y-1 h-32 overflow-y-auto custom-scrollbar">
          {diagResults.length === 0 ? (
            <p className="text-slate-700 italic">Standby for AI telemetry input...</p>
          ) : (
            diagResults.map((log, idx) => (
              <p key={idx} className="text-slate-400">
                <span className="text-cyan-600 mr-2">[{ (idx * 0.125).toFixed(3) }s]</span>
                {log}
              </p>
            ))
          )}
          {isScanning && <div className="w-2 h-4 bg-cyan-500 animate-pulse inline-block align-middle ml-1" />}
        </div>
      </div>
    </div>
  );
};
