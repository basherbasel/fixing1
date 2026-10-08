import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Terminal, 
  Search, 
  Database, 
  Cpu, 
  Waves,
  RefreshCw,
  GitBranch,
  Layers,
  Play,
  Square,
  FastForward
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const BusLogicAnalyzer: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<'I2C' | 'SPI' | 'UART' | 'MIPI'>('I2C');
  const [signals, setSignals] = useState<number[][]>(Array.from({ length: 4 }, () => Array(80).fill(0)));
  const [decodedData, setDecodedData] = useState<any[]>([]);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setSignals(prev => prev.map((sig, idx) => {
          let nextVal = 0;
          if (selectedProtocol === 'I2C') {
            // Channel 0: SDA, Channel 1: SCL
            if (idx === 1) nextVal = Math.sin(Date.now() / 50) > 0 ? 1 : 0; // Clock
            else nextVal = Math.random() > 0.3 ? 1 : 0; // Data
          } else if (selectedProtocol === 'SPI') {
            if (idx === 3) nextVal = 0; // CS low
            else if (idx === 1) nextVal = Math.sin(Date.now() / 20) > 0 ? 1 : 0; // Clock
            else nextVal = Math.random() > 0.5 ? 1 : 0;
          } else {
            nextVal = Math.random() > 0.5 ? 1 : 0;
          }
          return [...sig.slice(1), nextVal];
        }));

        if (Math.random() > 0.8) {
          const newItem = {
            time: (Date.now() % 1000).toFixed(1) + 'ms',
            proto: selectedProtocol,
            addr: selectedProtocol === 'I2C' ? '0x3C' : 'CS0',
            data: '0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase(),
            desc: 'REG_WRITE_DATA'
          };
          setDecodedData(prev => [newItem, ...prev].slice(0, 10));
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, selectedProtocol]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center gap-3">
            <Waves className="w-8 h-8 text-cyan-500" />
            {t('logicAnalyzer')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time Digital Signal & Bus Protocol (I2C/SPI/UART) Analyzer</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-cyan-500"
          >
            <option value="I2C">I2C (SDA/SCL)</option>
            <option value="SPI">SPI (MOSI/MISO/CLK/CS)</option>
            <option value="UART">UART (TX/RX)</option>
            <option value="MIPI">MIPI (C-PHY/D-PHY)</option>
          </select>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
              isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'
            } text-white`}
          >
            {isRunning ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            {isRunning ? 'STOP CAPTURE' : 'START CAPTURE'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Logic Viewer */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl p-6 h-[450px] flex flex-col shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                 <Cpu className="w-5 h-5 text-cyan-500" />
                 <span className="text-xs font-mono font-bold text-slate-300">Sampling_Rate: 500MHz</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500 rounded-full" /> I2C_SDA</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full" /> I2C_SCL</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" /> SPI_MOSI</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> SPI_CS</span>
              </div>
           </div>

           <div className="flex-1 space-y-8 px-2">
              {signals.map((sig, idx) => (
                <div key={idx} className="relative h-12 flex items-end">
                   <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-600 transform -rotate-90">CH{idx}</div>
                   <div className="flex-1 flex items-end h-full border-b border-slate-800/50">
                      {sig.map((val, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 transition-all duration-100 ${
                            idx === 0 ? 'bg-cyan-500' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ height: val === 1 ? '80%' : '5%', opacity: val === 1 ? 0.8 : 0.2 }}
                        />
                      ))}
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600 font-mono">
              <span>0ms</span>
              <span>10ms</span>
              <span>20ms</span>
              <span>30ms</span>
              <span>40ms</span>
              <span>50ms</span>
           </div>
        </div>

        {/* Decoder Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-800 bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-3 h-3" />
                 Protocol Decoder
              </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px] custom-scrollbar">
              {decodedData.length === 0 && <div className="text-slate-700 text-center py-10 italic">No data captured...</div>}
              {decodedData.map((row, i) => (
                <div key={i} className="p-2 border border-slate-800 rounded hover:bg-slate-800 transition-colors cursor-pointer animate-in fade-in slide-in-from-top-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-cyan-500">{row.time}</span>
                      <span className="font-bold text-white">{row.proto}</span>
                   </div>
                   <div className="text-slate-400">Target: {row.addr}</div>
                   <div className="text-indigo-400">Data: {row.data}</div>
                   <div className="text-[9px] text-slate-500 mt-1 italic">{row.desc}</div>
                </div>
              ))}
              {isRunning && <div className="p-2 text-cyan-500 animate-pulse">Capturing live {selectedProtocol} traffic...</div>}
           </div>

           <div className="p-4 bg-slate-950 border-t border-slate-800">
              <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                 <FastForward className="w-4 h-4 text-cyan-500" />
                 EXPORT LOGS
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
