import React, { useState } from 'react';
import { 
  Unlock, 
  Zap, 
  Cpu, 
  HardDrive,
  Activity,
  Layers,
  ChevronRight,
  Database,
  Info,
  Download
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { UnlockTool } from '../UnlockTool';
import { PartitionFlashingManager as FlashingPro } from '../PartitionFlashingManager';
import { NvramRepairDashboard as IMEIRepair } from '../NvramRepairDashboard';
import { PartitionFileExplorer } from '../PartitionFileExplorer';
import { PartitionBackupManager } from '../PartitionBackupManager';
import { FirmwarePackageInspector } from '../FirmwarePackageInspector';
import { UltraFlashingManager } from '../UltraFlashingManager';
import { NvramRepairDashboard } from '../NvramRepairDashboard';

interface SoftwareControlCenterProps {
  isConnected: boolean;
  connectionType: string;
  fastbootDriver: any;
  adbDriver: any;
  fastbootVars: Record<string, string>;
  onLog: (msg: string) => void;
  onFlash: (partition: string, fileBytes: Uint8Array, fileName: string) => Promise<void>;
}

export const SoftwareControlCenter: React.FC<SoftwareControlCenterProps> = ({
  isConnected,
  connectionType,
  fastbootDriver,
  adbDriver,
  fastbootVars,
  onLog,
  onFlash
}) => {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'unlock' | 'flash' | 'imei' | 'partitions' | 'backup' | 'firmware' | 'ultra' | 'nvram'>('unlock');

  const tabs = [
    { id: 'unlock', label: t('unlock'), icon: Unlock },
    { id: 'flash', label: t('flasher'), icon: Zap },
    { id: 'ultra', label: t('ultraFlash'), icon: Download },
    { id: 'imei', label: t('rebuildImei'), icon: Cpu },
    { id: 'nvram', label: t('nvram'), icon: Database },
    { id: 'partitions', label: t('forensics'), icon: HardDrive },
    { id: 'backup', label: t('backup'), icon: Layers },
    { id: 'firmware', label: t('firmware'), icon: Info },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800/50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 text-indigo-400 mr-4 shrink-0">
          <Layers className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('softwareControlCenter')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeSubTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
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
        {activeSubTab === 'unlock' && <UnlockTool />}
        {activeSubTab === 'flash' && (
          <FlashingPro 
            isConnected={isConnected && connectionType === 'WebUSB Fastboot'}
            isUnlocked={fastbootVars['unlocked'] === 'yes'}
            onFlash={onFlash}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'ultra' && (
          <UltraFlashingManager 
            isConnected={isConnected}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'imei' && (
          <IMEIRepair 
            isConnected={isConnected}
            connectionType={connectionType}
            adbDriver={adbDriver}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'nvram' && (
          <NvramRepairDashboard 
            isConnected={isConnected}
            connectionType={connectionType}
            adbDriver={adbDriver}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'partitions' && (
          <PartitionFileExplorer 
            isConnected={isConnected}
            adbDriver={adbDriver}
            onLog={onLog}
          />
        )}
        {activeSubTab === 'backup' && (
          <PartitionBackupManager 
            isConnected={isConnected}
            connectionType={connectionType}
            adbDriver={adbDriver}
            activeSlot={fastbootVars['current-slot'] || 'a'}
            onLog={onLog}
            onSendCommand={async (cmd) => {
              if (connectionType === 'WebUSB Fastboot') {
                const res = await fastbootDriver.current.sendCommand(cmd);
                onLog(`[RECV] ${res || 'OKAY'}`);
              }
            }}
          />
        )}
        {activeSubTab === 'firmware' && <FirmwarePackageInspector onLog={onLog} />}
      </div>
    </div>
  );
};
