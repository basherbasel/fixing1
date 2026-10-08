import React, { useState } from 'react';
import { Cpu, Zap, ShieldCheck, Sparkles, Terminal, Play, CheckCircle2, Globe, Database, Wrench } from 'lucide-react';
import { globalSoCDispatcher, SoCProfile, RepairOperationRequest } from '../services/global-soc-repair-dispatcher';
import { useI18n } from '../context/I18nContext';

export const GlobalRepairStudio: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { t, isRTL } = useI18n();
  const socProfiles = globalSoCDispatcher.getSoCProfiles();

  const [selectedBrand, setSelectedBrand] = useState('Xiaomi');
  const [modelName, setModelName] = useState('Xiaomi 14 Ultra / 15 Pro');
  const [selectedSoC, setSelectedSoC] = useState<SoCProfile>(socProfiles[0]);
  const [selectedOp, setSelectedOp] = useState<RepairOperationRequest['operation']>('UNBOOTLOOP');
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const brands = ['Xiaomi', 'Samsung', 'Google Pixel', 'Apple iPhone', 'OnePlus', 'Oppo', 'Vivo', 'Huawei'];

  const handleRunRepair = async () => {
    setIsExecuting(true);
    setLogs([
      `[+] [GLOBAL-STUDIO] Initializing universal multi-SoC repair suite...`,
      `[+] Selected Brand: ${selectedBrand} | Model: ${modelName}`,
      `[+] Processor Architecture: ${selectedSoC.vendor} - ${selectedSoC.chipset}`
    ]);
    if (onLog) onLog(`[GLOBAL-REPAIR] Starting ${selectedOp} for ${selectedBrand} (${modelName})`);

    await globalSoCDispatcher.executeRepair({
      brand: selectedBrand,
      model: modelName,
      soc: selectedSoC,
      operation: selectedOp
    }, (msg) => {
      setLogs(prev => [...prev, msg]);
      if (onLog) onLog(msg);
    });

    setIsExecuting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 space-y-6 text-slate-200 shadow-[0_0_35px_rgba(6,182,212,0.15)] custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isRTL ? 'معمل الإصلاح الشامل لمختلف المعالجات والشركات (Global Multi-SoC Repair Studio)' : 'Global Multi-SoC & Manufacturer Repair Studio'}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-mono">v2028.Universal</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? 'إصلاح جميع أعطال الهواتف بمختلف المعالجات والشركات (Qualcomm, MediaTek, Tensor, Apple, Exynos, Kirin)' : 'Universal protocol support for Snapdragon, Dimensity, Tensor, A-Series, Exynos, and Kirin'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configuration Column */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Target Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Model / Codename</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. Galaxy S24 Ultra / Xiaomi 14"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Processor Architecture (SoC)</label>
            <select
              value={selectedSoC.vendor}
              onChange={(e) => {
                const found = socProfiles.find(s => s.vendor === e.target.value);
                if (found) setSelectedSoC(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {socProfiles.map(s => <option key={s.vendor} value={s.vendor}>{s.vendor} ({s.chipset})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Repair Operation</label>
            <select
              value={selectedOp}
              onChange={(e) => setSelectedOp(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="UNBOOTLOOP">Fix Bootloop / Unbrick (OS Repair)</option>
              <option value="FIX_IMEI">Rebuild IMEI & RF Calibration</option>
              <option value="UNLOCK_BL">Unlock Bootloader / iBoot Bypass</option>
              <option value="RESTORE_NVRAM">Restore NVRAM / modemst1 & 2</option>
              <option value="FBE_DECRYPT">Bypass File-Based Encryption (FBE)</option>
              <option value="DEEP_DIAG">Deep SoC Hardware Diagnostic</option>
            </select>
          </div>

          <button
            disabled={isExecuting}
            onClick={handleRunRepair}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-40`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isExecuting ? 'Executing Repair...' : 'Execute Universal Repair'}</span>
          </button>
        </div>

        {/* Terminal & Diagnostic Output */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isRTL ? 'سجل العمليات والبروتوكولات الفورية' : 'Live Protocol & Hardware Execution Logs'}</span>
            </span>
            <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-slate-400 font-mono">
              Protocol: {selectedSoC.edlPortOrBrom}
            </span>
          </div>

          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1.5 overflow-y-auto custom-scrollbar min-h-[220px] max-h-[320px]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-12">
                <Wrench className="w-8 h-8 mb-2 opacity-30 animate-pulse" />
                <span>{isRTL ? 'اضغط "Execute Universal Repair" لبدء عملية الإصلاح الشامل...' : 'Click "Execute Universal Repair" to start process...'}</span>
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
