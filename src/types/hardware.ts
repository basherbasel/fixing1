/**
 * Sentinel Mobile Studio - Real Hardware Identifier Database
 * Standard USB Vendor IDs (VID) and Product IDs (PID) for mobile hardware diagnosis.
 */

export interface KnownHardwareEntry {
  vendorName: string;
  chipset: string;
  mode: string;
  notes: string;
  category: 'adb' | 'fastboot' | 'edl' | 'brom' | 'preloader' | 'diag' | 'download_mode';
}

export const KNOWN_USB_SIGNATURES: Record<string, KnownHardwareEntry> = {
  // Google / Pixel / Generic Android
  '18D1:4EE0': { vendorName: 'Google', chipset: 'Tensor/Snapdragon', mode: 'Fastboot Bootloader', notes: 'Native Android Fastboot interface', category: 'fastboot' },
  '18D1:4EE7': { vendorName: 'Google', chipset: 'Tensor/Snapdragon', mode: 'ADB Recovery / Sideload', notes: 'Recovery command mode', category: 'adb' },
  '18D1:4EE2': { vendorName: 'Google', chipset: 'Android Device', mode: 'MTP + ADB Enabled', notes: 'Standard USB Debugging active', category: 'adb' },

  // Qualcomm
  '05C6:9008': { vendorName: 'Qualcomm', chipset: 'Snapdragon', mode: 'EDL Emergency Download (9008)', notes: 'Primary Sahara/Firehose emergency recovery interface', category: 'edl' },
  '05C6:901D': { vendorName: 'Qualcomm', chipset: 'Snapdragon', mode: 'Diagnostic Port (QDLoader)', notes: 'Baseband NVRAM & RF calibration bus', category: 'diag' },
  '05C6:900E': { vendorName: 'Qualcomm', chipset: 'Snapdragon', mode: 'Emergency Diagnostic', notes: 'Dload protocol handshake state', category: 'edl' },

  // MediaTek
  '0E8D:0003': { vendorName: 'MediaTek', chipset: 'Helio / Dimensity', mode: 'BootROM (BROM)', notes: 'Hardware BootROM handshake level', category: 'brom' },
  '0E8D:2000': { vendorName: 'MediaTek', chipset: 'Helio / Dimensity', mode: 'Preloader VCOM', notes: 'Preloader stage DA transfer interface', category: 'preloader' },
  '0E8D:2001': { vendorName: 'MediaTek', chipset: 'Helio / Dimensity', mode: 'DA USB VCOM Port', notes: 'Download Agent active memory access', category: 'preloader' },

  // Samsung
  '04E8:685D': { vendorName: 'Samsung', chipset: 'Exynos / Snapdragon', mode: 'LOKE Odin Download Mode', notes: 'Direct PIT / TAR.MD5 low-level flashing', category: 'download_mode' },
  '04E8:6860': { vendorName: 'Samsung', chipset: 'Exynos / Snapdragon', mode: 'Samsung Modem / ACM Diagnostic', notes: 'AT commands and calibration endpoint', category: 'diag' },

  // Xiaomi
  '2717:FF40': { vendorName: 'Xiaomi', chipset: 'Snapdragon / Dimensity', mode: 'Fastboot Interface', notes: 'MIUI/HyperOS bootloader protocol', category: 'fastboot' },
  '2717:FF48': { vendorName: 'Xiaomi', chipset: 'Android', mode: 'Mi Recovery Sideload', notes: 'Stock recovery payload receiver', category: 'adb' },

  // Unisoc / Spreadtrum
  '1782:4D00': { vendorName: 'Unisoc', chipset: 'Tiger T-Series / SC9863A', mode: 'SPRD U2S Diag Port', notes: 'FDL1/FDL2 calibration channel', category: 'diag' },
  '1782:3D00': { vendorName: 'Unisoc', chipset: 'Tiger T-Series', mode: 'SPRD Download Interface', notes: 'Direct Pac firmware transfer', category: 'preloader' },

  // Apple
  '05AC:1227': { vendorName: 'Apple', chipset: 'A-Series / Bionic', mode: 'DFU (Device Firmware Upgrade)', notes: 'SecureROM level hardware restore state', category: 'download_mode' },
  '05AC:1281': { vendorName: 'Apple', chipset: 'A-Series / Bionic', mode: 'Recovery Mode', notes: 'iBoot level restore handshake', category: 'download_mode' },
};

export function identifyHardwareSignature(vid: number, pid: number): KnownHardwareEntry | null {
  const vidHex = vid.toString(16).padStart(4, '0').toUpperCase();
  const pidHex = pid.toString(16).padStart(4, '0').toUpperCase();
  const key = `${vidHex}:${pidHex}`;
  return KNOWN_USB_SIGNATURES[key] || null;
}
