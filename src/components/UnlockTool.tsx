import React from 'react';
import { 
  Lock, 
  Unlock as UnlockIcon, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Zap,
  CheckCircle,
  Database
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const UnlockTool: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            {t('unlock')}
          </h2>
          <p className="text-xs text-slate-400">Security bypass and bootloader authorization suite</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700">
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'bl', label: 'Bootloader Unlock', icon: UnlockIcon, color: 'text-orange-400' },
          { id: 'frp', label: 'FRP / Google Lock', icon: ShieldCheck, color: 'text-cyan-400' },
          { id: 'id', label: 'Manufacturer ID Lock', icon: Lock, color: 'text-purple-400' },
          { id: 'sim', label: 'Network / SIM Unlock', icon: Database, color: 'text-emerald-400' },
          { id: 'mdm', label: 'MDM / Enterprise Lock', icon: Lock, color: 'text-rose-400' },
          { id: 'diag', label: 'Diag Mode Unlock', icon: Zap, color: 'text-yellow-400' },
        ].map((item) => (
          <button 
            key={item.id}
            className="flex flex-col items-center gap-3 p-6 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all hover:border-indigo-500/30 group"
          >
            <div className={`p-3 bg-slate-950 rounded-lg group-hover:scale-110 transition-transform ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-200">{item.label}</div>
            <div className="text-[10px] text-slate-500">Security Level 4 Bypass</div>
          </button>
        ))}
      </div>

      <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl">
        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Operation Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Handshaking with BootROM...</span>
            <span className="text-emerald-400">READY</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Checking Signature Auth...</span>
            <span className="text-emerald-400">PASSED</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Injecting Payload...</span>
            <span className="text-slate-600">IDLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
