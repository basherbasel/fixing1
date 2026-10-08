import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, Key, Smartphone, AlertTriangle, CheckCircle2, Play, RefreshCw, Cpu, Layers, ShieldCheck, Terminal } from 'lucide-react';
import { BYPASS_PRESETS, BypassMethod, SecurityLockStatus, securityBypassEngine } from '../services/security-bypass-engine';
import { useI18n } from '../context/I18nContext';

export const UniversalLockBypassSuite: React.FC<{
  isConnected?: boolean;
  connectionType?: string;
  onLog?: (msg: string) => void;
}> = ({ isConnected = false, connectionType = 'None', onLog }) => {
  const { isRTL } = useI18n();
  const [selectedMethod, setSelectedMethod] = useState<BypassMethod>(BYPASS_PRESETS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lockStatus, setLockStatus] = useState<SecurityLockStatus>({
    frpState: 'LOCKED',
    oemUnlockState: 'LOCKED',
    knoxGuardStatus: 'ACTIVE',
    miCloudStatus: 'CLEAN',
    screenLockType: 'PIN',
    avbState: 'GREEN',
    securityPatchLevel: '2026-09-01'
  });
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const handleRunDiagnostics = async () => {
    if (onLog) onLog('[SECURITY-DIAG] Scanning device protection locks and security state...');
    const status = await securityBypassEngine.runLockDiagnostic(isConnected);
    setLockStatus(status);
    setExecutionLogs(prev => [
      ...prev,
      `[DIAG-RESULT] FRP: ${status.frpState} | Bootloader: ${status.oemUnlockState} | Knox: ${status.knoxGuardStatus} | AVB: ${status.avbState}`
    ]);
  };

  const handleExecuteBypass = async () => {
    setIsExecuting(true);
    setExecutionLogs(prev => [...prev, `[BYPASS-START] Launching lock removal pipeline for ${selectedMethod.name}`]);
    if (onLog) onLog(`[LOCK-BYPASS] Launching pipeline: ${selectedMethod.name}`);

    const success = await securityBypassEngine.executeBypassMethod(selectedMethod, (logMsg) => {
      setExecutionLogs(prev => [...prev, logMsg]);
      if (onLog) onLog(logMsg);
    });

    setIsExecuting(false);
    if (success) {
      setExecutionLogs(prev => [...prev, `[BYPASS-COMPLETE] Protection successfully removed / bypassed!`]);
      // Update lock state simulation
      if (selectedMethod.targetProtection === 'FRP') {
        setLockStatus(prev => ({ ...prev, frpState: 'BYPASSED' }));
      } else if (selectedMethod.targetProtection === 'OEM_BOOTLOADER') {
        setLockStatus(prev => ({ ...prev, oemUnlockState: 'UNLOCKED', avbState: 'ORANGE' }));
      } else if (selectedMethod.targetProtection === 'KNOX') {
        setLockStatus(prev => ({ ...prev, knoxGuardStatus: 'CLEAN' }));
      } else if (selectedMethod.targetProtection === 'SCREEN_LOCK') {
        setLockStatus(prev => ({ ...prev, screenLockType: 'NONE' }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Unlock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isRTL ? 'منظومة تخطي وفك حمايات الهواتف الشاملة (Universal Lock Bypass Suite)' : 'Universal Lock & FRP Bypass Suite'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                PRO 2028
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'تخطي قفل FRP, Knox Guard, OEM Bootloader, وبصمة PIN بدون فقدان البيانات' : 'Bypass Google FRP, Knox Guard, OEM Bootloader, and Screen PIN without data loss'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDiagnostics}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            {isRTL ? 'فحص حمايات الهاتف' : 'Scan Lock States'}
          </button>
          <button
            onClick={handleExecuteBypass}
            disabled={isExecuting}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {isExecuting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950" />
            )}
            {isRTL ? 'بدء عملية التخطي الفعالة' : 'Execute Lock Bypass'}
          </button>
        </div>
      </div>

      {/* Security Lock State Monitor Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* FRP State */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px] block">Google FRP Lock</span>
          <div className="flex items-center gap-2 mt-1">
            {lockStatus.frpState === 'LOCKED' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> LOCKED
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> BYPASSED
              </span>
            )}
          </div>
        </div>

        {/* Bootloader Lock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px] block">OEM Bootloader</span>
          <div className="flex items-center gap-2 mt-1">
            {lockStatus.oemUnlockState === 'LOCKED' ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> LOCKED
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Unlock className="w-4 h-4" /> UNLOCKED
              </span>
            )}
          </div>
        </div>

        {/* Knox Guard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px] block">Samsung Knox Guard</span>
          <div className="flex items-center gap-2 mt-1">
            {lockStatus.knoxGuardStatus === 'ACTIVE' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> ENROLLED
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> CLEAN
              </span>
            )}
          </div>
        </div>

        {/* Screen Lock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px] block">Screen PIN / Pattern</span>
          <div className="flex items-center gap-2 mt-1">
            {lockStatus.screenLockType !== 'NONE' ? (
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Key className="w-4 h-4" /> {lockStatus.screenLockType}
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> REMOVED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Bypass Methods & Execution Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bypass Method Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            {isRTL ? 'طرق وأساليب التخطي المتاحة' : 'Lock Removal Methodologies'}
          </h3>

          <div className="space-y-2.5">
            {BYPASS_PRESETS.map(method => {
              const isSelected = selectedMethod.id === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-300">{method.targetProtection}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      method.riskLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {method.riskLevel} RISK
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-1">{method.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{method.description}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{method.supportedAndroid}</span>
                    <span className="font-mono text-cyan-400">
                      {method.requiresDataWipe ? 'Data Wipe' : 'Zero Data Loss'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Steps & Console Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Method Step Execution Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{selectedMethod.name}</h3>
                <p className="text-xs text-slate-400">{selectedMethod.description}</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono bg-slate-800 text-emerald-400 rounded-md border border-slate-700">
                {selectedMethod.supportedAndroid}
              </span>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                {isRTL ? 'خطوات تنفيذ عملية التخطي' : 'Execution Pipeline Steps'}
              </h4>

              {selectedMethod.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] border border-emerald-500/30">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Console Output Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
            <div className="text-slate-400 pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>Security Bypass Real-time Telemetry</span>
              <span className="text-[10px] text-emerald-400">ACTIVE SESSION</span>
            </div>
            <div className="h-32 overflow-y-auto space-y-1 text-[11px] text-slate-300">
              {executionLogs.length === 0 ? (
                <span className="text-slate-600 italic">No execution logs yet. Click 'Execute Lock Bypass' to begin.</span>
              ) : (
                executionLogs.map((l, i) => (
                  <div key={i} className="text-emerald-400/90">&gt; {l}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
