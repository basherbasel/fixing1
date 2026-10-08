/**
 * Nexus-X Quantum Repair OS 2028 - Global Model & Loader Database
 * Contains HWIDs, Test Points, Firehose/DA mappings for 15,000+ devices.
 */

export interface DeviceModelProfile {
  brand: string;
  model: string;
  codename: string;
  soc: string;
  hwid: string;
  storageType: 'eMMC' | 'UFS 2.1' | 'UFS 3.1' | 'UFS 4.0' | 'UFS 5.0';
  testPointUrl?: string;
  ispPinoutUrl?: string;
  loaderType: 'FIREHOSE' | 'DA' | 'SCATTER' | 'PAC';
  authRequired: boolean;
  securityEcosystem: 'Knox v5' | 'Titan-M4' | 'SEP-Gen4' | 'TEE-v6' | 'StrongBox';
  repairPipeline: string[];
}

export const GlobalModelDatabase: DeviceModelProfile[] = [
  {
    brand: 'Samsung',
    model: 'Galaxy S28 Ultra (Quantum Edition)',
    codename: 's28u-q',
    soc: 'Snapdragon 8 Gen 7 (Quantum-Enforced)',
    hwid: '0x001F2028',
    storageType: 'UFS 5.0',
    testPointUrl: '/assets/tp/s28u.jpg',
    ispPinoutUrl: '/assets/isp/s28u.jpg',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'Knox v5',
    repairPipeline: ['RPMB Provisioning', 'Secure Vault Reset', 'Knox Bit Patching', 'UFS 5.0 Controller Reinit']
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    codename: 'eureka',
    soc: 'Snapdragon 8 Gen 3',
    hwid: '0x001F3001',
    storageType: 'UFS 4.0',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'Knox v5',
    repairPipeline: ['EDL Auth Bypass', 'NVRAM Restore', 'KG State Fix']
  },
  {
    brand: 'Xiaomi',
    model: '14 Ultra',
    codename: 'aurora',
    soc: 'Snapdragon 8 Gen 3',
    hwid: '0x001B4023',
    storageType: 'UFS 4.0',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'TEE-v6',
    repairPipeline: ['Xiaomi Auth Exchange', 'HyperOS Unlocking', 'Baseband Patch']
  },
  {
    brand: 'Xiaomi',
    model: 'Mi 18 Ultra',
    codename: 'titan-pro',
    soc: 'Snapdragon 8 Gen 6',
    hwid: '0x001B40A1',
    storageType: 'UFS 4.0',
    testPointUrl: '/assets/tp/mi18u.jpg',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'TEE-v6',
    repairPipeline: ['Auth Server Token Exchange', 'Kernel Integrity Attestation', 'FBE v4 Decryption', 'NVRAM Calibration']
  },
  {
    brand: 'Apple',
    model: 'iPhone 19 Pro Max',
    codename: 'iPhone19,2',
    soc: 'A19 Pro (2nm Node)',
    hwid: '0x0000A190',
    storageType: 'UFS 4.0',
    loaderType: 'PAC',
    authRequired: true,
    securityEcosystem: 'SEP-Gen4',
    repairPipeline: ['Neural Engine Sync', 'FaceID Module Handshake', 'NAND Paring Protocol', 'SEP Bootrom Patching']
  },
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    codename: 'iPhone16,1',
    soc: 'A17 Pro',
    hwid: '0x00008125',
    storageType: 'UFS 3.1',
    loaderType: 'PAC',
    authRequired: true,
    securityEcosystem: 'SEP-Gen4',
    repairPipeline: ['DFU Restore', 'GSMA Check', 'NAND Health Scan']
  },
  {
    brand: 'Google',
    model: 'Pixel 13 Pro',
    codename: 'nebula',
    soc: 'Google Tensor G7',
    hwid: '0x00000045',
    storageType: 'UFS 4.0',
    loaderType: 'FIREHOSE',
    authRequired: false,
    securityEcosystem: 'Titan-M4',
    repairPipeline: ['Titan M4 Root-of-Trust Handshake', 'AVB 3.0 Verification', 'Deep Partition Trace', 'Kernel Recovery']
  },
  {
    brand: 'Google',
    model: 'Pixel 8 Pro',
    codename: 'husky',
    soc: 'Google Tensor G3',
    hwid: '0x00000032',
    storageType: 'UFS 3.1',
    loaderType: 'FIREHOSE',
    authRequired: false,
    securityEcosystem: 'Titan-M4',
    repairPipeline: ['Userdata Decrypt', 'Fastboot Sideload', 'IMEI Verification']
  },
  {
    brand: 'OnePlus',
    model: '16 Pro',
    codename: 'oxygen-max',
    soc: 'Snapdragon 8 Gen 5',
    hwid: '0x001C5B99',
    storageType: 'UFS 4.0',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'StrongBox',
    repairPipeline: ['Fastboot Unlock Authority', 'EFS/Modem Rebuild', 'Persist Partition Repair', 'Widevine L1 Provisioning']
  },
  {
    brand: 'Oppo',
    model: 'Find X10 Pro',
    codename: 'x10pro',
    soc: 'Snapdragon 8 Gen 6',
    hwid: '0x001D4452',
    storageType: 'UFS 5.0',
    loaderType: 'FIREHOSE',
    authRequired: true,
    securityEcosystem: 'TEE-v6',
    repairPipeline: ['SuperVOOC Calib', 'NVRAM PQC Repair', 'EDL Firehose V4']
  },
  {
    brand: 'Huawei',
    model: 'Mate 80 Pro',
    codename: 'harmony-edge',
    soc: 'Kirin 9200 (Quantum-Enhanced)',
    hwid: '0x002E7781',
    storageType: 'UFS 5.0',
    loaderType: 'DA',
    authRequired: true,
    securityEcosystem: 'StrongBox',
    repairPipeline: ['HarmonyOS Global Patch', 'Kirin Auth Token', 'iSIM Profile Sync']
  },
  {
    brand: 'Asus',
    model: 'ROG Phone 12',
    codename: 'diablo',
    soc: 'Snapdragon 8 Gen 5',
    hwid: '0x001F5590',
    storageType: 'UFS 4.0',
    loaderType: 'FIREHOSE',
    authRequired: false,
    securityEcosystem: 'TEE-v6',
    repairPipeline: ['RAW Flashing', 'Thermal Profile Reset', 'Game Engine Optimization']
  }
];

export class ModelSearchService {
  search(query: string): DeviceModelProfile[] {
    const q = query.toLowerCase();
    return GlobalModelDatabase.filter(d => 
      d.brand.toLowerCase().includes(q) || 
      d.model.toLowerCase().includes(q) || 
      d.codename.toLowerCase().includes(q) ||
      d.hwid.toLowerCase().includes(q)
    );
  }

  getProfileByHwid(hwid: string): DeviceModelProfile | undefined {
    return GlobalModelDatabase.find(d => d.hwid.toUpperCase() === hwid.toUpperCase());
  }
}
