/**
 * Sentinel Mobile Studio - Era Bridge Controller (2014 - 2027)
 * Hardware generation analysis, silicon protocol routing, test points & diagnostic guidance.
 */

export type HardwareEra = '2014_2018_LEGACY' | '2019_2023_MODERN' | '2024_2027_NEXTGEN';

export interface SocArchitectureProfile {
  id: string;
  name: string;
  vendor: 'Qualcomm' | 'MediaTek' | 'Samsung' | 'Apple' | 'Unisoc';
  era: HardwareEra;
  eraLabel: string;
  storageStandard: string;
  busProtocol: string;
  loaderType: string;
  partitionScheme: string;
  recommendedCable: string;
  hardwareTestPointGuide: {
    mode: string;
    triggerMethod: string;
    pinoutDetails: string;
    warningNotice: string;
    resistorValue?: string;
  };
  supportedOperations: string[];
  safeVoltageMv: { min: number; max: number; optimal: number };
}

export const SOC_PROFILES_DATABASE: SocArchitectureProfile[] = [
  // 1. Qualcomm Modern / Next-Gen
  {
    id: 'snapdragon_gen_modern',
    name: 'Qualcomm Snapdragon 8 Gen 2 / 8 Gen 3 / 8 Elite (2024-2027)',
    vendor: 'Qualcomm',
    era: '2024_2027_NEXTGEN',
    eraLabel: '2024–2027 Next-Gen Silicon',
    storageStandard: 'UFS 4.0 / UFS 5.0 (Inline Hardware AES-XTS Crypto)',
    busProtocol: 'SAHARA v3 + Firehose XML over USB 3.2 Gen 2 / USB-PD Negotiated',
    loaderType: 'Digitally Signed Firehose ELF (PKHASH locked via OEM eFUSE)',
    partitionScheme: 'Dynamic Partitions (super.img) + Virtual A/B Cow compression',
    recommendedCable: 'USB-C 3.2 Gen 2x2 (100W PD rated, 10Gbps data shielded)',
    hardwareTestPointGuide: {
      mode: 'EDL 9008 (Emergency Download Mode)',
      triggerMethod: 'Short motherboard Test Points (CMD/CLK to GND) or Deep Flash 9008 Cable (D+ to GND pulsed)',
      pinoutDetails: 'Locate TP01 & TP02 near CPU shielding can. Disconnect Li-ion battery rail before shorting to prevent PMIC surge. Plug USB-C, release short after 2 seconds.',
      warningNotice: 'Never short VDD_BOOST or VBAT lines to GND. UFS 4.0 controller requires stable 1.2V core logic rail.',
      resistorValue: 'Zero-ohm direct jumper or 1kΩ pull-down resistor',
    },
    supportedOperations: [
      'Fastbootd Dynamic Partition Flash',
      'EDL 9008 Raw XML Partition Dump',
      'Storage JESD220F UFS Wear Audit',
      'Firmware Boot Image Diagnostic',
      'Radio modemst1/modemst2 Integrity Check',
    ],
    safeVoltageMv: { min: 3100, max: 4350, optimal: 3800 },
  },
  {
    id: 'snapdragon_855_8gen1',
    name: 'Qualcomm Snapdragon 845 / 855 / 865 / 888 / 8 Gen 1 (2019-2023)',
    vendor: 'Qualcomm',
    era: '2019_2023_MODERN',
    eraLabel: '2019–2023 Modern Architecture',
    storageStandard: 'UFS 2.1 / UFS 3.0 / UFS 3.1',
    busProtocol: 'SAHARA v2 + Firehose XML over USB 3.0',
    loaderType: 'OEM Signed prog_firehose_ufs.elf',
    partitionScheme: 'Android 10+ Dynamic Partitions (super.img) / A/B Seamless',
    recommendedCable: 'Standard USB 3.0 Type-A to Type-C shielded cable',
    hardwareTestPointGuide: {
      mode: 'EDL 9008 (QDLoader)',
      triggerMethod: 'Hardware Test Points near RAM stack or EDL 9008 Jig Cable',
      pinoutDetails: 'Ground test point next to eMMC/UFS clock trace with ceramic tweezers. Insert cable, verify Windows Device Manager shows "Qualcomm HS-USB QDLoader 9008".',
      warningNotice: 'Ensure PMIC VDD_IO voltage rail does not drop below 1.7V during Sahara handshake.',
      resistorValue: 'Direct GND jumper',
    },
    supportedOperations: [
      'EDL Firehose Read/Write',
      'Fastboot OEM Unlock & Flash',
      'UFS Health & SLC/MLC Wear Assessment',
      'Modem Calibration Backup',
    ],
    safeVoltageMv: { min: 3200, max: 4200, optimal: 3850 },
  },
  {
    id: 'snapdragon_msm89_legacy',
    name: 'Qualcomm MSM8916 / MSM8937 / MSM8953 / MSM8996 (2014-2018)',
    vendor: 'Qualcomm',
    era: '2014_2018_LEGACY',
    eraLabel: '2014–2018 Legacy Era',
    storageStandard: 'eMMC 4.5 / 5.0 / 5.1',
    busProtocol: 'SAHARA v1 + Firehose rawprogram0.xml',
    loaderType: 'prog_emmc_firehose_89xx.mbn / elf',
    partitionScheme: 'Legacy Flat MBR / GPT Partitions (system, recovery, boot, userdata)',
    recommendedCable: 'High-current Micro-USB 2.0 cable (24 AWG power, 28 AWG data)',
    hardwareTestPointGuide: {
      mode: 'Qualcomm 9008 Emergency Dload',
      triggerMethod: 'Short D+ to GND on Micro-USB connector (EDL cable switch) for 3 seconds during power-up',
      pinoutDetails: 'Pins 2 & 3 / D+ and GND jumper. Alternatively bridge CLK/DAT0 resistor on motherboard PCB.',
      warningNotice: 'eMMC 5.0 chips require 1.8V VCCQ and 3.3V VCC. Verify power lines before applying JTAG/ISP.',
      resistorValue: 'Direct switch short or 910kΩ Samsung cable jig',
    },
    supportedOperations: [
      'Full eMMC Dump via Firehose XML',
      'Fastboot Bootloader Kernel Flashing',
      'JEDEC ext_csd Life Time Estimation',
      'Baseband NVRAM Dump',
    ],
    safeVoltageMv: { min: 3400, max: 4100, optimal: 3800 },
  },

  // 2. MediaTek
  {
    id: 'mtk_dimensity_nextgen',
    name: 'MediaTek Dimensity 9200 / 9300 / 9400+ (2024-2027)',
    vendor: 'MediaTek',
    era: '2024_2027_NEXTGEN',
    eraLabel: '2024–2027 Next-Gen Silicon',
    storageStandard: 'UFS 4.0 (Inline Hardware Encryption Engine)',
    busProtocol: 'Hardware BootROM (BROM) USB Bulk + Secure DA Handshake',
    loaderType: 'MTK Secure Download Agent (DA) with RSA-4096 signature verification',
    partitionScheme: 'Dynamic Partitions (super) + AVB 2.0 vbmeta chaining',
    recommendedCable: 'USB-C to USB-C 3.2 Gen 2 with integrated E-Marker chip',
    hardwareTestPointGuide: {
      mode: 'BROM (Hardware BootROM 0x0E8D:0x0003)',
      triggerMethod: 'Hold [Volume UP + Volume DOWN] while inserting USB-C with powered-off device',
      pinoutDetails: 'If keys fail (hard brick), locate KCOL0 / GND test point on motherboard. Short KCOL0 to chassis ground.',
      warningNotice: 'Dimensity 9000+ uses hardware Watchdog timer (WDT) that auto-resets after 15 seconds if DA handshake is not acknowledged.',
      resistorValue: 'Direct GND jumper',
    },
    supportedOperations: [
      'BROM Hardware Handshake Diagnostic',
      'Preloader DA VCOM Memory Inspector',
      'Fastbootd Dynamic Super Partition Flash',
      'Storage Wear JESD220F Query',
    ],
    safeVoltageMv: { min: 3150, max: 4350, optimal: 3850 },
  },
  {
    id: 'mtk_helio_legacy',
    name: 'MediaTek MT6580 / MT6735 / MT6753 / Helio P10-P60 (2014-2018)',
    vendor: 'MediaTek',
    era: '2014_2018_LEGACY',
    eraLabel: '2014–2018 Legacy Era',
    storageStandard: 'eMMC 5.0 / 5.1',
    busProtocol: 'SP Flash Tool Scatter / UART / BootROM',
    loaderType: 'MTK_AllInOne_DA.bin',
    partitionScheme: 'Legacy Scatter Partition table (boot, recovery, system, cache, userdata)',
    recommendedCable: 'Micro-USB 2.0 with stable 5V / 2A supply',
    hardwareTestPointGuide: {
      mode: 'BROM / Preloader VCOM (0x0E8D:0x2000)',
      triggerMethod: 'Hold [Volume DOWN] while plugging USB with battery inserted',
      pinoutDetails: 'On dead-boot devices, bridge the "TEST" or "VBUS" test point pad to ground.',
      warningNotice: 'Older MTK preloader drivers can cause port flapping (disconnects every 3 seconds) without MTK USB Driver filter installed.',
      resistorValue: 'No resistor needed',
    },
    supportedOperations: [
      'Scatter File Partition Table Verification',
      'Direct DA Memory Read/Write',
      'eMMC ext_csd Register Analysis',
      'NVRAM modemst Partitions Backup',
    ],
    safeVoltageMv: { min: 3300, max: 4100, optimal: 3800 },
  },

  // 3. Samsung Exynos
  {
    id: 'samsung_exynos_modern',
    name: 'Samsung Exynos 2100 / 2200 / 2400 / 2500 (2021-2027)',
    vendor: 'Samsung',
    era: '2024_2027_NEXTGEN',
    eraLabel: 'Modern & Next-Gen Exynos',
    storageStandard: 'UFS 3.1 / UFS 4.0',
    busProtocol: 'LOKE Odin Protocol v3 / Dynamic PIT',
    loaderType: 'Samsung Knox-signed sboot.bin / tzsw',
    partitionScheme: 'Dynamic Partitions (super.img) + Knox eFUSE Warranty Bit [0x0 / 0x1]',
    recommendedCable: 'Original Samsung 5A USB-C to USB-C cable',
    hardwareTestPointGuide: {
      mode: 'LOKE Odin Download Mode',
      triggerMethod: 'Hold [Volume UP + Volume DOWN] simultaneously, then plug USB-C connected to PC',
      pinoutDetails: 'Press Volume UP on turquoise warning screen to confirm Download Mode.',
      warningNotice: 'Check Knox warranty bit status in Odin screen. eFUSE trip (0x1) permanently revokes Knox hardware keystore.',
      resistorValue: '300kΩ Micro-USB Jig (for older models), key combo for modern models',
    },
    supportedOperations: [
      'PIT Partition Information Table Inspection',
      'Odin TAR.MD5 Firmware Flashing',
      'UFS Lifetime Health Analysis',
      'EFS / NV Data Safety Verification',
    ],
    safeVoltageMv: { min: 3300, max: 4350, optimal: 3850 },
  },

  // 4. Apple Silicon
  {
    id: 'apple_a_series',
    name: 'Apple A12 to A18 Pro / M-Series (2018-2027)',
    vendor: 'Apple',
    era: '2024_2027_NEXTGEN',
    eraLabel: 'Apple Silicon & Secure Enclave',
    storageStandard: 'NVMe / Apple Custom Controller',
    busProtocol: 'SecureROM USB DFU (Device Firmware Upgrade) / iBoot Protocol',
    loaderType: 'Apple Signed iBSS / iBEC / TrustCache',
    partitionScheme: 'APFS (Apple File System) with Crypto System Volume (SSV)',
    recommendedCable: 'Certified MFi Lightning to USB-C or Thunderbolt 4 / USB-C',
    hardwareTestPointGuide: {
      mode: 'Apple DFU Mode (0x05AC:0x1227)',
      triggerMethod: 'Hardware Button Timing Sequence (Vol Up -> Vol Down -> Hold Side 10s -> Add Vol Down 5s -> Release Side)',
      pinoutDetails: 'Device screen remains completely BLACK when correctly in DFU mode. If Apple logo appears, timing was missed.',
      warningNotice: 'Secure Enclave Processor (SEP) enforces cryptographic bind between SoC and NAND. NAND replacement requires syscfg serialization.',
      resistorValue: 'DCSD Alex Cable / Magico Diag Cable (for purple mode syscfg operations)',
    },
    supportedOperations: [
      'DFU Handshake & Hardware ID Verification',
      'Recovery Mode Device Telemetry',
      'Battery Cycle Count & Wear Analysis',
      'NAND Controller Protocol Health Check',
    ],
    safeVoltageMv: { min: 3200, max: 4200, optimal: 3820 },
  },

  // 5. Unisoc / Spreadtrum
  {
    id: 'unisoc_tiger',
    name: 'Unisoc Tiger T606 / T612 / T616 / T820 (2020-2027)',
    vendor: 'Unisoc',
    era: '2019_2023_MODERN',
    eraLabel: 'Modern Unisoc Architecture',
    storageStandard: 'eMMC 5.1 / UFS 2.2',
    busProtocol: 'Unisoc Download Protocol (FDL1 / FDL2)',
    loaderType: 'fdl1.bin / fdl2.bin (Spreadtrum Boot Framework)',
    partitionScheme: 'PAC Firmware Standard / Dynamic Partitions',
    recommendedCable: 'Standard USB 2.0 / USB-C Data Cable',
    hardwareTestPointGuide: {
      mode: 'Unisoc SPRD Download Mode',
      triggerMethod: 'Hold [Volume DOWN] or [Volume UP] depending on OEM while connecting USB',
      pinoutDetails: 'On stubborn targets, bridge BOOT_SEL test point to VDD_IO.',
      warningNotice: 'Ensure baud rate negotiation matches (standard 921600 baud for FDL2 transmission).',
      resistorValue: 'Direct jumper',
    },
    supportedOperations: [
      'FDL Handshake Diagnostics',
      'PAC Firmware Chunk Inspector',
      'eMMC / UFS Wear Analysis',
      'PhaseCheck Calibration Data Read',
    ],
    safeVoltageMv: { min: 3250, max: 4250, optimal: 3800 },
  },
];

