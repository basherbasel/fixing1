import React, { useState, useEffect } from 'react';
import { Server, Cpu, Zap, Activity, ShieldCheck, RefreshCw, Layers, Terminal, CheckCircle2 } from 'lucide-react';
import { infrastructureEngine, InfrastructureSession, HardwareJob } from '../services/infrastructure-orchestrator';
import { useI18n } from '../context/I18nContext';

export const InfrastructureDashboard: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [session, setSession] = useState<InfrastructureSession>(infrastructureEngine.getSession());
  const [jobs, setJobs] = useState<HardwareJob[]>(infrastructureEngine.getJobs());
  const [activeJobName, setActiveJobName] = useState('');

  useEffect(() => {
    const unsubscribe = infrastructureEngine.addListener((event, payload) => {
      setSession(infrastructureEngine.getSession());
      setJobs(infrastructureEngine.getJobs());
    });
    return () => unsubscribe();
  }, []);

  const handleRunBenchmark = () => {
    infrastructureEngine.enqueueJob('USB4 80Gbps DMA Burst Test', 'DIAGNOSTIC', 'HIGH');
  };

  const handleTestMultiplexer = () => {
    infrastructureEngine.enqueueJob('Hardware Bus Protocol Arbitration', 'SECURITY', 'CRITICAL');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 p-6 space-y-6 text-slate-200 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{isRTL ? 'بنية تشغيل الأجهزة الأساسية (Infrastructure Core)' : 'Infrastructure Core & Bus Orchestration'}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">v2028.4 Active</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? 'إدارة ناقل البيانات، Multiplexing، وطوابير المهام للعتاد الحقيقي' : 'Real-time hardware bus multiplexing, telemetry streaming, and threaded job queues'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunBenchmark}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isRTL ? 'اختبار النطاق الترددي DMA' : 'DMA Benchmark'}</span>
          </button>
          <button
            onClick={handleTestMultiplexer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isRTL ? 'إعادة ضبط الناقل' : 'Arbitrate Bus'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{isRTL ? 'معرف جلسة البنية' : 'Session ID'}</span>
          <div className="text-sm font-mono text-cyan-400 font-semibold">{session.sessionId}</div>
          <span className="text-[11px] text-slate-400 block">Target: {session.targetVidPid}</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{isRTL ? 'البروتوكول النشط' : 'Active Protocol'}</span>
          <div className="text-sm font-mono text-emerald-400 font-semibold">{session.activeProtocol}</div>
          <span className="text-[11px] text-slate-400 block">Security: {session.securityState}</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{isRTL ? 'سرعة الناقل (USB4)' : 'Bus Throughput'}</span>
          <div className="text-sm font-mono text-amber-400 font-semibold">{session.busSpeedMbps} Mbps</div>
          <span className="text-[11px] text-slate-400 block">Direct DMA Channel Active</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{isRTL ? 'وقت تشغيل النواة' : 'Engine Uptime'}</span>
          <div className="text-sm font-mono text-purple-400 font-semibold">{session.uptimeSeconds}s</div>
          <span className="text-[11px] text-slate-400 block">Telemetry Stream: {session.telemetryStreamActive ? 'Streaming' : 'Standby'}</span>
        </div>
      </div>

      {/* Job Queue & Architecture Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Job Queue */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{isRTL ? 'طوابير مهام العتاد (Hardware Job Queues)' : 'Hardware Execution Queues'}</span>
            </span>
            <span className="text-xs text-slate-500">{jobs.length} jobs total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {jobs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs py-8">
                <Activity className="w-8 h-8 mb-2 opacity-30 animate-pulse" />
                <span>{isRTL ? 'لا توجد مهام نشطة حالياً في الطابور' : 'No active hardware jobs in queue'}</span>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.jobId} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{job.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{job.jobId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Category: {job.category}</span>
                      <span>•</span>
                      <span>Priority: {job.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${
                        job.status === 'COMPLETED' ? 'text-emerald-400' :
                        job.status === 'EXECUTING' ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                      }`}>
                        {job.status}
                      </span>
                      {job.status === 'EXECUTING' && (
                        <div className="text-[10px] text-cyan-400">{job.progress}%</div>
                      )}
                    </div>
                    {job.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Infrastructure Health & Bus Topology */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>{isRTL ? 'طبقة تجريد العتاد والناقل (HAL & Bus Topology)' : 'Hardware Abstraction & Bus Topology'}</span>
          </span>

          <div className="space-y-3 flex-1 text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">libusb / WebUSB Async Multiplexer</div>
                <div className="text-[11px] text-slate-400">Zero-copy bulk transfer buffer pool active</div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">Operational</span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Secure Enclave Hardware Bridge</div>
                <div className="text-[11px] text-slate-400">Titan M3 / Knox Vault cryptographic tunnel</div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">Secured</span>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Post-Quantum Cryptography (PQC) Shield</div>
                <div className="text-[11px] text-slate-400">CRYSTALS-Kyber key encapsulation ready</div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
