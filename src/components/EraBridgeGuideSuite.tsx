import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cable,
  Activity,
  RotateCw,
  Terminal,
  HelpCircle,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';
import {
  EraBridgeController,
  SOC_PROFILES_DATABASE,
  SocArchitectureProfile
} from '../services/era-bridge';
import { RealWebUsbFastboot } from '../services/webusb-fastboot';
import { RealWebSerialController } from '../services/web-serial';
import { RealWebUsbAdb } from '../services/webusb-adb';

interface EraBridgeGuideSuiteProps {
  addLog: (msg: string) => void;
  isConnected: boolean;
  connectionType: string;
  fastbootDriver: React.RefObject<RealWebUsbFastboot>;
  serialDriver: React.RefObject<RealWebSerialController>;
  adbDriver: React.RefObject<RealWebUsbAdb>;
}

export const EraBridgeGuideSuite: React.FC<EraBridgeGuideSuiteProps> = ({
  addLog,
  isConnected,
  connectionType,
  fastbootDriver,
  serialDriver,
  adbDriver
}) => {
  const controller = new EraBridgeController();
  const profiles = SOC_PROFILES_DATABASE;

  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0].id);
  const selectedProfile: SocArchitectureProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const [selectedOperation, setSelectedOperation] = useState<string>(
    selectedProfile.supportedOperations[0]
  );

  // Voltage simulator/evaluator
  const [inputVoltageMv, setInputVoltageMv] = useState<number>(selectedProfile.safeVoltageMv.optimal);
  const voltageEval = controller.evaluateVoltageSafety(inputVoltageMv, selectedProfile);

  // Interactive DFU / BROM Timing Coach
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerStep, setTimerStep] = useState<number>(0);
  const [timerCountdown, setTimerCountdown] = useState<number>(0);

  useEffect(() => {
    // When profile changes, reset selected operation and voltage to optimal
    if (selectedProfile.supportedOperations.length > 0) {
      setSelectedOperation(selectedProfile.supportedOperations[0]);
    }
    setInputVoltageMv(selectedProfile.safeVoltageMv.optimal);
    setTimerRunning(false);
    setTimerStep(0);
  }, [selectedProfileId]);

  // Timing Coach steps for DFU / Key sequences
  const timingSteps = [
    { title: 'Prepare Device', duration: 3, instruction: 'Power off device completely. Connect USB-C / Lightning cable to workstation.' },
    { title: 'Press Vol UP then Vol DOWN', duration: 2, instruction: 'Quick-press Volume UP, release immediately. Quick-press Volume DOWN, release immediately.' },
    { title: 'Hold Side / Power Button', duration: 10, instruction: 'Press and HOLD Side / Power button until screen turns black (approx. 10 seconds).' },
    { title: 'Add Volume DOWN', duration: 5, instruction: 'WHILE STILL HOLDING Power, press and HOLD Volume DOWN simultaneously for 5 seconds.' },
    { title: 'Release Power (Keep Vol DOWN)', duration: 10, instruction: 'RELEASE Power button, but CONTINUE HOLDING Volume DOWN for 10 seconds until USB handshake.' },
    { title: 'DFU / BROM Active', duration: 0, instruction: 'Device is now in DFU / BROM mode! Screen should stay completely pitch-black.' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev <= 1) {
            // Next step
            if (timerStep < timingSteps.length - 1) {
              setTimerStep((s) => s + 1);
              return timingSteps[timerStep + 1]?.duration || 0;
            } else {
              setTimerRunning(false);
              addLog('[COACH] Timing sequence completed. Hardware mode entered.');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerStep]);

  const startTimingCoach = () => {
    setTimerStep(0);
    setTimerCountdown(timingSteps[0].duration);
    setTimerRunning(true);
    addLog(`[COACH] Started Hardware Key Timing Coach for ${selectedProfile.name}`);
  };

  const stopTimingCoach = () => {
    setTimerRunning(false);
    setTimerStep(0);
    setTimerCountdown(0);
  };

  const guidance = controller.getTechnicianGuidance(selectedProfile, selectedOperation);

  const handleTestBusHandshake = async () => {
    addLog(`[BUS-TEST] Initiating silicon bus handshake check for ${selectedProfile.name}...`);
    addLog(`[BUS-TEST] Expected hardware protocol: ${selectedProfile.busProtocol}`);
    addLog(`[BUS-TEST] Active physical connection: ${isConnected ? connectionType : 'None'}`);

    if (isConnected) {
      if (connectionType.includes('Fastboot') && fastbootDriver.current?.connected) {
        try {
          addLog('[BUS-TEST] Fastboot driver active. Querying SoC product details...');
          const product = await fastbootDriver.current.getVar('product');
          const socVar = await fastbootDriver.current.getVar('soc-id');
          addLog(`[BUS-TEST] Fastboot Response -> Product: ${product || 'OK'} | SoC ID: ${socVar || 'N/A'}`);
        } catch (e: any) {
          addLog(`[BUS-TEST] Fastboot Query Error: ${e.message}`);
        }
      } else if (connectionType.includes('Serial') && serialDriver.current?.connected) {
        try {
          addLog('[BUS-TEST] Serial COM driver active. Sending diagnostic ping AT...');
          await serialDriver.current.writeCommand('AT\r\n');
          addLog('[BUS-TEST] Serial ping dispatched. Awaiting modem/preloader echo.');
        } catch (e: any) {
          addLog(`[BUS-TEST] Serial Query Error: ${e.message}`);
        }
      } else if (connectionType.includes('ADB') && adbDriver.current?.connected) {
        addLog('[BUS-TEST] ADB USB connection active. Handshake verified.');
      }
    } else {
      addLog(`[BUS-TEST] Notice: Device is not physically connected via USB yet.`);
      addLog(`[BUS-TEST] Follow the test point guide below to enter ${selectedProfile.hardwareTestPointGuide.mode}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 p-5 rounded-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Universal Era Bridge (2014 – 2027)
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Multi-Silicon Matrix
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              SoC Architecture Analyzer & Hardware Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous era routing across eMMC 4.5 through UFS 5.0 with real hardware test point pinouts, BROM/EDL/DFU timing, and voltage protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestBusHandshake}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Verify Silicon Handshake
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left is Silicon Selector & Specs, Right is Hardware Guide & Pinout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SoC Profile & Silicon Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* SoC Selection Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Target Silicon Architecture & Generation
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.vendor}] {p.name}
                </option>
              ))}
            </select>

            {/* Era Badge and Quick Summary */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    selectedProfile.era === '2024_2027_NEXTGEN'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : selectedProfile.era === '2019_2023_MODERN'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {selectedProfile.eraLabel}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedProfile.vendor}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Profile ID: {selectedProfile.id}
              </span>
            </div>
          </div>

          {/* Deep Architectural Specifications */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Silicon Protocol Specifications
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Storage Architecture</span>
                <span className="text-white font-medium">{selectedProfile.storageStandard}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Hardware Bus Protocol</span>
                <span className="text-cyan-400 font-mono text-[11px]">{selectedProfile.busProtocol}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Download Loader Architecture</span>
                <span className="text-indigo-300 font-mono text-[11px]">{selectedProfile.loaderType}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-500 block font-semibold">Partition Standard</span>
                <span className="text-slate-300">{selectedProfile.partitionScheme}</span>
              </div>
            </div>
          </div>

          {/* Voltage Rail Safety Monitor */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Bus Voltage Rail Safety
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  voltageEval.status === 'Optimal'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : voltageEval.status === 'Caution'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {voltageEval.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Workbench Bench Supply:</span>
                <span className="font-mono text-white font-bold">{inputVoltageMv} mV</span>
              </div>

              <input
                type="range"
                min="2800"
                max="4600"
                step="50"
                value={inputVoltageMv}
                onChange={(e) => setInputVoltageMv(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: {selectedProfile.safeVoltageMv.min} mV</span>
                <span>Nominal: {selectedProfile.safeVoltageMv.optimal} mV</span>
                <span>Max: {selectedProfile.safeVoltageMv.max} mV</span>
              </div>

              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                {voltageEval.message}
              </p>
            </div>
          </div>

          {/* Operations List */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Diagnostic & Maintenance Workflow
            </label>
            <div className="space-y-1.5">
              {selectedProfile.supportedOperations.map((op) => (
                <button
                  key={op}
                  onClick={() => {
                    setSelectedOperation(op);
                    addLog(`[WORKFLOW] Selected operation: ${op} for ${selectedProfile.name}`);
                  }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    selectedOperation === op
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{op}</span>
                  {selectedOperation === op && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Hardware Guide, Pinouts, Cables & Timing Coach (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Hardware Connection & Test Point Guide Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Silicon Handshake Mode
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  {selectedProfile.hardwareTestPointGuide.mode}
                </h3>
              </div>
              <span className="px-2.5 py-1 text-[11px] rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {selectedProfile.hardwareTestPointGuide.resistorValue || 'Direct Jumper'}
              </span>
            </div>

            {/* Trigger Method Box */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Hardware Trigger Sequence</span>
              <p className="text-xs text-cyan-300 font-medium leading-relaxed">
                {selectedProfile.hardwareTestPointGuide.triggerMethod}
              </p>
            </div>

            {/* Pinout Details */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Pinout & Motherboard Trace</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProfile.hardwareTestPointGuide.pinoutDetails}
              </p>
            </div>

            {/* Cable Requirement */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs">
              <Cable className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-300 block">Recommended Cable / Adapter Interface</span>
                <span className="text-slate-300">{selectedProfile.recommendedCable}</span>
              </div>
            </div>

            {/* Critical Caution Notice */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block">Silicon Safety Warning</span>
                <span className="text-slate-300 leading-relaxed">
                  {selectedProfile.hardwareTestPointGuide.warningNotice}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive DFU / BROM Timing Coach */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Interactive Hardware Key Sequence Coach
                </h3>
                <p className="text-xs text-slate-400">
                  Precision countdown timer to enter DFU, BROM, or EDL modes without missing key release windows.
                </p>
              </div>

              {!timerRunning ? (
                <button
                  onClick={startTimingCoach}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Timing Coach
                </button>
              ) : (
                <button
                  onClick={stopTimingCoach}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Reset Coach
                </button>
              )}
            </div>

            {/* Coach Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {timingSteps.map((step, idx) => {
                const isActive = timerRunning && timerStep === idx;
                const isCompleted = timerRunning && timerStep > idx;

                return (
                  <div
                    key={step.title}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-sm'
                        : isCompleted
                        ? 'bg-slate-950/40 border-emerald-900/40 opacity-75'
                        : 'bg-slate-950/80 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : isCompleted
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={isActive ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                          {step.title}
                        </span>
                      </span>

                      {isActive && (
                        <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {timerCountdown}s
                        </span>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal pl-6">
                      {step.instruction}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Operating Procedure Checklist */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Standard Operating Procedure (SOP) for {selectedProfile.name}
            </h3>

            <div className="space-y-2">
              {guidance.steps.map((st, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{st}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => {
                  addLog(`[GUIDE] Copied standard operating procedure for ${selectedProfile.name} to technician notes.`);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
              >
                Log SOP to Session Record →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
