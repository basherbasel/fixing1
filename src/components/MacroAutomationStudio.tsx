import React, { useState, useEffect } from 'react';
import { Play, Square, FastForward, CheckCircle2, AlertTriangle, Terminal, Cpu, FileCode, Plus, Layers, ShieldCheck, Usb } from 'lucide-react';
import { PRESET_MACROS, MacroRecipe, MacroStep, macroEngine } from '../services/macro-engine';
import { toolBridge, ConnectedDeviceInfo } from '../services/tool-integration-bridge';
import { useI18n } from '../context/I18nContext';

export const MacroAutomationStudio: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { isRTL } = useI18n();
  const [activeDevice, setActiveDevice] = useState<ConnectedDeviceInfo>(toolBridge.getConnectedDevice());
  const [selectedMacro, setSelectedMacro] = useState<MacroRecipe>(PRESET_MACROS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [stepsState, setStepsState] = useState<MacroStep[]>(PRESET_MACROS[0].steps);

  useEffect(() => {
    const unsubscribe = toolBridge.subscribeDeviceConnection((device) => {
      setActiveDevice(device);
      if (device.isConnected) {
        setExecutionLogs(prev => [
          ...prev,
          `[AUTO-READ] Target Phone Sync: ${device.vendorName} ${device.productName} (${device.serial}) via ${device.connectionType}`
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelectMacro = (macro: MacroRecipe) => {
    if (isRunning) return;
    setSelectedMacro(macro);
    setStepsState(macro.steps.map(s => ({ ...s, status: 'PENDING', outputLog: undefined })));
    setExecutionLogs([`[MACRO-INIT] Loaded recipe: ${macro.title}`]);
  };

  const handleRunMacro = async () => {
    setIsRunning(true);
    setExecutionLogs(prev => [...prev, `[MACRO-START] Pipeline initiated for ${selectedMacro.title}`]);
    if (onLog) onLog(`[MACRO-START] Running pipeline: ${selectedMacro.title}`);

    const success = await macroEngine.executeMacro(selectedMacro, (stepId, status, log) => {
      setStepsState(prev => prev.map(s => s.id === stepId ? { ...s, status, outputLog: log } : s));
      setExecutionLogs(prev => [...prev, log]);
      if (onLog) onLog(log);
    });

    setIsRunning(false);
    if (success) {
      setExecutionLogs(prev => [...prev, `[MACRO-COMPLETE] All steps completed successfully!`]);
      if (onLog) onLog(`[MACRO-COMPLETE] Pipeline finished with SUCCESS`);
    } else {
      setExecutionLogs(prev => [...prev, `[MACRO-ABORT] Execution finished with errors or halted.`]);
    }
  };

  const handleStopMacro = () => {
    macroEngine.stopMacro();
    setIsRunning(false);
    setExecutionLogs(prev => [...prev, `[MACRO-STOP] User manually aborted the macro execution.`]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <FastForward className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isRTL ? 'محرك الأتمتة والسكربتات التلقائية (Macro Repair Engine)' : 'Macro Automation & Batch Repair Engine'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                v4.8 AUTO
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'تسلسل آلي حقيقي لتفليش، إصلاح، وتجاوز الحمايات بدون تدخل يدوي' : 'Automated multi-step repair pipeline for flashing, unlock, and NVRAM calibration'}
            </p>
          </div>
        </div>

        {activeDevice.isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300">
            <Usb className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{isRTL ? 'قراءة تلقائية للهاتف الموصل:' : 'Auto-Read Target:'} <strong>{activeDevice.vendorName} {activeDevice.productName}</strong> ({activeDevice.serial})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleRunMacro}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              {isRTL ? 'تشغيل السكربت الآلي' : 'Execute Batch Pipeline'}
            </button>
          ) : (
            <button
              onClick={handleStopMacro}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              {isRTL ? 'إيقاف السكربت' : 'Halt Pipeline'}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preset Macros Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            {isRTL ? 'سكربتات الصيانة الجاهزة' : 'Preset Repair Pipelines'}
          </h3>

          <div className="space-y-2.5">
            {PRESET_MACROS.map(macro => {
              const isSelected = selectedMacro.id === macro.id;
              return (
                <div
                  key={macro.id}
                  onClick={() => handleSelectMacro(macro)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-slate-100 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-cyan-300">{macro.category}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {macro.steps.length} {isRTL ? 'خطوات' : 'steps'}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 line-clamp-1">{macro.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{macro.description}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{macro.targetBrand}</span>
                    <span className="font-mono text-cyan-400/80">{macro.targetChipset}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Execution Monitor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Steps List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{selectedMacro.title}</h3>
                <p className="text-xs text-slate-400">{selectedMacro.description}</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-mono bg-slate-800 text-cyan-400 rounded-md border border-slate-700">
                {selectedMacro.targetChipset}
              </span>
            </div>

            <div className="space-y-3">
              {stepsState.map((step, idx) => {
                const isRunningStep = step.status === 'RUNNING';
                const isSuccess = step.status === 'SUCCESS';
                const isFailed = step.status === 'FAILED';

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isRunningStep
                        ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/30'
                        : isSuccess
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : isFailed
                        ? 'bg-rose-500/5 border-rose-500/30'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center border border-slate-700">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{step.name}</span>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-slate-800 text-slate-400 rounded">
                              {step.actionType}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            Target: <span className="text-cyan-300">{step.target}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {step.status === 'PENDING' && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                            WAITING
                          </span>
                        )}
                        {isRunningStep && (
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            EXECUTING
                          </span>
                        )}
                        {isSuccess && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            PASSED
                          </span>
                        )}
                        {isFailed && (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            FAILED
                          </span>
                        )}
                      </div>
                    </div>

                    {step.outputLog && (
                      <div className="mt-2.5 p-2 bg-slate-950 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
                        {step.outputLog}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Macro Console Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                {isRTL ? 'مخرجات التنفيذ المباشرة (Macro Live Output)' : 'Macro Live Output Log'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">AUTOSCROLL ON</span>
            </div>

            <div className="h-36 overflow-y-auto font-mono text-[11px] space-y-1 p-2 bg-slate-900/50 rounded-lg text-slate-300 border border-slate-800">
              {executionLogs.length === 0 ? (
                <span className="text-slate-600 italic">No macro execution logs available. Click Execute Batch Pipeline to begin.</span>
              ) : (
                executionLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500 select-none">&gt;</span>
                    <span className={log.includes('COMPLETE') || log.includes('PASSED') ? 'text-emerald-400' : log.includes('ERROR') || log.includes('STOP') ? 'text-rose-400' : 'text-cyan-300'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
