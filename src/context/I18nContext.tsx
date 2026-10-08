import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation & General
  appTitle: { en: 'NEXUS-X QUANTUM REPAIR OS', ar: 'نظام نيكسوس إكس لإصلاح الكم' },
  appSubtitle: { en: 'Edge AI Diagnostics, USB4 Ultra-Flashing & PQC Security Ecosystem', ar: 'تشخيصات الذكاء الاصطناعي، تفليش USB4 الفائق، ونظام الأمان الكمي' },
  vision2028: { en: '2028 VISION v5.0', ar: 'رؤية 2028 الإصدار 5.0' },
  dashboard: { en: 'Lab Dashboard', ar: 'لوحة التحكم' },
  eraBridge: { en: 'Era Bridge & Pinouts', ar: 'جسر العصر والمخططات' },
  telemetry: { en: 'Hardware Telemetry', ar: 'القياسات الحيوية للعتاد' },
  aiDiag: { en: 'AI Edge Diagnostics', ar: 'تشخيصات الذكاء الاصطناعي' },
  digitalTwin: { en: 'Interactive Digital Twin', ar: 'التوأم الرقمي التفاعلي' },
  pqcSecurity: { en: 'PQC Security Guard', ar: 'حارس الأمن الكمي' },
  isimRepair: { en: 'iSIM / eUICC Manager', ar: 'مدير iSIM / eUICC' },
  ultraFlash: { en: 'USB4 Ultra-Flash', ar: 'تفليش USB4 الفائق' },
  services: { en: 'Advanced Service Suite', ar: 'مجموعة الخدمات المتقدمة' },
  pinouts: { en: 'ISP & TP Hardware Guide', ar: 'دليل الهاردوير و ISP' },
  forensics: { en: 'Forensic File Explorer', ar: 'مستكشف الملفات الجنائي' },
  network: { en: 'Cellular & Baseband RF', ar: 'الشبكة والترددات اللاسلكية' },
  nvram: { en: 'NVRAM & Calibration', ar: 'الذاكرة العشوائية والمعايرة' },
  fastboot: { en: 'Fastboot & Registers', ar: 'فاست بوت والسجلات' },
  flasher: { en: 'Partition Flashing', ar: 'تفليش الأقسام' },
  backup: { en: 'Partition Dump & A/B', ar: 'نسخ الأقسام و A/B' },
  firmware: { en: 'ROM & Payload Inspector', ar: 'مفتش الروم والحزم' },
  emergency: { en: 'EDL / BROM Handshake', ar: 'مصافحة EDL / BROM' },
  dmesg: { en: 'Live Dmesg & Boot Trace', ar: 'تتبع الإقلاع المباشر' },
  audit: { en: 'Security & RoT Auditor', ar: 'مدقق الأمن وجذر الثقة' },
  storage: { en: 'Storage Health (eMMC/UFS)', ar: 'صحة التخزين' },
  reports: { en: 'Certified Lab Reports', ar: 'تقارير المختبر المعتمدة' },
  // Suite Categories
  softwareControlCenter: { en: 'Software Control Center', ar: 'مركز التحكم في البرمجيات' },
  hardwareDiagnosticCenter: { en: 'Hardware Diagnostic Center', ar: 'مركز تشخيص العتاد' },
  intelligenceCenter: { en: 'Intelligence Center', ar: 'مركز الذكاء والتشخيص' },
  securityNetworkCenter: { en: 'Security & Network Center', ar: 'مركز الأمن والشبكات' },
  systemRepairCenter: { en: 'System Repair Center', ar: 'مركز إصلاح النظام' },
  
  // Connection Status
  connected: { en: 'Connected', ar: 'متصل' },
  disconnected: { en: 'Disconnected', ar: 'غير متصل' },
  connectFastboot: { en: 'Connect Fastboot', ar: 'اتصال فاست بوت' },
  connectAdb: { en: 'Connect ADB', ar: 'اتصال ADB' },
  connectSerial: { en: 'Connect COM / Diag', ar: 'اتصال منفذ الكوم' },
  disconnect: { en: 'Disconnect', ar: 'قطع الاتصال' },
  noDevice: { en: 'No Target Device', ar: 'لا يوجد جهاز مستهدف' },
  
  // Controls
  refresh: { en: 'Refresh', ar: 'تحديث' },
  scan: { en: 'Scan', ar: 'مسح' },
  flash: { en: 'Flash', ar: 'تفليش' },
  backupBtn: { en: 'Backup', ar: 'نسخ احتياطي' },
  wipe: { en: 'Wipe / Reset', ar: 'مسح / ضبط مصنع' },
  unlock: { en: 'Unlock', ar: 'فك الحماية' },
  repair: { en: 'Repair', ar: 'إصلاح' },
  export: { en: 'Export Report', ar: 'تصدير التقرير' },
  
  // Sections
  workstationModules: { en: 'Workstation Modules', ar: 'وحدات محطة العمل' },
  nextGenAI: { en: 'Next-Gen AI Modules (2028)', ar: 'وحدات الذكاء الاصطناعي الجيل القادم' },
  professionalServices: { en: 'Professional Services', ar: 'الخدمات الاحترافية' },
  standardOps: { en: 'Standard Operations', ar: 'العمليات القياسية' },
  hardwareSignature: { en: 'Hardware Signature', ar: 'توقيع العتاد' },
  
  // Common Phrases
  realTimeStatus: { en: 'Real-time status of connected device endpoints', ar: 'حالة نقاط اتصال الجهاز في الوقت الفعلي' },
  safeForFlash: { en: 'Safe for flash routines', ar: 'آمن لعمليات التفليش' },
  batteryVoltage: { en: 'Battery ADC Voltage', ar: 'جهد البطارية ADC' },
  bootloaderLock: { en: 'Bootloader Lock', ar: 'قفل البوت لودر' },
  storageHealth: { en: 'Storage Health Rating', ar: 'تقييم صحة التخزين' },
  lifeRemaining: { en: 'Life Remaining', ar: 'العمر المتبقي' },
  // Professional Additions
  cloudLoaders: { en: 'Cloud Loader Repository', ar: 'مكتبة اللوادر السحابية' },
  driverRepair: { en: 'Smart Driver Utility', ar: 'أداة التعريفات الذكية' },
  smartFix: { en: 'One-Click Smart Fix', ar: 'الإصلاح الذكي بضغطة واحدة' },
  searchPlaceholder: { en: 'Search 15,000+ Models...', ar: 'ابحث في أكثر من 15,000 موديل...' },
  hwidMatch: { en: 'HWID Match Found', ar: 'تم مطابقة معرف العتاد' },
  serverStatus: { en: 'Auth Server Relay', ar: 'سيرفر التوثيق السحابي' },
  latency: { en: 'Cloud Latency', ar: 'تأخير السيرفر' },
  // Visionary Modules
  thermalVision: { en: 'Neural Thermal Vision', ar: 'الرؤية الحرارية العصبية' },
  boardSchematic: { en: 'Interactive BoardView', ar: 'مخطط البورد التفاعلي' },
  spectrumAnalyzer: { en: '6G RF Spectrum Lab', ar: 'مختبر طيف الترددات 6G' },
  autonomousRepair: { en: 'Sentinel AI Agent', ar: 'وكيل الإصلاح الذكي' },
  componentSearch: { en: 'Search Component ID...', ar: 'ابحث عن معرف المكون...' },
  shortDetection: { en: 'Short-Circuit Locator', ar: 'محدد قصر الدائرة' },
  // Hyper-Advanced Modules
  universalHandshake: { en: 'Quantum Protocol Handshake', ar: 'مصافحة البروتوكول الكمي' },
  rfCalibration: { en: '6G/RF Calibration Lab', ar: 'مختبر معايرة الشبكة والتردد' },
  secureVault: { en: 'RPMB & Security Vault', ar: 'خزنة الأمن و RPMB' },
  logicAnalyzer: { en: 'Bus Logic Analyzer (I2C/SPI)', ar: 'محلل منطق الحافلة' },
  osDeepRepair: { en: 'OS Kernel Deep Repair', ar: 'إصلاح عميق لنواة النظام' },
  // Processor Modes
  mtkBrom: { en: 'MTK BROM Mode', ar: 'وضع MTK BROM' },
  qualcommEdl: { en: 'Qualcomm EDL 9008', ar: 'وضع كوالكوم EDL 9008' },
  samsungOdin: { en: 'Samsung Download Mode', ar: 'وضع تحميل سامسونج' },
  appleDfu: { en: 'Apple DFU Mode', ar: 'وضع Apple DFU' },
  unisocDiag: { en: 'Unisoc Diag Protocol', ar: 'بروتوكول Unisoc Diag' },
  // Actions
  rebuildImei: { en: 'Rebuild IMEI / Certificate', ar: 'إعادة بناء IMEI / الشهادة' },
  fixBaseband: { en: 'Fix Baseband Unknown', ar: 'إصلاح النطاق الأساسي' },
  unlockNetwork: { en: 'Unlock Network Carrier', ar: 'فك قفل الشبكة' },
  deepWipe: { en: 'Deep Forensic Wipe', ar: 'مسح جنائي عميق' },
  // 2028 Additions
  ultraFlashing: { en: 'USB4 Sub-Second Flash', ar: 'تفليش USB4 اللحظي' },
  latticeAuth: { en: 'Lattice-Based Auth', ar: 'توثيق قائم على الشبيكات' },
  kernelRecon: { en: 'Kernel Reconstruction', ar: 'إعادة بناء النواة' },
  dmaMapping: { en: 'Direct DMA Mapping', ar: 'تخطيط DMA المباشر' },
  quantumGuard: { en: 'Quantum Intrusion Guard', ar: 'حارس الاختراق الكمي' },
};

interface I18nContextType {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('nexus_lang');
    return (saved as Language) || 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('nexus_lang', language);
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
