import React, { useState } from 'react';
import { 
  Lock, 
  Wifi, 
  Zap, 
  ShieldCheck,
  Globe,
  Database,
  Activity
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { SecureVaultManager } from '../SecureVaultManager';
import { QuantumNetworkLab } from '../QuantumNetworkLab';
import { UniversalHandshakeLab } from '../UniversalHandshakeLab';
import { ISimRepairSuite } from '../ISimRepairSuite';
import { PQCSecuritySuite } from '../PQCSecuritySuite';
import { SecurityArchitectureAuditSuite } from '../SecurityArchitectureAuditSuite';
import { UniversalLockBypassSuite } from '../UniversalLockBypassSuite';
import { Unlock } from 'lucide-react';

export const SecurityNetworkCenter: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'bypass' | 'vault' | 'network' | 'handshake' | 'isim' | 'pqc' | 'audit'>('bypass');

  const tabs = [
    { id: 'bypass', label: isRTL ? 'فك وتخطي الحمايات' : 'Lock & FRP Bypass', icon: Unlock },
    { id: 'vault', label: t('secureVault'), icon: Lock },
    { id: 'pqc', label: 'Post-Quantum', icon: ShieldCheck },
    { id: 'isim', label: 'iSIM Security', icon: Database },
    { id: 'network', label: t('rfCalibration'), icon: Wifi },
    { id: 'handshake', label: t('universalHandshake'), icon: Zap },
    { id: 'audit', label: 'Security Audit', icon: Activity },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800/50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 text-emerald-400 mr-4 shrink-0">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('securityNetworkCenter')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeSubTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300 border border-transparent'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {activeSubTab === 'bypass' && <UniversalLockBypassSuite />}
        {activeSubTab === 'vault' && <SecureVaultManager />}
        {activeSubTab === 'pqc' && <PQCSecuritySuite />}
        {activeSubTab === 'isim' && <ISimRepairSuite />}
        {activeSubTab === 'network' && <QuantumNetworkLab />}
        {activeSubTab === 'handshake' && <UniversalHandshakeLab />}
        {activeSubTab === 'audit' && <SecurityArchitectureAuditSuite />}
      </div>
    </div>
  );
};
