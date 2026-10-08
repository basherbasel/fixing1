import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Cpu, 
  Lock, 
  Unlock, 
  RefreshCw,
  Fingerprint,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import { PostQuantumSecuritySuite, PQCSignature } from '../services/pqc-crypto';

export const PQCSecuritySuite: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);
  const [keyPair, setKeyPair] = useState<{ pk: string, sk: string } | null>(null);

  const pqcSuite = new PostQuantumSecuritySuite();

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    // Simulate complex lattice-based key gen
    await new Promise(r => setTimeout(r, 2500));
    setKeyPair({
      pk: 'PQC_LATTICE_PK_V1_7A92...82F1',
      sk: 'PQC_LATTICE_SK_V1_••••...••••'
    });
    setIsGenerating(false);
  };

  const handleVerifyPQC = async () => {
    setIsVerifying(true);
    const mockPayload = new Uint8Array([0x7F, 0x45, 0x4C, 0x46]);
    const mockSig: PQCSignature = {
      rawBytes: new Uint8Array(2420),
      algorithm: 'ML-DSA-65',
      timestamp: Date.now()
    };

    const isValid = await pqcSuite.verifyLatticeSignature(mockPayload, mockSig);
    setResult(isValid ? 'valid' : 'invalid');
    setIsVerifying(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-400" />
            Post-Quantum Cryptography (PQC) Security Suite
          </h2>
          <p className="text-xs text-slate-400">
            Next-Gen Lattice-Based Hardware Attestation & Zero-Knowledge OEM Authentication
          </p>
        </div>
        <div className="flex gap-2 text-[10px] uppercase font-bold px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full">
          NIST FIPS 203/204 Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attestation Status */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              Lattice-Based Hardware Attestation
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result === 'valid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {result === 'valid' ? 'VERIFIED' : 'AWAITING SCAN'}
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Bootloader Signature Algorithm:</span>
              <span className="text-purple-400 font-mono font-bold">ML-DSA-65 (Dilithium)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Secure Enclave Standard:</span>
              <span className="text-white font-mono">PQC-Titan-M3 Revision 4</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Quantum Threat Resistance:</span>
              <span className="text-emerald-400 font-bold uppercase">Active (Lvl 4)</span>
            </div>
          </div>

          <button
            onClick={handleVerifyPQC}
            disabled={isVerifying}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg border border-purple-400/30"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Validating Quantum Signatures...' : 'Verify PQC Silicon Chain of Trust'}
          </button>
        </div>

        {/* ZKP Authentication Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              Lattice Key Management
            </h3>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
               <div>
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Public Key (ML-DSA)</span>
                  <code className="text-[10px] text-purple-400 font-mono truncate block">
                    {keyPair ? keyPair.pk : 'AWAITING GENERATION'}
                  </code>
               </div>
               {keyPair && (
                 <div>
                    <span className="text-[9px] text-slate-500 block font-bold uppercase">Secret Key (Encrypted)</span>
                    <code className="text-[10px] text-slate-600 font-mono truncate block">{keyPair.sk}</code>
                 </div>
               )}
            </div>
            <button 
              onClick={handleGenerateKeys}
              disabled={isGenerating}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Rotating Lattice...' : 'Generate New PQC Pair'}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Zero-Knowledge (ZKP) Auth
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authenticate with OEM cloud servers (Xiaomi/Samsung) without exposing device identifiers or private tokens.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">ZKP Challenge</span>
              <span className="text-[10px] text-cyan-400 font-mono break-all italic">f8a2-9d3c-1b7e-4f0e...</span>
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700 transition-all">
              Request OEM Auth Token
            </button>
          </div>
        </div>
      </div>

      {/* Security Alert Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">PQC Guard - Real-time Intrusion Monitor</h3>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="p-4 font-mono text-[10px] space-y-2">
          <div className="flex gap-3 text-slate-500">
            <span>[20:41:02]</span>
            <span className="text-emerald-400">[PQC-INF]</span>
            <span>Kernel signature validation successful via ML-DSA core.</span>
          </div>
          <div className="flex gap-3 text-slate-500">
            <span>[20:41:05]</span>
            <span className="text-purple-400">[PQC-INF]</span>
            <span>Handshaking with Secure Enclave v4. Root of Trust established.</span>
          </div>
          <div className="flex gap-3 text-slate-500">
            <span>[20:41:10]</span>
            <span className="text-amber-400">[PQC-WAR]</span>
            <span>Detected legacy RSA signature attempt. Blocking as per 2028 Silicon Policy.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
