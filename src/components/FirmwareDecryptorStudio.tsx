import React, { useState } from 'react';
import { Download, Lock, Unlock, FileCheck, Server, RefreshCw, Layers, ShieldCheck, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface FirmwarePackage {
  id: string;
  brand: string;
  model: string;
  osVersion: string;
  filename: string;
  sizeGb: string;
  encryptionType: 'OPO_OFP' | 'SAMSUNG_TAR_MD5' | 'XIAOMI_PAYLOAD_BIN' | 'APPLE_IPSW';
  partitionsExtracted: string[];
}

const FIRMWARE_CATALOG: FirmwarePackage[] = [
  {
    id: 'fw-samsung-s24u',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra (SM-S928B)',
    osVersion: 'One UI 6.1 (Android 14)',
    filename: 'AP_S928BXXU1AXB5_REV00_user_low_ship_MULTI_CERT.tar.md5',
    sizeGb: '12.4 GB',
    encryptionType: 'SAMSUNG_TAR_MD5',
    partitionsExtracted: ['boot.img', 'init_boot.img', 'super.img', 'modem.bin', 'dtbo.img', 'vbmeta.img']
  },
  {
    id: 'fw-xiaomi-14p',
    brand: 'Xiaomi',
    model: 'Xiaomi 14 Pro (shennong)',
    osVersion: 'HyperOS 1.0.8.0.UNCCNXM',
    filename: 'shennong_images_OS1.0.8.0.UNCCNXM_20240215.0000.00_14.0_cn.tgz',
    sizeGb: '8.9 GB',
    encryptionType: 'XIAOMI_PAYLOAD_BIN',
    partitionsExtracted: ['payload.bin', 'boot.img', 'vendor_boot.img', 'cust.img', 'modem.img']
  },
  {
    id: 'fw-oppo-findx7',
    brand: 'OPPO',
    model: 'Find X7 Ultra (PHY110)',
    osVersion: 'ColorOS 14.0.1.300',
    filename: 'PHY110_14.0.1.300(CN01)_OFP_Decrypt.ofp',
    sizeGb: '11.1 GB',
    encryptionType: 'OPO_OFP',
    partitionsExtracted: ['my_hexf.img', 'my_manifest.img', 'boot.img', 'super.img', 'recovery.img']
  }
];

export const FirmwareDecryptorStudio: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { isRTL } = useI18n();
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwarePackage>(FIRMWARE_CATALOG[0]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [extractedStatus, setExtractedStatus] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSelectFirmware = (fw: FirmwarePackage) => {
    setSelectedFirmware(fw);
    setExtractedStatus(false);
    setDecryptProgress(0);
    setLogs([`[FIRMWARE-INIT] Selected package: ${fw.filename}`]);
  };

  const handleStartDecryption = async () => {
    setIsDecrypting(true);
    setExtractedStatus(false);
    setDecryptProgress(0);
    setLogs(prev => [...prev, `[DECRYPT-START] Unpacking & decrypting ${selectedFirmware.encryptionType} archive...`]);
    if (onLog) onLog(`[FIRMWARE-DECRYPT] Unpacking ${selectedFirmware.filename}`);

    for (let p = 10; p <= 100; p += 15) {
      await new Promise(r => setTimeout(r, 400));
      setDecryptProgress(p);
      setLogs(prev => [...prev, `[DECRYPT] Processing block hash chunk ${p}%...`]);
    }

    setIsDecrypting(false);
    setExtractedStatus(true);
    setLogs(prev => [
      ...prev,
      `[DECRYPT-SUCCESS] Partitions extracted successfully! Extracted: ${selectedFirmware.partitionsExtracted.join(', ')}`
    ]);
    if (onLog) onLog(`[FIRMWARE-DECRYPT] Decrypted ${selectedFirmware.filename} successfully`);
  };

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
              {isRTL ? 'مكتبة ومفكك تشفير الفيرموير السحابي المباشر (Firmware Decryptor Mirror)' : 'Cloud Firmware Decryptor & Payload Mirror'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                v5.0 MIRROR
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'استخراج وتفكيك حزم OFP, TAR.MD5, Payload.bin مباشرة للحصول على ملفات البوت والسوبر' : 'Extract payload.bin, OFP, KDZ, and TAR.MD5 images for boot patching and firmware repair'}
            </p>
          </div>
        </div>

        <button
          onClick={handleStartDecryption}
          disabled={isDecrypting}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          {isDecrypting ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <Unlock className="w-4 h-4 text-slate-950" />
          )}
          {isRTL ? 'فك التشفير واستخراج الملفات' : 'Decrypt & Unpack Package'}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Firmware Packages List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            {isRTL ? 'حزم الفيرموير الرسمية المتاحة' : 'Available Official Firmware Packages'}
          </h3>

          <div className="space-y-2.5">
            {FIRMWARE_CATALOG.map(fw => (
              <div
                key={fw.id}
                onClick={() => handleSelectFirmware(fw)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  selectedFirmware.id === fw.id
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 shadow-md shadow-emerald-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-emerald-300">{fw.brand}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                    {fw.sizeGb}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200">{fw.model}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 line-clamp-1">{fw.filename}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Unpacking & Partitions Inspection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{selectedFirmware.filename}</h3>
                <p className="text-xs text-slate-400">{selectedFirmware.model} ({selectedFirmware.osVersion})</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono bg-slate-800 text-emerald-400 rounded-md border border-slate-700">
                {selectedFirmware.encryptionType}
              </span>
            </div>

            {/* Progress Bar */}
            {isDecrypting && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Decrypting SHA-256 Payload...</span>
                  <span className="text-emerald-400 font-bold">{decryptProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${decryptProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Extracted Partitions Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {isRTL ? 'الأقسام والملفات المستخرجة' : 'Extracted Partition Binaries'}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedFirmware.partitionsExtracted.map((part, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                      extractedStatus
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{part}</span>
                    {extractedStatus ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
            <div className="text-slate-400 pb-1 border-b border-slate-800">Firmware Unpack Console</div>
            <div className="h-28 overflow-y-auto space-y-1 text-[11px] text-slate-300">
              {logs.map((l, i) => (
                <div key={i} className="text-emerald-400/90">&gt; {l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
