import React, { useState } from 'react';
import { 
  Cpu, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Network
} from 'lucide-react';
import { ISimHardwareManager, ISimProfile } from '../services/isim-manager';
import { useI18n } from '../context/I18nContext';

export const ISimRepairSuite: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [isSyncing, setIsSyncing] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const isimManager = new ISimHardwareManager();

  const [activeProfile, setActiveProfile] = useState<ISimProfile>({
    eid: '89044000000000000000000000000001',
    iccid: '89860000000000000000',
    provider: 'Global Quantum Link 2028',
    status: 'Active'
  });

  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const handleRepairProfile = async () => {
    setIsSyncing(true);
    setSyncLogs([]);
    const res = await isimManager.repairProfile(activeProfile.eid, (step) => {
      setSyncLogs(prev => [...prev, step]);
    });
    if (res.success) {
      setRepairStatus('success');
      setActiveProfile(prev => ({ ...prev, status: 'Active' }));
    }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            {isRTL ? 'مدير أمان iSIM / eUICC' : 'iSIM / eUICC Hardware Security Manager'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRTL ? 'استعادة هوية iSIM وإدارة المنطقة الآمنة (GSMA SGP.32)' : 'Embedded SIM Profile Restoration & Secure Enclave Identity Management (GSMA SGP.32)'}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {isRTL ? 'مرتبط بالمنطقة الآمنة' : 'Secure Enclave Linked'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active iSIM Profile Details */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              {isRTL ? 'الهوية النشطة للعتاد' : 'Active Hardware Identity'}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeProfile.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isRTL ? 'الحالة:' : 'STATUS:'} {activeProfile.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">EID (Secure Node ID)</span>
              <span className="text-xs text-white font-mono break-all">{activeProfile.eid}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">ICCID (Subscription)</span>
              <span className="text-xs text-white font-mono">{activeProfile.iccid}</span>
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-4">
            <Globe className="w-8 h-8 text-indigo-400" />
            <div>
              <span className="text-[10px] text-indigo-300 block font-bold uppercase">{isRTL ? 'المزود المعتمد' : 'Provisioned Provider'}</span>
              <span className="text-sm text-white font-bold">{activeProfile.provider}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[100px]">
            <span className="text-[10px] text-slate-500 block font-bold mb-2 uppercase">Sync Status Logs</span>
            <div className="space-y-1 font-mono text-[10px]">
              {syncLogs.length === 0 ? (
                <span className="text-slate-700 italic">No sync in progress...</span>
              ) : (
                syncLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRepairProfile}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-emerald-400/30 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? (isRTL ? 'جاري المزامنة...' : 'Syncing GSMA Certs...') : (isRTL ? 'إصلاح ملف eUICC' : 'Repair eUICC Profile')}
            </button>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer">
              {isRTL ? 'تصدير الملف' : 'Export Profile'}
            </button>
          </div>
        </div>

        {/* GSMA / SAS-SM Server Status */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              {isRTL ? 'مركز بيانات GSMA' : 'GSMA Cloud Relay'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">SAS-SM Server:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isRTL ? 'متصل' : 'ONLINE'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Titan M3 Status:</span>
                <span className="text-white font-bold">{isRTL ? 'مقفل' : 'LOCKED'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">{isRTL ? 'إصدار الشهادة:' : 'Cert Version:'}</span>
                <span className="text-white">v4.1_2028</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-rose-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">{isRTL ? 'تحذير عتادي' : 'Hardware Warning'}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                {isRTL ? 'تعديل بيانات iSIM يتطلب تواجد مادي. جميع العمليات يتم تسجيلها في سجلات GSMA.' : 'Modifying iSIM data requires physical presence. All changes are logged to GSMA audit trail.'}
              </p>
            </div>
            <button className="w-full py-2 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold uppercase text-slate-400 cursor-pointer">
              {isRTL ? 'عرض سجلات التدقيق' : 'View Audit Logs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
