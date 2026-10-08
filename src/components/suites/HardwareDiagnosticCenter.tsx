import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  Waves, 
  Search,
  Activity,
  Layers,
  Cpu,
  HardDrive
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { NeuralThermalVision } from '../NeuralThermalVision';
import { BoardSchematicExplorer } from '../BoardSchematicExplorer';
import { BusLogicAnalyzer } from '../BusLogicAnalyzer';
import { ISPPinoutViewer } from '../ISPPinoutViewer';
import { HardwareTelemetryPanel } from '../HardwareTelemetryPanel';

interface HardwareDiagnosticCenterProps {
  isConnected: boolean;
  connectionType: string;
  adbDriver: any;
  onLog: (msg: string) => void;
  batteryVoltageMv?: string;
}

export const HardwareDiagnosticCenter: React.FC<HardwareDiagnosticCenterProps> = ({
  isConnected,
  connectionType,
  adbDriver,
  onLog,
  batteryVoltageMv
}) => {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'thermal' | 'board' | 'logic' | 'isp' | 'telemetry' | 'storage'>('thermal');

  const tabs = [
    { id: 'thermal', label: t('thermalVision'), icon: Flame },
    { id: 'board', label: t('boardSchematic'), icon: MapPin },
    { id: 'logic', label: t('logicAnalyzer'), icon: Waves },
    { id: 'isp', label: t('pinouts'), icon: Search },
    { id: 'telemetry', label: t('telemetry'), icon: Activity },
    { id: 'storage', label: t('storage'), icon: HardDrive },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800/50 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 text-orange-400 mr-4 shrink-0">
          <Cpu className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('hardwareDiagnosticCenter')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeSubTab === tab.id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
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
        {activeSubTab === 'thermal' && <NeuralThermalVision />}
        {activeSubTab === 'board' && <BoardSchematicExplorer onLog={onLog} />}
        {activeSubTab === 'logic' && <BusLogicAnalyzer />}
        {activeSubTab === 'isp' && <ISPPinoutViewer />}
        {activeSubTab === 'telemetry' && (
          <HardwareTelemetryPanel 
            isConnected={isConnected}
            connectionType={connectionType}
            adbDriver={adbDriver}
            onLog={onLog}
            batteryVoltageMv={batteryVoltageMv}
          />
        )}
        {activeSubTab === 'storage' && (
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-inner">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              {t('storageHealth')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Advanced UFS/eMMC Lifecycle & Wear-Leveling Analysis</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Health Score</div>
                  <div className="text-2xl font-black text-emerald-400">98%</div>
               </div>
               <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</div>
                  <div className="text-2xl font-black text-cyan-400">EXCELLENT</div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