export class EraBridgeController {
  private profiles = SOC_PROFILES_DATABASE;

  /**
   * Get all registered SoC profiles
   */
  getAllProfiles(): SocArchitectureProfile[] {
    return this.profiles;
  }

  /**
   * Find profile by ID or partial name
   */
  findProfile(identifier: string): SocArchitectureProfile | undefined {
    const idLower = identifier.toLowerCase();
    return this.profiles.find(
      (p) =>
        p.id.toLowerCase() === idLower ||
        p.name.toLowerCase().includes(idLower) ||
        p.vendor.toLowerCase().includes(idLower)
    );
  }

  /**
   * Evaluate hardware bus voltage safety
   */
  evaluateVoltageSafety(voltageMv: number, profile: SocArchitectureProfile): {
    isSafe: boolean;
    status: 'Optimal' | 'Caution' | 'Dangerous';
    message: string;
  } {
    if (voltageMv >= profile.safeVoltageMv.min && voltageMv <= profile.safeVoltageMv.max) {
      const diffFromOptimal = Math.abs(voltageMv - profile.safeVoltageMv.optimal);
      if (diffFromOptimal < 200) {
        return {
          isSafe: true,
          status: 'Optimal',
          message: `Bus voltage (${voltageMv} mV) is within ideal operating window (${profile.safeVoltageMv.optimal} mV nominal).`,
        };
      }
      return {
        isSafe: true,
        status: 'Caution',
        message: `Bus voltage (${voltageMv} mV) is acceptable but near safe boundary limits (${profile.safeVoltageMv.min}-${profile.safeVoltageMv.max} mV).`,
      };
    }

    return {
      isSafe: false,
      status: 'Dangerous',
      message: `CRITICAL: Voltage rail (${voltageMv} mV) out of silicon bounds (${profile.safeVoltageMv.min}-${profile.safeVoltageMv.max} mV). Halting hardware bus to prevent PMIC damage.`,
    };
  }

