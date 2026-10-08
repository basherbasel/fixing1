import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Database, 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle,
  FileCode,
  HardDrive,
  RefreshCw,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const SecureVaultManager: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [showSensitive, setShowSensitive] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isMounting, setIsMounting] = useState(false);
  const [mountedPart, setMountedPart] = useState<string | null>(null);

  const partitions = [
    { id: 'rpmb', name: 'RPMB (Replay Protected Memory Block)', size: '16.0 MB', status: 'Locked (HMAC)', risk: 'Extreme' },
    { id: 'efs', name: 'EFS (Encryption File System)', size: '32 MB', status: 'Mounted (R/O)', risk: 'Critical' },
    { id: 'sec', name: 'SEC_STORAGE', size: '128 KB', status: 'TEE_PROTECTED', risk: 'High' },
    { id: 'persist', name: 'PERSIST (Calibrations)', size: '16 MB', status: 'Accessible', risk: 'Medium' },
    { id: 'key', name: 'KEYSTORE_v3', size: '4.0 MB', status: 'Auth Required', risk: 'Critical' },
    { id: 'cfg', name: 'DEV_CFG (Fuses)', size: '4 KB', status: 'Read Only', risk: 'Critical' }
  ];

  const handleMount = async () => {
    setIsMounting(true);
    // Simulate TEE Auth Exchange
    await new Promise(r => setTimeout(r, 2000));
    setMountedPart('EFS');
    setIsMounting(false);
  };

  const handleDeepWipe = async () => {
    setIsWiping(true);
    // Deep block erasure
    await new Promise(r => setTimeout(r, 3000));
    setIsWiping(false);
    alert('Security partitions wiped. RPMB counter incremented.');
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 flex items-center gap-3">
            <Lock className="w-8 h-8 text-emerald-500" />
            {t('secureVault')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Deep Security Partition & RPMB Provisioning Lab</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowSensitive(!showSensitive)}
             className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:border-slate-700 transition-all"
           >
             {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             {showSensitive ? 'Hide Keys' : 'Show Keys'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Partition Explorer */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Database className="w-4 h-4 text-emerald-500" />
               Security Partitions
             </h3>
             <span className="text-[10px] text-slate-500">UFS_PROVISIONING_v2.1</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {partitions.map((part, i) => (
              <div key={i} className="group bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 hover:border-emerald-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-950 rounded-xl text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <HardDrive className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-200">{part.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                         <span className="text-slate-500">Size: {part.size}</span>
                         <span className={`flex items-center gap-1 ${
                           mountedPart === part.id ? 'text-emerald-400' :
                           part.status === 'Locked' ? 'text-orange-400' : 'text-slate-500'
                         }`}>
                           {part.status === 'Locked' ? <Lock className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                           {mountedPart === part.id ? 'Mounted (R/W)' : part.status}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                     part.risk === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                     part.risk === 'High' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                   }`}>
                     {part.risk} Risk
                   </span>
                   <button className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/50 transition-colors">
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex gap-4">
             <button 
               onClick={handleMount}
               disabled={isMounting}
               className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
             >
                <Unlock className={`w-4 h-4 ${isMounting ? 'animate-spin' : ''}`} />
                {isMounting ? 'Authenticating TEE...' : 'Mount for Write'}
             </button>
             <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all border border-slate-700">
                <FileCode className="w-4 h-4" />
                Dump Binary
             </button>
          </div>
        </div>

        {/* Security Summary & Tools */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-900/10 border border-emerald-500/20 p-6 rounded-3xl">
             <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Security Overview</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500">Knox / TEE Status</span>
                   <span className="text-green-400 font-mono">0x0 (Untriggered)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500">Bootloader Unlock</span>
                   <span className="text-red-400 font-mono">Allowed (Warning)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500">RPMB Counter</span>
                   <span className="text-slate-300 font-mono">4,129 WRITES</span>
                </div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex justify-between items-center text-xs font-bold">
                   <span className="text-slate-300">Integrity Score</span>
                   <span className="text-emerald-400">92/100</span>
                </div>
             </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
             <div className="flex items-center gap-3 text-red-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase">Danger Zone</h4>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed">
               Modifying security partitions can cause permanent hardware failure (Hard Brick) if the signature check fails. Always perform a binary dump before proceeding.
             </p>
             <button 
               className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
               onClick={handleDeepWipe}
               disabled={isWiping}
             >
                <Zap className={`w-4 h-4 ${isWiping ? 'animate-pulse' : ''}`} />
                {t('deepWipe')} {isWiping ? '(Erasing Blocks...)' : '(One-Click Exec)'}
             </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                Auth Key Management
             </h3>
             <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                   <span className="text-[10px] text-slate-500 block mb-1">RSA PUBLIC KEY</span>
                   <code className="text-[10px] text-indigo-400 break-all font-mono">
                     {showSensitive ? '49c8-f2a1-b903-e881-d212-9c01-f3b4' : '••••-••••-••••-••••-••••-••••-••••'}
                   </code>
                </div>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all">
                  GENERATE AUTH CHALLENGE
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
