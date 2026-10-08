import React, { useState } from 'react';
import { 
  Bot, 
  BrainCircuit, 
  Activity,
  Zap,
  ShieldCheck,
  Search,
  Sparkles,
  Layers
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { SmartDiagnostics } from '../SmartDiagnostics';
import { SentinelAIAgent } from '../SentinelAIAgent';
import { DigitalTwinViewer } from '../DigitalTwinViewer';
import { QuantumNanobotStudio } from '../QuantumNanobotStudio';

export const IntelligenceCenter: React.FC = () => {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'diag' | 'twin' | 'sentinel' | 'quantum'>('diag');

  const tabs = [
    { id: 'diag', label: t('aiDiag'), icon: BrainCircuit },
    { id: 'twin', label: '3D Digital Twin', icon: Layers },
    { id: 'sentinel', label: t('autonomousRepair'), icon: Bot },
    { id: 'quantum', label: 'Quantum Nanobots', icon: Sparkles },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-b border-slate-800/50">
        <div className="flex items-center gap-2 text-cyan-400 mr-4">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">{t('intelligenceCenter')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
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
        {activeSubTab === 'diag' && <SmartDiagnostics />}
        {activeSubTab === 'twin' && <DigitalTwinViewer />}
        {activeSubTab === 'sentinel' && <SentinelAIAgent />}
        {activeSubTab === 'quantum' && <QuantumNanobotStudio />}
      </div>
    </div>
  );
};
