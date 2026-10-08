import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Terminal,
  Usb,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  Layers,
  Box
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

type ProtocolMode = 'MTK_BROM' | 'QUALCOMM_EDL' | 'SAMSUNG_DOWNLOAD' | 'APPLE_DFU' | 'UNISOC_DIAG';

export const UniversalHandshakeLab: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [activeProtocol, setActiveProtocol] = useState<ProtocolMode | null>(null);
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const startHandshake = (mode: ProtocolMode) => {
    setActiveProtocol(mode);
    setIsHandshaking(true);
    setLog([]);
    setProgress(0);
    
    const getSteps = (m: ProtocolMode) => {
      switch(m) {
        case 'QUALCOMM_EDL':
          return [
            'Scanning for Qualcomm HS-USB QDLoader 9008...',
            'Detected VID:05C6 PID:9008 on Bus 02 Hub 01',
            'Sending HELLO (0x01) packet to BootROM...',
            'Received ACK from PBL. HWID: 0x001F2028 Serial: 0x8891ABC0',
            'Negotiating Sahara Protocol v3.0...',
            'Injecting Firehose SBL (Secondary Bootloader) payload...',
            'SBL Memory Initialization (DDR Online)...',
            'Handshake Successful. Storage is now accessible via Firehose.'
          ];
        case 'MTK_BROM':
          return [
            'Waiting for MTK USB Port (Preloader/BROM)...',
            'BROM Handshake Established (0xA0 0x0A 0x50 0x05)',
            'Disabling Watchdog (0x10007000)...',
            'Sending Payload (DA_PL) via USB Bulk...',
            'SRAM Initialization (0x10000000)... OK',
            'Jumping to DA Start Address (0x40004000)...',
            'DRAM Initialization Complete. Ready for Flash.'
          ];
        case 'APPLE_DFU':
          return [
            'USB Endpoint 0x81 (DFU) detected.',
            'Requesting Device Information (GET_DESCRIPTOR)...',
            'Entering iBSS Upload State...',
            'Sending Apple Integrated Boot Software (iBSS)...',
            'iBSS Acknowledged. Re-mapping USB interfaces...',
            'Sending SEP Handshake (ML-KEM-1024)...',
            'Environment Ready. Bootrom Patching Active.'
          ];
        case 'SAMSUNG_DOWNLOAD':
          return [
            'Odin Protocol v4.0 Active.',
            'Sending PIT (Partition Information Table) Request...',
            'PIT Received (42 Partitions). Mapping logical addresses...',
            'Verifying Knox Warranty Bit status...',
            'Knox v5.0 Secure Vault Handshake... PASSED',
            'Device ready for PIT-based flashing.'
          ];
        case 'UNISOC_DIAG':
          return [
            'Scanning for Unisoc USB Serial (Diag/Download)...',
            'Sending Sync Signal (0x7E 0x00 0x7E)...',
            'Received ACK from SPD Bootrom.',
            'Loading FDL1 (First Download Loader)...',
            'Internal RAM Initialized.',
            'Loading FDL2 (External RAM/DRAM Loader)...',
            'Full System Access Established.'
          ];
        default:
          return ['Initializing universal probe...', 'Handshake complete.'];
      }
    };

    const steps = getSteps(mode);
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        addLog(steps[stepIndex]);
        stepIndex++;
        setProgress((stepIndex / steps.length) * 100);
      } else {
        clearInterval(interval);
        setIsHandshaking(false);
      }
    }, 600);
  };

  const protocols = [
    { id: 'MTK_BROM', name: t('mtkBrom'), color: 'bg-orange-600', icon: <Cpu className="w-5 h-5" /> },
    { id: 'QUALCOMM_EDL', name: t('qualcommEdl'), color: 'bg-blue-600', icon: <Cpu className="w-5 h-5" /> },
    { id: 'SAMSUNG_DOWNLOAD', name: t('samsungOdin'), color: 'bg-cyan-600', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'APPLE_DFU', name: t('appleDfu'), color: 'bg-slate-600', icon: <Usb className="w-5 h-5" /> },
    { id: 'UNISOC_DIAG', name: t('unisocDiag'), color: 'bg-emerald-600', icon: <Activity className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            {t('universalHandshake')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Multi-Architecture BootROM & Protocol Handshake Lab</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Protocol Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{t('workstationModules')}</h3>
          {protocols.map((proto) => (
            <button
              key={proto.id}
              onClick={() => startHandshake(proto.id as ProtocolMode)}
              disabled={isHandshaking}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                activeProtocol === proto.id 
                  ? `${proto.color} border-white/20 text-white shadow-lg` 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {proto.icon}
              <span className="font-bold text-xs">{proto.name}</span>
            </button>
          ))}
        </div>

        {/* Handshake Console */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-cyan-500" />
                <span className="text-xs font-mono font-bold text-slate-300">Quantum_Terminal_v5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isHandshaking ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] text-slate-500 font-mono uppercase">{isHandshaking ? 'Active' : 'Idle'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] custom-scrollbar">
              {log.length === 0 && <p className="text-slate-700 italic">Select a protocol to begin handshake...</p>}
              {log.map((entry, i) => (
                <div key={i} className={entry.includes('ready') || entry.includes('Established') ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                  {entry}
                </div>
              ))}
            </div>

            {isHandshaking && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-cyan-500">
                  <span>ESTABLISHING_LINK...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Background Decor */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/5 blur-3xl rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <button className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-cyan-500/50 transition-all group">
                <Unlock className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">{t('unlock')}</span>
             </button>
             <button className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-orange-500/50 transition-all group">
                <Database className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">{t('firmware')}</span>
             </button>
             <button className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-red-500/50 transition-all group">
                <AlertTriangle className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">{t('wipe')}</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
