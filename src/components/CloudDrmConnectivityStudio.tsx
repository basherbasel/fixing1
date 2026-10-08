import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Cpu, HardDrive, Wifi, Bluetooth, Usb, Key, Lock, Terminal, 
  RefreshCw, CheckCircle2, AlertTriangle, Zap, Server, MemoryStick, Radio, 
  Activity, Globe, Layers, ArrowUpRight, Copy, Check
} from 'lucide-react';
import { 
  cloudDrmConnectivityEngine, 
  HWIDProfile, 
  DynamicMemoryBuffer, 
  AuthJWTToken, 
  DriverStackStatus 
} from '../services/cloud-drm-connectivity-engine';
import { useI18n } from '../context/I18nContext';

export const CloudDrmConnectivityStudio: React.FC<{
  onLog?: (msg: string) => void;
}> = ({ onLog }) => {
  const { isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<'architecture' | 'hwid' | 'ram-exec' | 'jwt-auth'>('architecture');

  // HWID State
  const [hwidProfile, setHwidProfile] = useState<HWIDProfile>(cloudDrmConnectivityEngine.getHWIDProfile());
  const [mbUuid, setMbUuid] = useState('MB-UUID-8849-2028-NX9');
  const [cpuId, setCpuId] = useState('GenuineIntel-x86_64-i9-14900KS-3.2GHz');
  const [diskSerial, setDiskSerial] = useState('NVME-SAMSUNG-990PRO-2TB-99120');
  const [macAddr, setMacAddr] = useState('70:F8:E7:A1:B2:C3');
  const [calculatedHwid, setCalculatedHwid] = useState(hwidProfile.hwid);
  const [copiedHwid, setCopiedHwid] = useState(false);

  // Driver Stack Status
  const [driverStack] = useState<DriverStackStatus>(cloudDrmConnectivityEngine.getDriverStackStatus());

  // RAM Execution State
  const [selectedChipset, setSelectedChipset] = useState<DynamicMemoryBuffer['targetChipset']>('Qualcomm Snapdragon Firehose');
  const [ramBuffers, setRamBuffers] = useState<DynamicMemoryBuffer[]>([]);
  const [isFetchingProgrammer, setIsFetchingProgrammer] = useState(false);

  // JWT Auth Token State
  const [selectedIssuer, setSelectedIssuer] = useState<AuthJWTToken['issuer']>('Xiaomi Cloud Auth');
  const [selectedScope, setSelectedScope] = useState('EDL_FLASH_PERMISSION_RSA2048');
  const [activeTokens, setActiveTokens] = useState<AuthJWTToken[]>([]);
  const [isRequestingToken, setIsRequestingToken] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);

  const addStudioLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    if (onLog) onLog(msg);
  };

  const handleRecalculateHWID = async () => {
    addStudioLog('[HWID-ENGINE] Recalculating hardware fingerprint hash via SHA-256...');
    const hash = await cloudDrmConnectivityEngine.calculateHWID(mbUuid, cpuId, diskSerial, macAddr);
    setCalculatedHwid(hash);
    addStudioLog(`[HWID-RESULT] Hash Generated: ${hash}`);
  };

  const handleFetchRAMProgrammer = async () => {
    setIsFetchingProgrammer(true);
    addStudioLog(`[DYNAMIC-RAM] Requesting cloud-encrypted ${selectedChipset} programmer...`);

    const buffer = await cloudDrmConnectivityEngine.loadInRamProgrammer(selectedChipset, (msg) => addStudioLog(msg));
    setRamBuffers(prev => [buffer, ...prev]);
    setIsFetchingProgrammer(false);
  };

  const handleRequestJWT = async () => {
    setIsRequestingToken(true);
    addStudioLog(`[JWT-AUTH] Requesting short-lived authorization token from ${selectedIssuer}...`);

    await new Promise(r => setTimeout(r, 700));
    const token = await cloudDrmConnectivityEngine.requestAuthJWT(selectedIssuer, selectedScope);
    setActiveTokens(prev => [token, ...prev]);
    addStudioLog(`[JWT-SUCCESS] Issued 15s token for ${selectedIssuer} [Scope: ${selectedScope}]`);
    setIsRequestingToken(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Server className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isRTL ? 'معمارية الاتصال المحلي والبنية الأمنية السحابية (Dongleless Cloud DRM & Driver Stack)' : 'Dongleless Cloud DRM & Driver Stack Studio'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                CLOUD DRM 2028
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'منصة صيانة وتفليش الهواتف بدون عتاد فيزيائي اعتماداً على قدرات الكمبيوتر والبنية السحابية المتقدمة' : 'Cloud-based mobile flashing & diagnostics using PC hardware drivers + AES-256-GCM RAM DRM'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'معمارية العتاد والتعريفات' : 'Driver Architecture'}
          </button>
          <button
            onClick={() => setActiveTab('hwid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hwid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'بصمة الجهاز (HWID Lock)' : 'HWID Lock Engine'}
          </button>
          <button
            onClick={() => setActiveTab('ram-exec')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ram-exec' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'التنفيذ بالذاكرة (In-RAM DA)' : 'In-RAM Execution'}
          </button>
          <button
            onClick={() => setActiveTab('jwt-auth')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'jwt-auth' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRTL ? 'المصادقة المؤقتة (JWT Auth)' : 'JWT Auth Tokens'}
          </button>
        </div>
      </div>

      {/* Tab 1: Driver Architecture & Low-Level Stack */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* USB Stack Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Usb className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">USB Cable Protocol Stack</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HIGH BANDWIDTH
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-semibold">{isRTL ? 'المكتبات والتعريفات (Low-Level Driver Stack):' : 'Driver Libraries:'}</div>
                <ul className="space-y-1 font-mono text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WinUSB / LibUSB / PyUSB Native Direct Pipe</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Qualcomm Sahara & Firehose (EDL 9008)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> MediaTek BROM / DA Protocol Stack</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unisoc FDL1 / FDL2 Bootloader Stack</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ADB / Fastboot WebUSB Direct Engine</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>{isRTL ? 'مجال العمليات:' : 'Operational Scope:'}</strong>
                <p className="mt-1 text-slate-300">
                  {isRTL ? 'التفليش الكامل للرومات، قراءة وتفليش قطاعات UFS/eMMC، سحب النسخ الاحتياطية NVRAM/EFS، وتخطي حمايات المعالج وFRP.' : 'Full ROM flashing, raw UFS/eMMC partition read/write, NVRAM/EFS backups, SoC bypass, and FRP removal.'}
                </p>
              </div>
            </div>

            {/* Wi-Fi Wireless Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Wi-Fi (Wireless Network)</h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  WIRELESS TCP/IP
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-semibold">{isRTL ? 'البروتوكولات البرمجية:' : 'Software Protocols:'}</div>
                <ul className="space-y-1 font-mono text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Wireless ADB over TCP/IP (Port 5555)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> mDNS / ZeroConf Auto Device Discovery</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> WebSocket & REST Real-Time Sync</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>{isRTL ? 'مجال العمليات:' : 'Operational Scope:'}</strong>
                <p className="mt-1 text-slate-300">
                  {isRTL ? 'التشخيص السريع، قراءة بيانات النظام (build.prop)، قراءة حالة البطارية والمكونات، ونقل الملفات السريعة بدون كابل.' : 'Rapid diagnostics, system build.prop readout, battery & hardware health checks, and cableless transfers.'}
                </p>
              </div>
            </div>

            {/* Bluetooth Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bluetooth className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">Bluetooth LE & SPP</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  DIAGNOSTIC RFCOMM
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-400 font-semibold">{isRTL ? 'البروتوكولات والقنوات:' : 'Protocols & Channels:'}</div>
                <ul className="space-y-1 font-mono text-slate-300">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> RFCOMM / SPP (Serial Port Profile)</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> L2CAP Channel Communications</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> AT Command Set over Serial Port</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>{isRTL ? 'مجال العمليات:' : 'Operational Scope:'}</strong>
                <p className="mt-1 text-slate-300">
                  {isRTL ? 'الأوامر التشخيصية السريعة، اختبار الحساسات (Sensors/Touch)، قراءة رقم الـ IMEI وتفاصيل الشبكة بدون كابلات.' : 'Fast diagnostic AT commands, touch & sensor tests, IMEI readout, and cellular specs without physical wires.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: HWID Lock Engine */}
      {activeTab === 'hwid' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              {isRTL ? 'محرك بصمة الجهاز المفرّدة (HWID Lock Engine):' : 'Unique PC Hardware Fingerprint (HWID Lock Engine):'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isRTL ? 'يمنع مشاركة أو كسر الأداة بدلاً من الدونجل الفيزيائي عن طريق تشفير معاملات الكمبيوتر الفيزياء:' : 'Replaces physical smartcards with cryptographic PC hardware binding:'}
            </p>
            {/* Mathematical Formula Display */}
            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-xs text-emerald-400 font-bold">
              HWID = SHA256(Motherboard UUID + CPU ID + Disk Serial + MAC Address)
            </div>
          </div>

          {/* HWID Parameter Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Motherboard UUID:</label>
              <input
                type="text"
                value={mbUuid}
                onChange={e => setMbUuid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">CPU Signature ID:</label>
              <input
                type="text"
                value={cpuId}
                onChange={e => setCpuId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Storage Disk Serial Number:</label>
              <input
                type="text"
                value={diskSerial}
                onChange={e => setDiskSerial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Network Interface MAC Address:</label>
              <input
                type="text"
                value={macAddr}
                onChange={e => setMacAddr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={handleRecalculateHWID}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isRTL ? 'إعادة حساب بصمة HWID' : 'Recalculate HWID Fingerprint'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">License Tier:</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                {hwidProfile.licenseTier}
              </span>
            </div>
          </div>

          {/* Generated Hash Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{isRTL ? 'بصمة HWID الشفرية الناتجة:' : 'Calculated SHA-256 HWID Digest:'}</span>
              <button
                onClick={() => copyToClipboard(calculatedHwid)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedHwid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHwid ? 'Copied!' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-emerald-300 break-all bg-slate-900 p-2.5 rounded border border-slate-800/80">
              {calculatedHwid}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic In-RAM Execution */}
      {activeTab === 'ram-exec' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-indigo-400" />
                {isRTL ? 'التنفيذ الديناميكي بالذاكرة (Dynamic Memory Execution):' : 'Dynamic AES-256-GCM In-Memory Execution:'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isRTL ? 'عدم تخزين ملفات الـ DA أو الـ Programmers محلياً. يتم جلب الكود مشفراً من الخادم وتنفيذه في الـ RAM ثم مسحه تلقائياً.' : 'Zero local file storage. DA programmers fetched encrypted via AES-256-GCM, executed in RAM, and auto-purged.'}
              </p>
            </div>

            <button
              onClick={handleFetchRAMProgrammer}
              disabled={isFetchingProgrammer}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isFetchingProgrammer ? 'animate-spin' : ''}`} />
              <span>{isFetchingProgrammer ? (isRTL ? 'جاري الجلب والتشفير...' : 'Fetching & Encrypting...') : (isRTL ? 'تحميل بروجرامر مشفر إلى الـ RAM' : 'Fetch In-RAM Programmer')}</span>
            </button>
          </div>

          {/* Chipset Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">{isRTL ? 'اختر المعالج المستهدف:' : 'Select Target SoC:'}</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['Qualcomm Snapdragon Firehose', 'MediaTek BROM DA', 'Unisoc FDL1/FDL2'] as const).map(chip => (
                <button
                  key={chip}
                  onClick={() => setSelectedChipset(chip)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                    selectedChipset === chip ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Active RAM Memory Buffers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{isRTL ? 'سجل ذاكرة RAM المؤقتة:' : 'Active Dynamic Memory Allocations:'}</h4>
            {ramBuffers.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-500 italic">
                {isRTL ? 'لا توجد حزم في الذاكرة حالياً. اضغط فوق لجلب بروجرامر مشفر.' : 'No active memory buffers. Click above to fetch in-RAM encrypted programmer.'}
              </div>
            ) : (
              ramBuffers.map((buf) => (
                <div key={buf.programmerId} className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold font-mono text-indigo-400">{buf.programmerId} ({buf.targetChipset})</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                      buf.autoPurged
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                    }`}>
                      {buf.autoPurged ? 'OVERWRITTEN WITH 0x00 (PURGED)' : 'IN-RAM EXECUTING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
                    <div>RAM Address: <span className="text-slate-200">{buf.ramMemoryAddress}</span></div>
                    <div>Encryption: <span className="text-emerald-400">{buf.encryptionAlgorithm}</span></div>
                    <div>File Size: <span className="text-slate-200">{(buf.fileSizeBytes / 1024).toFixed(1)} KB</span></div>
                    <div>Loaded At: <span className="text-slate-200">{new Date(buf.loadedAt).toLocaleTimeString()}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Time-Bound JWT Auth Tokens */}
      {activeTab === 'jwt-auth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                {isRTL ? 'توكينات المصادقة المؤقتة والمانعة للاعتراض (Anti-Sniffing Time-Bound JWT):' : 'Anti-Sniffing Time-Bound JWT Auth Tokens:'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isRTL ? 'ربط المصادقة المعقدة (Xiaomi Auth / Oppo Server) بتوكينات وقتية تنتهي صلاحيتها خلال ثوانٍ لمنع التجسس على الحزم.' : 'Short-lived cryptographic JWT tokens expiring in seconds to defeat packet sniffing on cloud server auth.'}
              </p>
            </div>

            <button
              onClick={handleRequestJWT}
              disabled={isRequestingToken}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isRTL ? 'توليد توكين مصادقة مؤقت' : 'Issue 15s Auth Token'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">{isRTL ? 'سيرفر المصادقة:' : 'Authentication Issuer:'}</label>
              <select
                value={selectedIssuer}
                onChange={e => setSelectedIssuer(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                <option value="Xiaomi Cloud Auth">Xiaomi Cloud Auth Server</option>
                <option value="Oppo/Realme Server">Oppo / Realme Cloud Server</option>
                <option value="Samsung Knox Enterprise">Samsung Knox Enterprise</option>
                <option value="Nexus Central DRM">Nexus Central DRM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">{isRTL ? 'نطاق الصلاحيات Scope:' : 'Scope Permission:'}</label>
              <input
                type="text"
                value={selectedScope}
                onChange={e => setSelectedScope(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Active Tokens List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{isRTL ? 'التوكينات النشطة والمولّدة:' : 'Active Generated Tokens:'}</h4>
            {activeTokens.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center text-xs text-slate-500 italic">
                {isRTL ? 'لا توجد توكينات سارية حالياً. توليد توكين جديد ينتهي خلال 15 ثانية.' : 'No active tokens. Click above to generate a 15s time-bound token.'}
              </div>
            ) : (
              activeTokens.map((tok, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400">{tok.issuer}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      EXPIRES IN 15 SECONDS
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                    {tok.token}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            {isRTL ? 'سجل عمليات البنية والأمان السحابي:' : 'Cloud DRM & Driver Terminal Log:'}
          </span>
          <span className="text-[10px] font-mono text-emerald-400">LIVE MONITOR</span>
        </div>

        <div className="h-36 overflow-y-auto bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">{isRTL ? 'النظام جاهز ومصادق سحابياً...' : 'System ready and cloud validated...'}</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={log.includes('SUCCESS') || log.includes('HWID') ? 'text-emerald-400' : 'text-slate-300'}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
