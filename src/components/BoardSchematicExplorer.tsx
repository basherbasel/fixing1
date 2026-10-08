import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Maximize2,
  ChevronRight,
  Database,
  Crosshair,
  GitBranch,
  Info
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { toolBridge } from '../services/tool-integration-bridge';

export const BoardSchematicExplorer: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { t, isRTL } = useI18n();
  const [selectedNet, setSelectedNet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const nets = [
    { id: 'VCC_MAIN', type: 'Power', voltage: '3.8V', connections: 142, path: 'M130,140 L130,250 L300,250' },
    { id: 'I2C0_SDA', type: 'Data', voltage: '1.8V', connections: 8, path: 'M130,140 L130,220 L300,220' },
    { id: 'USB_DP', type: 'Differential', voltage: '3.3V', connections: 4, path: 'M500,250 L600,250 L600,100' },
    { id: 'BATT_TEMP', type: 'Analog', voltage: '1.2V', connections: 2, path: 'M400,350 L400,450 L50,450' }
  ];

  const handleNetSelect = (netId: string) => {
    setSelectedNet(netId);
    toolBridge.publish({
      sourceTool: 'BoardSchematicExplorer',
      targetTool: 'SmartDiagnostics',
      action: 'DIAGNOSE_NET',
      payload: { netId },
      timestamp: Date.now()
    });
    if (onLog) {
      onLog(`[SCHEMATIC] Tracing net: ${netId}. Mapping logical dependencies across layers...`);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-cyan-500" />
            {t('boardSchematic')}
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-mono">CAD-Engine: Vectorized PCB Layer Explorer v4.2 (Sub-Surface Tracing)</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
            <input 
              type="text"
              placeholder="Search Net/Component (U2, C12, VCC...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-slate-900 border border-slate-800 rounded-xl py-2 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} text-sm focus:outline-none focus:border-cyan-500 transition-all w-64`}
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <Maximize2 className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Schematic Viewer (Vector Sim) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center p-8 group">
          {/* Mock PCB SVG Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="relative w-full h-full border border-cyan-500/20 rounded-lg bg-slate-900/30 flex items-center justify-center overflow-hidden cursor-crosshair">
            {/* Simulated Vector Rendering */}
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* Ground Planes */}
              <rect x="50" y="50" width="700" height="400" rx="20" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* Components */}
              <rect x="300" y="150" width="200" height="200" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="400" y="255" textAnchor="middle" fill="#475569" fontSize="14" className="font-bold select-none">CPU / A19 PRO (3nm)</text>
              
              <rect x="100" y="100" width="60" height="40" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="130" y="125" textAnchor="middle" fill="#475569" fontSize="10">U1200 (PMIC)</text>

              <rect x="550" y="80" width="100" height="150" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="600" y="160" textAnchor="middle" fill="#475569" fontSize="12" className="font-bold">NAND / UFS 5.0</text>

              <rect x="50" y="250" width="120" height="80" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <text x="110" y="295" textAnchor="middle" fill="#475569" fontSize="11">USB-C PD 3.1</text>
              
              {/* Interactive Net Tracing */}
              {nets.map(net => (
                <path 
                  key={net.id}
                  d={net.path} 
                  fill="none" 
                  stroke={selectedNet === net.id ? '#22d3ee' : '#1e293b'} 
                  strokeWidth={selectedNet === net.id ? '3' : '1'} 
                  strokeLinecap="round"
                  className="transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedNet(net.id)}
                />
              ))}

              {selectedNet && nets.find(n => n.id === selectedNet) && (
                <circle cx={nets.find(n => n.id === selectedNet)?.path.split(' ')[0].substring(1).split(',')[0]} cy={nets.find(n => n.id === selectedNet)?.path.split(' ')[0].substring(1).split(',')[1]} r="4" fill="#22d3ee" className="animate-pulse" />
              )}
            </svg>

            {/* Float Info */}
            {selectedNet && (
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 p-3 rounded-lg shadow-xl animate-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-white">{selectedNet}</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1">
                  <p>Voltage: 3.8V Nominal</p>
                  <p>Type: Primary Power Rail</p>
                  <p>Nodes: 14 Nodes Connected</p>
                </div>
              </div>
            )}
          </div>

          {/* Layer Selector */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 p-1.5 rounded-full">
            {['TOP', 'IN1', 'IN2', 'BOT'].map((layer) => (
              <button 
                key={layer}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                  layer === 'TOP' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Component/Net List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-3 h-3" />
              Netlist
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">2,482 Nets</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {nets.map((net) => (
              <button
                key={net.id}
                onClick={() => handleNetSelect(net.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  selectedNet === net.id 
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' 
                    : 'border-transparent hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold">{net.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    net.type === 'Power' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {net.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] opacity-60">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {net.voltage}</span>
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {net.connections} pins</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all">
              <Info className="w-4 h-4" />
              Detailed Schematic View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
