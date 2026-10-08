export interface MobileModel {
  brand: string;
  model: string;
  codename: string;
  soc: 'Qualcomm' | 'MediaTek' | 'Samsung Exynos' | 'Unisoc';
  hwid: string;
  loaderType: 'Firehose' | 'DA' | 'Scatter' | 'PAC';
  supportedOps: string[];
}

export const MODEL_DATABASE: MobileModel[] = [
  {
    brand: 'Xiaomi',
    model: 'Redmi Note 12 4G',
    codename: 'tapas',
    soc: 'Qualcomm',
    hwid: '0x001630E1',
    loaderType: 'Firehose',
    supportedOps: ['Flash', 'Bypass Auth', 'EFS Reset', 'Read Dump', 'FRP Remove']
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    codename: 'dm3q',
    soc: 'Qualcomm',
    hwid: '0x001920E1',
    loaderType: 'Firehose',
    supportedOps: ['Firmware Flash', 'CSC Change', 'Read Pit', 'FRP Reset']
  },
  {
    brand: 'Oppo',
    model: 'Reno 10 Pro',
    codename: 'cph2525',
    soc: 'MediaTek',
    hwid: '0x0766',
    loaderType: 'DA',
    supportedOps: ['Format', 'Safe Format', 'Oppo ID Bypass', 'Repair IMEI']
  },
  {
    brand: 'Vivo',
    model: 'V27 5G',
    codename: 'v2231',
    soc: 'MediaTek',
    hwid: '0x0811',
    loaderType: 'DA',
    supportedOps: ['MTK Auth Bypass', 'Read Flash', 'Write Flash', 'RPMB Clean']
  },
  {
    brand: 'Realme',
    model: 'GT Neo 5',
    codename: 'rmx3708',
    soc: 'Qualcomm',
    hwid: '0x001470E1',
    loaderType: 'Firehose',
    supportedOps: ['Flash', 'Bypass EDL Auth', 'NV Edit', 'Unbrick']
  }
];
