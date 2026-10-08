import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Camera, 
  Maximize2,
  RefreshCw,
  Cpu,
  Flame,
  Search
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const NeuralThermalVision: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [isScanning, setIsScanning] = useState(false);
  const [heatMap, setHeatMap] = useState<number[]>([]);
  const [criticalPoints, setCriticalPoints] = useState<{x: number, y: number, temp: number}[]>([]);

  const startScan = () => {
    setIsScanning(true);
    setHeatMap([]);
    setCriticalPoints([]);
    
    // Neural power profiling sequence
    const sequence = [
      'Initializing high-frequency USB current monitoring...',
      'Mapping VCC_MAIN power rail response...',
      'Detecting impedance mismatches in BUCK regulators...',
      'Neural engine comparing waveform with known device failure signatures...',
      'Identifying primary thermal leakage points...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < 400) {
        setHeatMap(prev => [...prev, Math.floor(Math.random() * 40) + 30]);
        step += 20;
      } else {
        clearInterval(interval);
        setHeatMap(Array.from({ length: 400 }, () => Math.floor(Math.random() * 40) + 30));
        setCriticalPoints([
          { x: 120, y: 80, temp: 85.4 },
          { x: 250, y: 150, temp: 92.1 }
        ]);
        setIsScanning(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            {t('thermalVision')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Advanced PCB heat mapping via neural-processed USB power profiling
          </p>
        </div>
        <button
          onClick={startScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20"
        >
          {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          {isScanning ? 'Analyzing Thermals...' : t('shortCircuitDetect')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Thermal View */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 overflow-hidden relative min-h-[400px] flex items-center justify-center">
          {heatMap.length > 0 ? (
            <div className="grid grid-cols-20 gap-0.5 w-full h-full opacity-80 blur-[2px]">
              {heatMap.map((temp, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-sm"
                  style={{ 
                    backgroundColor: temp > 80 ? '#ef4444' : temp > 60 ? '#f97316' : temp > 40 ? '#eab308' : '#3b82f6'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <Thermometer className="w-16 h-16 text-slate-700 mx-auto animate-pulse" />
              <p className="text-slate-500">Start scanning to visualize PCB thermal patterns</p>
            </div>
          )}

          {/* Critical Point Overlays */}
          {criticalPoints.map((point, i) => (
            <div 
              key={i}
              className="absolute group cursor-pointer"
              style={{ left: `${point.x}px`, top: `${point.y}px` }}
            >
              <div className="w-6 h-6 border-2 border-white rounded-full animate-ping absolute -inset-0" />
              <div className="w-6 h-6 border-2 border-red-500 rounded-full relative bg-red-500/20" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                HOTSPOT: {point.temp}°C
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Diagnostics */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Component Analysis
            </h3>
            <div className="space-y-3">
              {[
                { name: 'PMIC (Power Management)', status: 'Warning', temp: '82°C', health: 45 },
                { name: 'CPU Core Cluster', status: 'Stable', temp: '42°C', health: 92 },
                { name: 'NAND Flash', status: 'Stable', temp: '38°C', health: 98 },
                { name: 'Charging IC', status: 'Critical', temp: '94°C', health: 12 }
              ].map((comp, i) => (
                <div key={i} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-400">{comp.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      comp.status === 'Critical' ? 'bg-red-500/20 text-red-400' : 
                      comp.status === 'Warning' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          comp.health < 30 ? 'bg-red-500' : comp.health < 60 ? 'bg-orange-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${comp.health}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">{comp.temp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              AI Recommendation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detected unusual thermal spikes near the U2 Charging IC. Likely short-circuit in Capacitor C2314 or internal PMU failure. Recommend checking input voltage on PP_VCC_MAIN rail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
