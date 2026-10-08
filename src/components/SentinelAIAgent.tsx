import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Search, 
  MessageSquare,
  Bot,
  Activity,
  ChevronRight,
  Code2,
  Sparkles,
  Command
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export const SentinelAIAgent: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [messages, setMessages] = useState<{role: 'assistant' | 'system' | 'user', text: string}[]>([
    { role: 'system', text: 'Sentinel AI Online. Analyzing device telemetry...' },
    { role: 'assistant', text: 'Hardware profile identified: SM-G991B (Exynos 2100). Current status: Stuck in Bootloop (0.2A constant draw). Suggesting Initial Diagnostic Suite.' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Analyzing your request... Based on the EFS partition signature, it seems the NV data is corrupted. I recommend running "Patch Certificate" via the PQC engine to restore radio connectivity.' 
      }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* AI Chat Interface */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Bot className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t('sentinelAI')}</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-500 font-mono">NEURAL_ENGINE_ACTIVE v2.0.4</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">98.4% Confidence</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                  : msg.role === 'system'
                  ? 'bg-slate-950/50 border border-slate-800 text-slate-500 text-xs font-mono py-2 rounded-lg'
                  : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700 shadow-xl'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Insight
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="relative">
            <input 
              type="text"
              placeholder="Ask Sentinel to diagnose or execute commands..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-5 pr-14 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all"
            >
              <Command className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Actions / Telemetry Stats */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900/20 border border-indigo-500/20 p-6 rounded-3xl h-full flex flex-col">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Autonomous Pipeline
          </h3>
          
          <div className="space-y-4 flex-1">
            {[
              { title: 'Force BootROM Entry', desc: 'Auto-detecting TP locations...', status: 'Ready' },
              { title: 'Bypass Auth v4', desc: 'Injecting custom DA via USB4...', status: 'Pending' },
              { title: 'Restore Security Data', desc: 'Syncing with cloud vault...', status: 'Pending' }
            ].map((step, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl group-hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{step.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      step.status === 'Ready' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'
                    }`}>{step.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 transition-all">
            <Zap className="w-5 h-5" />
            {t('autonomousFix')}
          </button>
        </div>
      </div>
    </div>
  );
};
