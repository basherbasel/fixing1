/**
 * Sentinel Mobile Studio - Standard Android Partition Schemas & Partition Safety
 */

export interface PartitionDescriptor {
  name: string;
  category: 'critical_radio' | 'boot_kernel' | 'system_payload' | 'userdata' | 'recovery';
  description: string;
  isSlotSpecific: boolean;
  requiresRootOrUnlock: boolean;
  safeToFlash: boolean;
}

export const ANDROID_STANDARD_PARTITIONS: PartitionDescriptor[] = [
  {
    name: 'boot',
    category: 'boot_kernel',
    description: 'Linux kernel and ramdisk image (GKI compliant on Android 12+)',
    isSlotSpecific: true,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'init_boot',
    category: 'boot_kernel',
    description: 'Dedicated initial ramdisk partition on Android 13+ devices',
    isSlotSpecific: true,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'dtbo',
    category: 'boot_kernel',
    description: 'Device Tree Blob Overlay containing peripheral board timings and hardware specs',
    isSlotSpecific: true,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'vbmeta',
    category: 'boot_kernel',
    description: 'Android Verified Boot (AVB 2.0) root cryptographic hash tree and signatures',
    isSlotSpecific: true,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'recovery',
    category: 'recovery',
    description: 'Standalone AOSP / TWRP recovery kernel image (Non-A/B or Legacy devices)',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'efs / sec_efs',
    category: 'critical_radio',
    description: 'Samsung modem calibration, RF filter parameters, and serial identifiers',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: false, // Critical: Backup only
  },
  {
    name: 'modemst1 / modemst2',
    category: 'critical_radio',
    description: 'Qualcomm Snapdragon primary and backup Non-Volatile (NV) items',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: false, // Critical: Backup only
  },
  {
    name: 'nvram / nvdata',
    category: 'critical_radio',
    description: 'MediaTek hardware calibration, RF tables, and Wi-Fi/BT MAC data',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: false, // Critical: Backup only
  },
  {
    name: 'super',
    category: 'system_payload',
    description: 'Dynamic partition container housing system, vendor, product, and system_ext',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
  {
    name: 'userdata',
    category: 'userdata',
    description: 'Encrypted ext4/f2fs user data partition (Factory reset destination)',
    isSlotSpecific: false,
    requiresRootOrUnlock: true,
    safeToFlash: true,
  },
];
