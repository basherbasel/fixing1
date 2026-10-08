import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { 
  Cpu, 
  Zap, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  BrainCircuit,
  Waves,
  Gauge
} from 'lucide-react';
import { AIHardwareDiagnosticEngine, AIHealthPrediction, USBTelemetrySample } from '../services/ai-diagnostics';

export const AIHardwareTelemetry: React.FC = () => {
  const [samples, setSamples] = useState<USBTelemetrySample[]>([]);
  const [prediction, setPrediction] = useState<AIHealthPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const aiEngine = new AIHardwareDiagnosticEngine();

  // Generate synthetic high-frequency waveform data
  useEffect(() => {
    const interval = setInterval(() => {
      setSamples(prev => {
        const next = [...prev.slice(-49), {
          timestamp: Date.now(),
          voltage: 5.0 + (Math.random() * 0.2 - 0.1),
          current: 0.45 + (Math.random() * 0.1 - 0.05),
          impedance: 90 + (Math.random() * 4 - 2)
        }];
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const runAIDiagnostics = async () => {
    setIsAnalyzing(true);
    const result = await aiEngine.analyzeWaveforms(samples);
    setPrediction(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            On-Device Edge AI Diagnostics (2028 Vision)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time USB-C PD 3.1 Waveform Analysis & Neural Fault Prediction via Local NPU
          </p>
        </div>
        <button
          onClick={runAIDiagnostics}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg ${
            isAnalyzing ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30'
          }`}
        >
          <Activity className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing Neural Patterns...' : 'Execute Edge AI Scan'}
        </button>
      </div>

      {/* Waveform Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voltage/Current Waveforms */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            USB PD 3.1 Electrical Waveform
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={samples}>
                <defs>
                  <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="voltage" stroke="#22d3ee" fillOpacity={1} fill="url(#colorVoltage)" strokeWidth={2} name="Voltage (V)" />
                <Area type="monotone" dataKey="current" stroke="#818cf8" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} name="Current (A)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Prediction Result */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-400" />
              Neural Fault Prediction Engine
            </h3>
            
            {!prediction ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <BrainCircuit className="w-12 h-12 opacity-20 mb-2" />
                <p className="text-[10px] uppercase font-bold">Awaiting Waveform Stream...</p>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border ${prediction.isSafeToFlash ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-2 ${prediction.isSafeToFlash ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {prediction.isSafeToFlash ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {prediction.isSafeToFlash ? 'Silicon Health: NOMINAL' : 'FAULT DETECTED'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Confidence: {(prediction.confidenceScore * 100).toFixed(1)}%</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {prediction.faultDescription}
                </p>
                <div className="pt-2 border-t border-slate-700/50">
                  <span className="text-[10px] uppercase text-slate-500 block font-bold mb-1">Targeted Component:</span>
                  <span className="text-xs text-indigo-300 font-mono">{prediction.targetedComponent}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Flash Predictor</span>
              <span className="text-xs text-emerald-400 font-bold">Low Risk (80Gbps)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">DMA Stability</span>
              <span className="text-xs text-cyan-400 font-bold">Jitter: 12us (Pass)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
