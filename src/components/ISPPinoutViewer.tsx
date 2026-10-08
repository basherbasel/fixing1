import React, { useState } from 'react';
import { 
  Maximize2, 
  Search, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  Layers,
  Cpu,
  Database,
  Printer,
  Share2
} from 'lucide-react';
import { DeviceModelProfile, GlobalModelDatabase } from '../services/model-database';
import { useI18n } from '../context/I18nContext';

export const ISPPinoutViewer: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [selectedModel, setSelectedModel] = useState<DeviceModelProfile>(GlobalModelDatabase[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = GlobalModelDatabase.filter(m => 
    m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-400" />
            {isRTL ? 'دليل نقاط التوصيل والمخططات' : 'ISP & Test Point Hardware Architect'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRTL ? 'دليل احترافي لنقاط اللحام و ISP ونقاط الاختبار BROM/EDL' : 'Precision soldering guide for eMMC/UFS ISP, EDL Test Points, and BROM forcing.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 border border-slate-700 transition-colors">
            <Printer className="w-4 h-4" />
          </button>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 border border-slate-700 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-2 w-3.5 h-3.5 text-slate-500`} />
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث عن موديل...' : 'Search model...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-lg ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 text-[11px] text-white focus:outline-none focus:border-rose-500/50`}
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-1.5 space-y-1">
              {filteredModels.map((m) => (
                <button
                  key={m.codename}
                  onClick={() => setSelectedModel(m)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all ${
                    selectedModel.codename === m.codename 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">{m.brand} {m.model}</div>
                  <div className="text-[10px] opacity-60 font-mono">{m.soc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isRTL ? 'مواصفات الواجهة' : 'Interface Specs'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">VCC / VCCQ:</span>
                <span className="text-emerald-400 font-bold">1.8V / 2.8V</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">{isRTL ? 'التردد (CLK):' : 'Clock (CLK):'}</span>
                <span className="text-white font-mono">200MHz Max</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">{isRTL ? 'عرض الناقل:' : 'Bus Width:'}</span>
                <span className="text-white">1-bit (DAT0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pinout Visualizer */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative min-h-[500px]">
            {/* Visual Schematic Simulation */}
            <div className="absolute inset-0 bg-[#121212] overflow-hidden flex items-center justify-center">
              <div className="relative w-full h-full p-10 flex items-center justify-center">
                {/* PCB Trace Simulation */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* The "Board" representation */}
                <div className="relative bg-emerald-950/20 border-4 border-emerald-900/50 w-[80%] h-[80%] rounded-3xl shadow-2xl flex items-center justify-center">
                   <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">UFS Memory</span>
                   </div>
                   <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center rotate-45">
                      <span className="text-[10px] text-slate-500 uppercase font-bold -rotate-45">PMIC</span>
                   </div>

                   {/* ISP Points */}
                   <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 space-y-4">
                      <div className={`flex items-center gap-4 group ${isRTL ? 'flex-row-reverse' : ''}`}>
                         <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                         <div className="bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] text-white">
                            <span className="font-bold text-rose-400">DAT0:</span> Pin 4, Resistor R2304
                         </div>
                      </div>
                      <div className={`flex items-center gap-4 group ${isRTL ? 'flex-row-reverse' : ''}`}>
                         <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                         <div className="bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] text-white">
                            <span className="font-bold text-cyan-400">CLK:</span> Pin 2, TP_0092
                         </div>
                      </div>
                      <div className={`flex items-center gap-4 group ${isRTL ? 'flex-row-reverse' : ''}`}>
                         <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                         <div className="bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] text-white">
                            <span className="font-bold text-emerald-400">CMD:</span> Pin 1, Resistor R2301
                         </div>
                      </div>
                   </div>

                   {/* Test Point (TP) EDL */}
                   <div className="absolute top-10 right-10">
                      <div className="flex flex-col items-end gap-2">
                         <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                         </div>
                         <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-[9px] text-amber-400 font-bold uppercase">
                            {isRTL ? 'نقطة EDL (قصر مع الأرضي)' : 'EDL Force (Short to GND)'}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className={`absolute top-4 ${isRTL ? 'left-4 flex-row-reverse' : 'left-4'} right-4 flex justify-between items-center z-20`}>
               <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  {selectedModel.brand} {selectedModel.model} {isRTL ? 'مخطط' : 'Schematic'}
               </div>
               <div className="flex gap-2">
                  <button className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
                  <button className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400 hover:text-white"><Search className="w-4 h-4" /></button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {isRTL ? 'توصيات فنية' : 'Technical Advisories'}
              </h4>
              <ul className={`text-[11px] text-slate-400 space-y-2 list-disc ${isRTL ? 'pr-4 pl-0' : 'pl-4'} `}>
                <li>{isRTL ? 'قم بإزالة البطارية واستخدام مصدر طاقة خارجي 3.3 فولت لضمان استقرار القراءة.' : 'Remove battery and use external 3.3V DC supply for stable ISP reading.'}</li>
                <li>{isRTL ? 'حافظ على طول الأسلاك أقل من 5 سم لمنع تداخل البيانات في الترددات العالية.' : 'Keep wires shorter than 5cm to prevent RFFE data corruption at high CLK.'}</li>
                <li>{isRTL ? 'تحقق من قيمة المقاومة R2304 قبل اللحام؛ استبدلها إذا كانت أكبر من 22 أوم.' : 'Verify resistor R2304 value before soldering; bypass if resistance > 22Ω.'}</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isRTL ? 'التحقق من السلامة' : 'Safety Verification'}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{isRTL ? 'إصدار اللوحة:' : 'Board Revision:'}</span>
                  <span className="text-white">v2.1_GLOBAL</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{isRTL ? 'دايودات الحماية:' : 'Protection Diodes:'}</span>
                  <span className="text-emerald-400 font-bold uppercase">{isRTL ? 'موجودة' : 'Present'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{isRTL ? 'معالج الجهاز:' : 'SoC Architecture:'}</span>
                  <span className="text-white">{selectedModel.soc}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
