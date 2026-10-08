import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Maximize2, 
  Crosshair, 
  Cpu, 
  Database, 
  Zap, 
  Thermometer,
  ShieldCheck,
  Search
} from 'lucide-react';

interface BoardComponent {
  id: string;
  name: string;
  type: 'CPU' | 'NAND' | 'PMIC' | 'RF' | 'USB';
  x: number;
  y: number;
  w: number;
  h: number;
  health: 'Normal' | 'Warning' | 'Critical';
  value?: string;
}

export const DigitalTwinViewer: React.FC = () => {
  const [selectedComp, setSelectedComp] = useState<BoardComponent | null>(null);
  const [activeLayer, setActiveLayer] = useState<'Top' | 'Internal' | 'Bottom'>('Top');
  const [highlightedNet, setHighlightedNet] = useState<string | null>(null);

  const components: BoardComponent[] = [
    { id: 'cpu', name: 'Snapdragon 8 Gen 5 (2nm)', type: 'CPU', x: 40, y: 30, w: 20, h: 20, health: 'Normal', value: '0.85V Core' },
    { id: 'nand', name: 'Samsung UFS 5.0 (2TB)', type: 'NAND', x: 40, y: 55, w: 15, h: 18, health: 'Warning', value: 'LUN 0 Latency High' },
    { id: 'pmic', name: 'Main PMIC (PM8550)', type: 'PMIC', x: 20, y: 35, w: 12, h: 12, health: 'Normal', value: 'S1-S12 Rails Stable' },
    { id: 'modem', name: 'Snapdragon X85 5G-Adv', type: 'RF', x: 65, y: 30, w: 15, h: 15, health: 'Normal', value: 'RFFE_1 Valid' },
    { id: 'usb', name: 'USB-C PD 3.1 Controller', type: 'USB', x: 75, y: 70, w: 10, h: 10, health: 'Critical', value: 'CC1/CC2 Leakage' },
  ];

  const handleLogLink = (compId: string) => {
    const comp = components.find(c => c.id === compId);
    if (comp) {
      setSelectedComp(comp);
      setHighlightedNet(compId === 'usb' ? 'USB_PD_PHY' : compId === 'nand' ? 'UFS_LUN_BUS' : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            Interactive 3D Digital Twin (Boardview 2028)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Silicon/PCB Fusion: Direct link between Software Faults and Physical Hardware Nodes
          </p>
        </div>
        <div className="flex gap-2">
          {['Top', 'Internal', 'Bottom'].map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer as any)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                activeLayer === layer 
                ? 'bg-cyan-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {layer} Layer
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Board SVG */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative min-h-[500px] flex items-center justify-center p-8">
          <div className="absolute top-4 left-4 flex gap-2">
            <button className="p-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
            <button className="p-2 bg-slate-950/80 border border-slate-700 rounded-lg text-slate-400 hover:text-white"><Search className="w-4 h-4" /></button>
          </div>

          <svg viewBox="0 0 100 100" className="w-full h-full max-w-[500px] drop-shadow-2xl">
            {/* PCB Body */}
            <rect x="10" y="10" width="80" height="80" rx="4" fill="#064e3b" stroke="#065f46" strokeWidth="1" />
            <path d="M10 20 L90 20 M10 80 L90 80 M20 10 L20 90 M80 10 L80 90" stroke="#047857" strokeWidth="0.2" strokeDasharray="1 1" />
            
            {/* Highlighted Net Traces */}
            {highlightedNet === 'USB_PD_PHY' && (
              <path d="M75 75 L75 85 L15 85" stroke="#f43f5e" strokeWidth="0.8" fill="none" className="animate-pulse" />
            )}
            {highlightedNet === 'UFS_LUN_BUS' && (
              <path d="M40 60 L30 60 L30 30" stroke="#fbbf24" strokeWidth="0.8" fill="none" className="animate-pulse" />
            )}
            
            {/* Components */}
            {components.map((comp) => (
              <g 
                key={comp.id} 
                className="cursor-pointer group"
                onClick={() => setSelectedComp(comp)}
              >
                <rect 
                  x={comp.x} y={comp.y} width={comp.w} height={comp.h} rx="1"
                  fill={selectedComp?.id === comp.id ? '#1e293b' : '#0f172a'}
                  stroke={
                    comp.health === 'Critical' ? '#f43f5e' : 
                    comp.health === 'Warning' ? '#fbbf24' : 
                    selectedComp?.id === comp.id ? '#22d3ee' : '#334155'
                  }
                  strokeWidth={selectedComp?.id === comp.id ? 1.5 : 0.5}
                  className="transition-all duration-300"
                />
                <text x={comp.x + 2} y={comp.y + 5} fontSize="2.5" fill="#94a3b8" className="font-mono">{comp.type}</text>
                {comp.health !== 'Normal' && (
                  <circle cx={comp.x + comp.w} cy={comp.y} r="1.5" fill={comp.health === 'Critical' ? '#f43f5e' : '#fbbf24'} className="animate-pulse" />
                )}
              </g>
            ))}
          </svg>

          <div className="absolute bottom-4 right-4 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] text-slate-400 font-mono">
            X: 42.10 | Y: 78.55 | Rail: VDD_CORE_0
          </div>
        </div>

        {/* Component Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl h-full">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              Real-time Node Inspector
            </h3>

            {selectedComp ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400">
                    {selectedComp.type === 'CPU' ? <Cpu className="w-6 h-6" /> : 
                     selectedComp.type === 'NAND' ? <Database className="w-6 h-6" /> : 
                     <Zap className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedComp.name}</h4>
                    <span className={`text-[10px] font-bold uppercase ${
                      selectedComp.health === 'Critical' ? 'text-rose-400' : 
                      selectedComp.health === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      Status: {selectedComp.health}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">Impedance</span>
                    <span className="text-xs text-white font-mono">34.2 Ω</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">Rail Voltage</span>
                    <span className="text-xs text-cyan-400 font-mono">{selectedComp.value}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Thermal Fusion Map</span>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '60%' }}></div>
                    <div className="h-full bg-amber-500" style={{ width: '20%' }}></div>
                    <div className="h-full bg-rose-500" style={{ width: '20%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> 42°C</span>
                    <span>TDP: 12W</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase mb-2">Repair Logic Link</span>
                  <div 
                    onClick={() => handleLogLink(selectedComp.id)}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors group"
                  >
                    <p className="text-[10px] text-slate-400 leading-relaxed italic group-hover:text-cyan-400">
                      {selectedComp.id === 'usb' ? '"Hardware profile shows 4.2V leakage on CC1 trace. Highlight probable fault path?"' :
                       selectedComp.id === 'nand' ? '"LUN 0 Latency anomaly correlates with VCCQ rail impedance. Trace net?"' :
                       '"No active software-hardware correlation for this node. Run deep scan?"'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center px-6">
                <Box className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-[10px] uppercase font-bold">Select a component on the Digital Twin to inspect hardware telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
