import React, { useState } from 'react';
import { 
  Box, 
  Wrench, 
  RefreshCw,
  Cpu,
  Activity,
  Layers,
  Settings
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { AdvancedServiceSuite } from '../AdvancedServiceSuite';
import { OSDeepRepairSuite } from '../OSDeepRepairSuite';
import { CppEngineTerminal } from '../CppEngineTerminal';
import { Terminal } from 'lucide-react';

interface SystemRepairCenterProps {
  isConnected: boolean;
  connectionType: string;
  adbDriver: any;
  fastbootDriver: any;
  onLog: (msg: string) => void;
}

export const SystemRepairCenter: React.FC<SystemRepairCenterProps> = ({
  isConnected,
  connectionType,
  adbDriver,
  fastbootDriver,
  onLog
}) => {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'service' | 'os' | 'engine'>('service');

  const tabs = [
    { id: 'service', label: t('services'), icon: Wrench },
    { id: 'os', label: t('osDeepRepair'), icon: Box },
    { id: 'engine', label: 'Engine Runtime', icon: Terminal },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800/50">
        <div className="flex items-center gap-2 text-blue-400 mr-4">
          <Settings className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('systemRepairCenter')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
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
        {activeSubTab === 'service' && (
          <AdvancedServiceSuite 
            isConnected={isConnected}
            connectionType={connectionType}
            adbDriver={adbDriver}
            fastbootDriver={fastbootDriver}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'os' && <OSDeepRepairSuite />}
        {activeSubTab === 'engine' && <CppEngineTerminal />}
      </div>
    </div>
  );
};
