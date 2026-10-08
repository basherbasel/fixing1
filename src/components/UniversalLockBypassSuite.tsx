import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, ShieldAlert, Key, Smartphone, AlertTriangle, CheckCircle2, 
  Play, RefreshCw, Cpu, Layers, ShieldCheck, Terminal, Usb, Wifi, Bluetooth, 
  Radio, Zap, Signal, Activity, Globe, Server, HardDrive, FileText, Database, Info
} from 'lucide-react';
import { BYPASS_PRESETS, BypassMethod, SecurityLockStatus, securityBypassEngine } from '../services/security-bypass-engine';
import { toolBridge, ConnectedDeviceInfo, ConnectionChannel } from '../services/tool-integration-bridge';
import { useI18n } from '../context/I18nContext';

export const UniversalLockBypassSuite: React.FC<{
  isConnected?: boolean;
  connectionType?: string;
  onLog?: (msg: string) => void;
}> = ({ isConnected = false, connectionType = 'None', onLog }) => {
  const { isRTL } = useI18n();
  const [activeDevice, setActiveDevice] = useState<ConnectedDeviceInfo>(toolBridge.getConnectedDevice());
  const [selectedMethod, setSelectedMethod] = useState<BypassMethod>(BYPASS_PRESETS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState<ConnectionChannel>('AUTO');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'LEGACY_KEY_FILE' | 'BOOT_IMG_INJECT' | 'BOOTROM_HARDWARE' | 'WIRELESS_ADB' | 'DOWNLOAD_MODE_MODEM'>('ALL');
  
  // Wireless ADB form state
  const [wirelessIp, setWirelessIp] = useState('192.168.1.145');
  const [wirelessPort, setWirelessPort] = useState(5555);
  const [wirelessPairingCode, setWirelessPairingCode] = useState('849201');
  const [isConnectingWireless, setIsConnectingWireless] = useState(false);

  // Bluetooth scanning state
  const [isScanningBluetooth, setIsScanningBluetooth] = useState(false);

  // Auto scanning radar state
  const [isAutoScanning, setIsAutoScanning] = useState(false);

  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Encryption analysis state
  const [targetAndroidVersion, setTargetAndroidVersion] = useState('12');
  const [encryptionAnalysis, setEncryptionAnalysis] = useState<{
    isFBE: boolean;
    canKeyFileRemoveBeUsed: boolean;
    recommendedExploit: string;
    explanationAr: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = toolBridge.subscribeDeviceConnection((device) => {
      setActiveDevice(device);
      if (device.isConnected) {
        setExecutionLogs(prev => [
          ...prev,
          `[AUTO-READ] Phone Detected: ${device.vendorName} ${device.productName} (${device.serial}) via ${device.connectionType} [Channel: ${device.connectionChannel}]`
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Run initial FBE analysis on load or version change
    securityBypassEngine.analyzeEncryptionArchitecture(targetAndroidVersion).then(res => {
      setEncryptionAnalysis(res);
    });
  }, [targetAndroidVersion]);

  const [lockStatus, setLockStatus] = useState<SecurityLockStatus>({
    frpState: 'LOCKED',
    oemUnlockState: 'LOCKED',
    knoxGuardStatus: 'ACTIVE',
    miCloudStatus: 'CLEAN',
    screenLockType: 'PIN',
    avbState: 'GREEN',
    securityPatchLevel: '2026-09-01',
    connectionChannel: 'AUTO',
    encryptionType: 'FBE_FILE_BASED',
    teeKeyDerivationState: 'SECURE_TEE_BOUND'
  });

  const handleRunDiagnostics = async () => {
    if (onLog) onLog(`[SECURITY-DIAG] Scanning target device protection locks over ${activeDevice.connectionChannel} channel...`);
    const status = await securityBypassEngine.runLockDiagnostic(activeDevice.isConnected, activeDevice.connectionChannel);
    setLockStatus(status);
    setExecutionLogs(prev => [
      ...prev,
      `[DIAG-RESULT] (${activeDevice.connectionChannel}) FRP: ${status.frpState} | Bootloader: ${status.oemUnlockState} | Knox: ${status.knoxGuardStatus} | Encryption: ${status.encryptionType}`
    ]);
  };

  const handleExecuteBypass = async () => {
    setIsExecuting(true);
    const channel = activeDevice.isConnected ? activeDevice.connectionChannel : activeChannelTab;
    setExecutionLogs(prev => [...prev, `[BYPASS-START] Launching lock removal pipeline for ${selectedMethod.name} via ${channel}`]);
    if (onLog) onLog(`[LOCK-BYPASS] Launching pipeline: ${selectedMethod.name} [Channel: ${channel}]`);

    const success = await securityBypassEngine.executeBypassMethod(selectedMethod, channel, (logMsg) => {
      setExecutionLogs(prev => [...prev, logMsg]);
      if (onLog) onLog(logMsg);
    });

    setIsExecuting(false);
    if (success) {
      setExecutionLogs(prev => [...prev, `[BYPASS-COMPLETE] Protection successfully removed / bypassed over ${channel}!`]);
      // Update lock state simulation
      if (selectedMethod.targetProtection === 'FRP') {
        setLockStatus(prev => ({ ...prev, frpState: 'BYPASSED' }));
      } else if (selectedMethod.targetProtection === 'OEM_BOOTLOADER') {
        setLockStatus(prev => ({ ...prev, oemUnlockState: 'UNLOCKED', avbState: 'ORANGE' }));
      } else if (selectedMethod.targetProtection === 'KNOX') {
        setLockStatus(prev => ({ ...prev, knoxGuardStatus: 'CLEAN' }));
      } else if (selectedMethod.targetProtection === 'SCREEN_LOCK') {
        setLockStatus(prev => ({ ...prev, screenLockType: 'NONE' }));
      }
    }
  };

  const handleConnectWirelessADB = async () => {
    setIsConnectingWireless(true);
    setExecutionLogs(prev => [...prev, `[WIRELESS-ADB] Handshaking with IP ${wirelessIp}:${wirelessPort} (Pairing Code: ${wirelessPairingCode})...`]);
    if (onLog) onLog(`[WIRELESS-ADB] Connecting to ${wirelessIp}:${wirelessPort}...`);

    try {
      const dev = await toolBridge.connectADBWireless(wirelessIp, wirelessPort, wirelessPairingCode);
      setExecutionLogs(prev => [...prev, `[WIRELESS-CONNECTED] Successfully established ADB TCP socket with ${dev.vendorName} ${dev.productName}!`]);
      handleRunDiagnostics();
    } catch (e) {
      setExecutionLogs(prev => [...prev, `[WIRELESS-ERROR] Failed to connect to ${wirelessIp}:${wirelessPort}`]);
    } finally {
      setIsConnectingWireless(false);
    }
  };

  const handleConnectWebBluetooth = async () => {
    setIsScanningBluetooth(true);
    setExecutionLogs(prev => [...prev, `[WEB-BLUETOOTH] Scanning GATT devices for WebBluetooth LE pairing...`]);
    if (onLog) onLog(`[WEB-BLUETOOTH] Scanning Bluetooth LE devices...`);

    try {
      const dev = await toolBridge.connectWebBluetooth();
      setExecutionLogs(prev => [...prev, `[BLUETOOTH-CONNECTED] Paired with Bluetooth LE target: ${dev.productName} (${dev.bluetoothMac})`]);
      handleRunDiagnostics();
    } catch (e) {
      setExecutionLogs(prev => [...prev, `[BLUETOOTH-ERROR] WebBluetooth pairing cancelled or failed`]);
    } finally {
      setIsScanningBluetooth(false);
    }
  };

  const handleAutoScanAllModes = async () => {
    setIsAutoScanning(true);
    setExecutionLogs(prev => [...prev, `[AUTO-RADAR] Initiating Multi-Protocol Auto-Scan across USB, Wi-Fi IP, and Bluetooth LE...`]);
    if (onLog) onLog(`[AUTO-RADAR] Auto-reading phone across all connection channels...`);

    try {
      const dev = await toolBridge.triggerAutoScanAllModes();
      setExecutionLogs(prev => [...prev, `[AUTO-DETECTED] Target Phone Discovered: ${dev.vendorName} ${dev.productName} (${dev.connectionType})`]);
      handleRunDiagnostics();
    } catch (e) {
      setExecutionLogs(prev => [...prev, `[AUTO-SCAN-ERROR] Failed to discover connected devices`]);
    } finally {
      setIsAutoScanning(false);
    }
  };

  // Filter methods based on activeChannelTab and category filter
  const filteredPresets = BYPASS_PRESETS.filter(method => {
    const channelMatch = activeChannelTab === 'AUTO' || method.supportedChannels.includes(activeChannelTab) || method.supportedChannels.includes('AUTO');
    const categoryMatch = activeCategoryFilter === 'ALL' || method.exploitCategory === activeCategoryFilter;
    return channelMatch && categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Unlock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isRTL ? 'منظومة تخطي قفل الشاشة والحمايات المتقدمة (Universal Lock & Security Bypass Suite)' : 'Universal Lock & FRP Bypass Suite'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                ZERO DATA LOSS 2028
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'تخطي رمز القفل (PIN/Pattern) وحمايات FRP وKnox عبر استغلال ثغرات الذاكرة وBootROM وتعديل ملفات النظام' : 'Bypass Screen Lock (PIN/Pattern), FRP, and Knox via Memory Exploits, BootROM & System File Modification'}
            </p>
          </div>
        </div>

        {/* Global Auto-Read Button */}
        <button
          onClick={handleAutoScanAllModes}
          disabled={isAutoScanning}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
        >
          <Radio className={`w-4 h-4 ${isAutoScanning ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{isAutoScanning ? (isRTL ? 'جاري الفحص التلقائي...' : 'Scanning All Modes...') : (isRTL ? 'اقرأ الهاتف تلقائياً في كل الأوضاع' : 'Auto-Read Phone (All Modes)')}</span>
        </button>
      </div>

      {/* Mode Selection Toolbar & Live Device Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isRTL ? 'وضع الاتصال المستهدف:' : 'Target Connection Mode:'}
            </span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveChannelTab('AUTO')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeChannelTab === 'AUTO' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isRTL ? 'فحص شامل تلقائي' : 'Auto-Detector'}</span>
              </button>
              <button
                onClick={() => setActiveChannelTab('USB')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeChannelTab === 'USB' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Usb className="w-3.5 h-3.5" />
                <span>USB Cable</span>
              </button>
              <button
                onClick={() => setActiveChannelTab('WIRELESS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeChannelTab === 'WIRELESS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Wireless ADB (Wi-Fi/IP)</span>
              </button>
              <button
                onClick={() => setActiveChannelTab('BLUETOOTH')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeChannelTab === 'BLUETOOTH' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>WebBluetooth LE</span>
              </button>
            </div>
          </div>

          {/* Active Target Telemetry Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${activeDevice.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span className="text-slate-300">
              {activeDevice.isConnected ? (
                <>
                  <strong className="text-emerald-400">{activeDevice.vendorName} {activeDevice.productName}</strong>
                  <span className="text-slate-500 mx-1.5">|</span>
                  <span className="text-slate-400">{activeDevice.connectionType}</span>
                  {activeDevice.ipAddress && <span className="text-indigo-400 ml-1">({activeDevice.ipAddress}:{activeDevice.port})</span>}
                  {activeDevice.bluetoothMac && <span className="text-cyan-400 ml-1">({activeDevice.bluetoothMac})</span>}
                </>
              ) : (
                <span className="text-slate-500">{isRTL ? 'لم يتم ربط هاتف عبر القناة المختارة' : 'Awaiting Connected Device'}</span>
              )}
            </span>
          </div>
        </div>

        {/* Wireless ADB Setup Panel */}
        {activeChannelTab === 'WIRELESS' && (
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-400" />
                {isRTL ? 'إعدادات الاتصال اللاسلكي ADB Over Wi-Fi / IP:' : 'Wireless ADB TCP Connection Controls:'}
              </h4>
              <span className="text-[10px] text-slate-500">Android 11+ Wireless Debugging Protocol</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? 'عنوان IP للهاتف:' : 'Device IP Address:'}</label>
                <input
                  type="text"
                  value={wirelessIp}
                  onChange={e => setWirelessIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? 'منفذ Port:' : 'ADB Port:'}</label>
                <input
                  type="number"
                  value={wirelessPort}
                  onChange={e => setWirelessPort(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="5555"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isRTL ? 'رمز الاقتران Pairing Code:' : 'Pairing Code:'}</label>
                <input
                  type="text"
                  value={wirelessPairingCode}
                  onChange={e => setWirelessPairingCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="849201"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleConnectWirelessADB}
                  disabled={isConnectingWireless}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Wifi className={`w-3.5 h-3.5 ${isConnectingWireless ? 'animate-ping' : ''}`} />
                  <span>{isConnectingWireless ? (isRTL ? 'جاري الاتصال...' : 'Connecting...') : (isRTL ? 'ربط لاسلكي ADB' : 'Connect Wireless ADB')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WebBluetooth LE Setup Panel */}
        {activeChannelTab === 'BLUETOOTH' && (
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-cyan-400" />
                {isRTL ? 'إعدادات الاقتران عبر WebBluetooth LE:' : 'WebBluetooth LE Wireless Scanning:'}
              </h4>
              <span className="text-[10px] text-slate-500">Bluetooth 5.0 GATT HCI Diagnostics</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                {isRTL ? 'يمكّن هذا الخيار من الاقتران المباشر مع أجهزة أندرويد عبر واجهة WebBluetooth LE لإجراء فحص SmartLock وتخطي قفل الشاشة بدون أسلاك.' : 'Pairs directly with Android hardware over WebBluetooth GATT to audit SmartLock and remove screen locks wirelessly.'}
              </p>
              <button
                onClick={handleConnectWebBluetooth}
                disabled={isScanningBluetooth}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Bluetooth className={`w-4 h-4 ${isScanningBluetooth ? 'animate-bounce' : ''}`} />
                <span>{isScanningBluetooth ? (isRTL ? 'جاري اقتران البلوتوث...' : 'Pairing BLE...') : (isRTL ? 'افحص واقترن عبر البلوتوث' : 'Scan & Pair WebBluetooth')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Lock Architecture & Encryption Evaluator Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            {isRTL ? 'محلل تشفير الذاكرة وإمكانية حذف قفل الشاشة بدون مسح البيانات (FBE vs FDE Evaluator)' : 'Screen Lock Encryption & File-Based Encryption (FBE) Evaluator'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isRTL ? 'إصدار أندرويد:' : 'Android OS Version:'}</span>
            <select
              value={targetAndroidVersion}
              onChange={(e) => setTargetAndroidVersion(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 font-mono focus:border-purple-500 focus:outline-none"
            >
              <option value="6.0">Android 6.0 (Legacy Unencrypted)</option>
              <option value="7.0">Android 7.0 (Legacy FDE)</option>
              <option value="8.0">Android 8.0 (Early FBE)</option>
              <option value="10.0">Android 10.0 (Strict FBE)</option>
              <option value="12.0">Android 12.0 (TEE KDF Guarded)</option>
              <option value="14.0">Android 14.0 (TEE AES-256-XTS)</option>
              <option value="15.0">Android 15.0 (Modern Vault FBE)</option>
            </select>
          </div>
        </div>

        {encryptionAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${encryptionAnalysis.isFBE ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'نظام تشفير الذاكرة:' : 'Storage Encryption Standard:'}</div>
              <div className="text-base font-bold font-mono mt-1 flex items-center gap-2">
                <span className={encryptionAnalysis.isFBE ? 'text-amber-400' : 'text-emerald-400'}>
                  {encryptionAnalysis.isFBE ? 'File-Based Encryption (FBE)' : 'Full Disk / Legacy (FDE)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {encryptionAnalysis.isFBE ? (isRTL ? 'كل ملف مشفر بمفتاح منفصل مشتق من رمز القفل + مفتاح العتاد TEE' : 'Each file encrypted with separate key derived from User PIN + TEE') : (isRTL ? 'تشفير كامل قرص الذاكرة أو غير مشفر افتراضياً' : 'Full disk or unencrypted partitions')}
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${encryptionAnalysis.canKeyFileRemoveBeUsed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'حذف ملفات القفل Direct Key File Removal:' : 'Direct Key File Removal Status:'}</div>
              <div className="text-base font-bold font-mono mt-1 flex items-center gap-2">
                <span className={encryptionAnalysis.canKeyFileRemoveBeUsed ? 'text-emerald-400' : 'text-rose-400'}>
                  {encryptionAnalysis.canKeyFileRemoveBeUsed ? 'FEASIBLE (Zero Data Loss)' : 'BLOCKED / RISKY (Scrambles Data)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {encryptionAnalysis.canKeyFileRemoveBeUsed ? (isRTL ? 'يمكن حذف locksettings.db مباشرة ويقلع الجهاز ببيانات سليمة' : 'Safe to delete locksettings.db via TWRP/ADB') : (isRTL ? 'حذف الملف يضيع مفتاح الاشتقاق ويحيل البيانات لنصوص عشوائية' : 'Key deletion destroys Master Key, rendering media unreadable')}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                {isRTL ? 'المسار البرمجي الموصى به:' : 'Recommended Exploitation Path:'}
              </div>
              <div className="text-xs font-bold font-mono text-slate-200 mt-1">{encryptionAnalysis.recommendedExploit}</div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {encryptionAnalysis.explanationAr}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isRTL ? 'حماية حساب جوجل (FRP)' : 'Google FRP Lock'}</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <span className={lockStatus.frpState === 'BYPASSED' ? 'text-emerald-400' : 'text-amber-400'}>
              {lockStatus.frpState}
            </span>
            {lockStatus.frpState === 'BYPASSED' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
          <p className="text-[10px] text-slate-500">{isRTL ? 'حالة التفعيل والربط بحساب جوجل' : 'Factory Reset Protection status'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isRTL ? 'قفل البوتلودر (OEM Unlock)' : 'OEM Bootloader State'}</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <span className={lockStatus.oemUnlockState === 'UNLOCKED' ? 'text-emerald-400' : 'text-indigo-400'}>
              {lockStatus.oemUnlockState}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">{isRTL ? 'حالة إمكانية التفليش المخصص' : 'Bootloader unlock permission'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isRTL ? 'سامسونج نوكس / PayJoy MDM' : 'Knox Guard / PayJoy MDM'}</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <span className={lockStatus.knoxGuardStatus === 'CLEAN' ? 'text-emerald-400' : 'text-sky-400'}>
              {lockStatus.knoxGuardStatus}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">{isRTL ? 'حظر الشركة والقيود الأمنية' : 'Enterprise MDM enrollment state'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isRTL ? 'قفل الشاشة (Screen Lock)' : 'Screen Lock (PIN/Pattern)'}</span>
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <span className={lockStatus.screenLockType === 'NONE' ? 'text-emerald-400' : 'text-purple-400'}>
              {lockStatus.screenLockType}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">{isRTL ? 'إزالة بدون مسح البيانات الشخصية' : 'Zero Data Loss unlock mode'}</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <span className="text-xs text-slate-400 font-medium px-2">{isRTL ? 'تصنيف التقنية:' : 'Exploit Category:'}</span>
        <button
          onClick={() => setActiveCategoryFilter('ALL')}
          className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            activeCategoryFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isRTL ? 'الكل' : 'All Presets'}
        </button>
        <button
          onClick={() => setActiveCategoryFilter('LEGACY_KEY_FILE')}
          className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            activeCategoryFilter === 'LEGACY_KEY_FILE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isRTL ? 'حذف ملفات القفل (Key File Removal)' : 'Key File Removal'}
        </button>
        <button
          onClick={() => setActiveCategoryFilter('BOOT_IMG_INJECT')}
          className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            activeCategoryFilter === 'BOOT_IMG_INJECT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isRTL ? 'حقن boot.img معدل' : 'Boot.img Patch Injection'}
        </button>
        <button
          onClick={() => setActiveCategoryFilter('BOOTROM_HARDWARE')}
          className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            activeCategoryFilter === 'BOOTROM_HARDWARE' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isRTL ? 'ثغرات العتاد BootROM / BROM' : 'BootROM SoC Exploits'}
        </button>
        <button
          onClick={() => setActiveCategoryFilter('DOWNLOAD_MODE_MODEM')}
          className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
            activeCategoryFilter === 'DOWNLOAD_MODE_MODEM' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isRTL ? 'تفليش مودم سامسونج' : 'Samsung Modem Injection'}
        </button>
      </div>

      {/* Presets and Execution Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bypass Preset Methods Selector */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              {isRTL ? 'خوارزميات التخطي المتاحة:' : 'Available Bypass & Lock Pipelines:'}
            </h3>
            <span className="text-xs font-mono text-slate-500">{filteredPresets.length} {isRTL ? 'طريقة مجهزة' : 'Methods Ready'}</span>
          </div>

          <div className="space-y-3">
            {filteredPresets.map((method) => {
              const isSelected = selectedMethod.id === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {method.name}
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                          method.riskLevel === 'LOW'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : method.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {method.riskLevel} RISK
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{method.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {method.targetProtection}
                      </span>
                      <div className="flex items-center gap-1">
                        {method.supportedChannels.map(ch => (
                          <span key={ch} className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Target: {method.supportedAndroid}</span>
                    <span className={method.requiresDataWipe ? 'text-amber-400' : 'text-emerald-400'}>
                      {method.requiresDataWipe ? (isRTL ? 'يتطلب مسح المصنع' : 'Requires Data Wipe') : (isRTL ? 'بدون فقدان البيانات' : 'Zero Data Loss')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Execution & Diagnostics Control Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              {isRTL ? 'غرفة عمليات التفكيك والتخطي:' : 'Execution Terminal & Diagnostics:'}
            </h3>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">{isRTL ? 'الطريقة المحددة:' : 'Selected Pipeline:'}</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">{selectedMethod.name}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Channel: <strong className="text-indigo-400">{activeDevice.connectionChannel}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRunDiagnostics}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>{isRTL ? 'إعادة فحص وتحديد الحمايات' : 'Run Full Security Audit'}</span>
              </button>

              <button
                onClick={handleExecuteBypass}
                disabled={isExecuting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? (isRTL ? 'جاري التنفيذ والتخطي...' : 'Executing Bypass...') : (isRTL ? 'بدء فك وتخطي الحماية بضغطة زر' : 'Start One-Click Bypass')}</span>
              </button>
            </div>
          </div>

          {/* Real Live Execution Logs Output */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 h-48 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5 custom-scrollbar mt-4">
            <div className="text-slate-500 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{isRTL ? 'سجل الأوامر المباشر:' : 'Live Command Output:'}</span>
              <span className="text-[9px] text-emerald-400">LOG ACTIVE</span>
            </div>
            {executionLogs.length === 0 ? (
              <div className="text-slate-600 italic mt-2">{isRTL ? 'جاهز للتنفيذ وقراءة الهاتف...' : 'System ready. Awaiting command...'}</div>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className={log.includes('COMPLETE') || log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('BYPASS-STEP') ? 'text-indigo-300' : 'text-slate-300'}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
