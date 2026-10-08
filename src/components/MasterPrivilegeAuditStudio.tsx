import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Cpu, Lock, CheckCircle2, RefreshCw, Terminal, Sparkles } from 'lucide-react';
import { masterPrivilegeEngine, MasterPrivilegeProfile } from '../services/master-privilege-engine';
import { useI18n } from '../context/I18nContext';

export const MasterPrivilegeAuditStudio: React.FC = () => {
  const { t, isRTL } = useI18n();
  const [profile, setProfile] = useState<MasterPrivilegeProfile>(masterPrivilegeEngine.getProfile());
  const [auditResult, setAuditResult] = useState<{ allGreen: boolean; checks: { name: string; status: string }[] } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    const res = await masterPrivilegeEngine.auditInfrastructure();
    setAuditResult(res);
    setIsAuditing(false);
  };

  useEffect(() => {
    handleRunAudit();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-2xl border border-emerald-500/30 p-6 space-y-6 text-slate-200 shadow-[0_0_35px_rgba(16,185,129,0.15)] custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isRTL ? 'مدقق الصلاحيات والخدمات الرئيسية (Master Privilege & Audit Studio)' : 'Master Privilege & Infrastructure Audit Studio'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono">Level 5 Master</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? 'إدارة الصلاحيات العليا، شهادات EDL، وتدقيق البنية التحتية والخدمات بالكامل' : 'Absolute operator authorization, OEM auth tokens, and comprehensive service audit'}
            </p>
          </div>
        </div>

        <button
          disabled={isAuditing}
          onClick={handleRunAudit}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isRTL ? 'إعادة تدقيق النظام' : 'Run Full Audit'}</span>
        </button>
      </div>

      {/* Profile & Privileges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Operator ID & Auth</span>
          <div className="text-sm font-mono text-emerald-400 font-semibold">{profile.operatorId}</div>
          <div className="text-xs text-slate-300 font-bold">{profile.authorizationLevel}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">EDL & OEM Certificates</span>
          <div className="text-xs font-mono text-cyan-400 font-semibold">{profile.edlAuthCertificate}</div>
          <div className="text-xs text-emerald-400 font-semibold">{profile.oemTokenStatus}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Hardware Security Module</span>
          <div className="text-xs text-indigo-400 font-semibold">{profile.hardwareSecurityModule}</div>
          <div className="text-xs text-slate-400 font-mono">Active Services: {profile.activeServicesCount} Modules Online</div>
        </div>
      </div>

      {/* Audit Checklist */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>{isRTL ? 'نتائج تدقيق البنية التحتية والخدمات' : 'Infrastructure & Service Audit Results'}</span>
          </span>
          {auditResult?.allGreen && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Systems Verified & Secured</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditResult?.checks.map((check, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{check.name}</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono font-bold">
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