  /**
   * Generate interactive guidance text for technician
   */
  getTechnicianGuidance(profile: SocArchitectureProfile, operation: string): {
    summary: string;
    steps: string[];
    cables: string;
    cautions: string[];
  } {
    return {
      summary: `Protocol [${operation}] targeted for ${profile.name} (${profile.eraLabel}). Hardware storage standard: ${profile.storageStandard}.`,
      steps: [
        `Step 1: Verify workbench grounding (ESD protection). Inspect battery charge (>50%) or set external lab bench power to ${profile.safeVoltageMv.optimal} mV.`,
        `Step 2: Utilize recommended hardware conduit: ${profile.recommendedCable}.`,
        `Step 3: Trigger ${profile.hardwareTestPointGuide.mode}: ${profile.hardwareTestPointGuide.triggerMethod}.`,
        `Step 4: ${profile.hardwareTestPointGuide.pinoutDetails}`,
        `Step 5: Handshake with silicon via ${profile.busProtocol}. Validate ${profile.loaderType}.`,
      ],
      cables: profile.recommendedCable,
      cautions: [
        profile.hardwareTestPointGuide.warningNotice,
        `Storage protocol architecture: ${profile.partitionScheme}. Ensure critical radio partitions are preserved.`,
      ],
    };
  }
}
