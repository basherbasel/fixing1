import React, { useState } from 'react';
import { 
  Wifi, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Globe, 
  Lock, 
  Unlock, 
  RefreshCw,
  Cpu,
  Radio,
  Signal,
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const QuantumNetworkLab: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [imei, setImei] = useState('358921104432190');

  const [spectrumData, setSpectrumData] = useState<number[]>(Array.from({ length: 40 }, () => 20 + Math.random() * 60));

  const runRepair = (type: string) => {
    setIsProcessing(true);
    
    // Simulate spectrum changes during repair
    const specInterval = setInterval(() => {
      setSpectrumData(Array.from({ length: 40 }, () => 20 + Math.random() * 60));
    }, 200);

    const getSteps = (t: string) => {
      if (t === 'IMEI') return [
        'Backing up existing NVRAM blocks (0x0000 to 0x1000)...',
        'Calculating SHA-256 hash of SEC_CERT...',
        'Decrypting EFS partition using hardware-backed keys...',
        'Patching IMEI logical address in NV_DATA...',
        'Re-signing certificate with PQC (ML-DSA) algorithm...',
        'Injecting patched EFS. System reboot recommended.'
      ];
      if (t === 'BASEBAND') return [
        'Querying Baseband Firmware Version...',
        'Detected mismatch between Kernel and Modem DSP...',
        'Synchronizing NV_RF_CAL data structures...',
        'Rebuilding Modem Bootloader image...',
        'Applying Baseband Firmware Patch v5.8...',
        'Modem integrity check: PASSED'
      ];
      if (t === 'UNLOCK') return [
        'Initializing Carrier Unlock Protocol (CUP)...',
        'Requesting Auth Token from GSMA SAS-SM...',
        'Bypassing SIM_LOCK fuse register (0x04A2)...',
        'Injecting global regulatory config...',
        'Network unlock successful. All bands active.'
      ];
      return [
        'Reading RF Configuration...',
        'Bypassing HWID Security...',
        'Applying Global Patch...',
        'Operation Successful.'
      ];
    };

    const steps = getSteps(type);
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setCurrentStep(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        clearInterval(specInterval);
        setIsProcessing(false);
        setCurrentStep('');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center gap-3">
            <Radio className="w-8 h-8 text-blue-500" />
            {t('rfCalibration')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Deep Baseband, iSIM & RF Spectrum Engineering Lab</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RF Status */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('telemetry')}</h3>
            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Baseband Version', value: 'MPSS.HI.2.0.c2-00432', icon: <Cpu className="w-4 h-4" /> },
              { label: 'SIM 1 Status', value: 'Ready (5G/6G)', icon: <CreditCard className="w-4 h-4" /> },
              { label: 'IMEI Certificate', value: 'Verified', icon: <ShieldCheck className="w-4 h-4 text-green-400" /> },
              { label: 'RF Latency', value: '2.4ms', icon: <Activity className="w-4 h-4" /> }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg text-slate-400">{stat.icon}</div>
                  <span className="text-[10px] text-slate-500 font-bold">{stat.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-300">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
             <label className="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-tighter">Target IMEI / ID</label>
             <input 
               type="text" 
               value={imei}
               onChange={(e) => setImei(e.target.value)}
               className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs font-mono text-cyan-500 focus:outline-none focus:border-cyan-500/50 transition-all"
             />
          </div>
        </div>

        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
               onClick={() => runRepair('IMEI')}
               disabled={isProcessing}
               className="group bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl flex flex-col gap-4 text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
             >
                <RefreshCw className={`w-8 h-8 ${isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                <div className="text-left">
                  <h4 className="font-bold text-sm">{t('rebuildImei')}</h4>
                  <p className="text-[10px] opacity-70 mt-1">Full NVRAM certificate and IMEI structural repair</p>
                </div>
             </button>

             <button 
               onClick={() => runRepair('BASEBAND')}
               disabled={isProcessing}
               className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 text-white hover:border-blue-500/50 transition-all shadow-xl disabled:opacity-50"
             >
                <Zap className="w-8 h-8 text-yellow-400 group-hover:animate-pulse" />
                <div className="text-left">
                  <h4 className="font-bold text-sm">{t('fixBaseband')}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Fix baseband unknown issues and firmware mismatch</p>
                </div>
             </button>

             <button 
               onClick={() => runRepair('UNLOCK')}
               disabled={isProcessing}
               className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 text-white hover:border-cyan-500/50 transition-all shadow-xl disabled:opacity-50"
             >
                <Unlock className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <h4 className="font-bold text-sm">{t('unlockNetwork')}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Permanent carrier unlock via deep diag protocol</p>
                </div>
             </button>

             <button 
               onClick={() => runRepair('WIPE')}
               disabled={isProcessing}
               className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 text-white hover:border-red-500/50 transition-all shadow-xl disabled:opacity-50"
             >
                <Radio className="w-8 h-8 text-red-500 group-hover:animate-ping" />
                <div className="text-left">
                  <h4 className="font-bold text-sm">{t('deepWipe')}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Erase security partitions and restore factory defaults</p>
                </div>
             </button>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-slate-950 border border-blue-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Processing Quantum Patch...</h4>
                    <span className="text-[10px] font-mono text-blue-400">STATUS: ACTIVE</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-progress shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: '60%' }} />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-3">{currentStep}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Signal className="w-4 h-4 text-indigo-400" />
                  RF Spectrum Lab (Sub-THz / mmWave)
                </h4>
                <div className="flex gap-2 text-[9px] font-mono text-slate-500">
                   <span>92.4 GHz</span>
                   <span>142.1 GHz</span>
                </div>
             </div>
             <div className="h-24 flex items-end gap-1 px-2">
                {spectrumData.map((val, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-t-sm transition-all duration-300 ${
                      isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gradient-to-t from-indigo-900 to-indigo-500'
                    }`}
                    style={{ 
                      height: `${val}%`,
                    }}
                  />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
