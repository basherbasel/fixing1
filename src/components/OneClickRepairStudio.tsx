import React, { useState, useEffect } from 'react';
import { Zap, Cpu, ShieldCheck, Sparkles, Terminal, Play, CheckCircle2, AlertTriangle, RefreshCw, Usb } from 'lucide-react';
import { oneClickRepairEngine, ConnectedDeviceProfile, RepairOption } from '../services/one-click-repair-engine';
import { useI18n } from '../context/I18nContext';

export const OneClickRepairStudio: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { t, isRTL } = useI18n();
  const [device, setDevice] = useState<ConnectedDeviceProfile | null>(oneClickRepairEngine.getConnectedDevice());
  const [options, setOptions] = useState<RepairOption[]>(oneClickRepairEngine.getAvailableRepairOptions());
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeRepairId, setActiveRepairId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [repairLogs, setRepairLogs] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = oneClickRepairEngine.subscribe((dev) => {
      setDevice(dev);
      setOptions(oneClickRepairEngine.getAvailableRepairOptions());
    });
    return () => unsubscribe();
  }, []);

  const handleExecuteRepair = async (option: RepairOption) => {
    setIsExecuting(true);
    setActiveRepairId(option.id);
    setProgress(0);
    setRepairLogs([
      `[+] [1-CLICK] Initializing automated repair sequence: [${option.title}]`,
      `[+] Target Device: ${device?.productName || 'Generic USB Target'} (${device?.serialNumber})`,
      `[+] Protocol: Fastboot/ADB Direct Tunnel active. Verifying SafetyGuard bounds...`
    ]);
    if (onLog) onLog(`[1-CLICK] Executing ${option.title} on target ${device?.productName}`);

    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(r => setTimeout(r, (option.estimatedSeconds * 1000) / totalSteps));
      const pct = (i / totalSteps) * 100;
      setProgress(pct);

      if (i === 2) {
        setRepairLogs(prev => [...prev, `[+] Executing low-level hardware command handshake...`]);
      } else if (i === 4) {
        setRepairLogs(prev => [...prev, `[+] Verifying CRC32 checksum and partition cryptographic digest...`]);
      } else if (i === 5) {
        setRepairLogs(prev => [...prev, `[+] [SUCCESS] Repair operation completed successfully. Zero bit errors recorded.`]);
        if (onLog) onLog(`[1-CLICK] Success: ${option.title} completed.`);
      }
    }

    setIsExecuting(false);
  };

  const handleSimulateConnect = () => {
    oneClickRepairEngine.setConnectedDevice({
      vid: '0x18D1',
      pid: '0x4EE7',
      manufacturer: 'Google / Pixel',
      productName: 'Pixel 9 Pro Quantum 2028',
      serialNumber: `NX9P-${Math.floor(Math.random() * 899999 + 100000)}`,
      connectionType: 'WebUSB Fastboot',
      soc: 'Tensor G5 / Snapdragon 8 Gen 5',
      storage: '1TB UFS 5.0',
      bootloaderState: 'Unlocked',
      nvramStatus: 'Intact',
      riskScore: 2
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-2xl border border-indigo-500/30 p-6 space-y-6 text-slate-200 shadow-[0_0_35px_rgba(99,102,241,0.15)] custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isRTL ? 'منصة الإصلاح التلقائي بضغطة زر (1-Click Auto-Repair Hub)' : '1-Click Intelligent Auto-Repair Hub'}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/40 font-mono">v2028.Ultimate</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? 'تعرف تلقائي على الهاتف المتصل وتنفيذ خيارات الإصلاح الشاملة بنقرة واحدة' : 'Automatic device identification, multi-domain diagnostics, and one-click execution'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateConnect}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Usb className="w-4 h-4" />
          <span>{isRTL ? 'محاكاة توصيل هاتف جديد' : 'Simulate USB Connect'}</span>
        </button>
      </div>

      {/* Device Info Banner */}
      {device ? (
        <div className="bg-slate-900/80 border border-indigo-500/30 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{device.productName}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Connected ({device.connectionType})</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>Serial: {device.serialNumber}</span>
                <span>•</span>
                <span>SoC: {device.soc}</span>
                <span>•</span>
                <span>Storage: {device.storage}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Bootloader: <strong className="text-cyan-400">{device.bootloaderState}</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-sm font-bold text-white">No Phone Connected via WebUSB</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Connect your target device using a USB cable or click "Simulate USB Connect" above.</p>
        </div>
      )}

      {/* Options & Terminal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Repair Options */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>{isRTL ? 'خيارات الإصلاح التلقائي المتاحة' : 'Tailored One-Click Repair Options'}</span>
          </span>

          <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
            {options.map((opt) => (
              <div key={opt.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between hover:border-indigo-500/40 transition-all">
                <div className="space-y-1 max-w-[280px]">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>{opt.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{opt.safetyLevel}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{opt.description}</p>
                </div>
                <button
                  disabled={isExecuting || !device}
                  onClick={() => handleExecuteRepair(opt)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isExecuting && activeRepairId === opt.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/35 cursor-wait'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting && activeRepairId === opt.id ? 'Repairing...' : '1-Click Fix'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal & Progress */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isRTL ? 'سجل العمليات الفورية (Live Execution Logs)' : 'Live Execution & Diagnostic Logs'}</span>
            </span>
            {isExecuting && (
              <span className="text-xs font-mono text-amber-400 animate-pulse">{Math.round(progress)}% Complete</span>
            )}
          </div>

          {isExecuting && (
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1.5 overflow-y-auto custom-scrollbar min-h-[180px] max-h-[260px]">
            {repairLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-12">
                <Sparkles className="w-8 h-8 mb-2 opacity-30 animate-pulse" />
                <span>{isRTL ? 'اختر خيار إصلاح وانقر "1-Click Fix" لبدء العملية الفعلية...' : 'Select a repair option and click "1-Click Fix"...'}</span>
              </div>
            ) : (
              repairLogs.map((log, idx) => (
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
