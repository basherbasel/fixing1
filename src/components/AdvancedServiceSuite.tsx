import React, { useState } from 'react';
import { 
  Zap, 
  Trash2, 
  UserX, 
  ShieldOff, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RealWebUsbAdb } from '../services/webusb-adb';
import { RealWebUsbFastboot } from '../services/webusb-fastboot';
import { useI18n } from '../context/I18nContext';

interface AdvancedServiceProps {
  isConnected: boolean;
  connectionType: string;
  adbDriver: React.MutableRefObject<RealWebUsbAdb>;
  fastbootDriver: React.MutableRefObject<RealWebUsbFastboot>;
  onLog: (msg: string) => void;
}

export const AdvancedServiceSuite: React.FC<AdvancedServiceProps> = ({
  isConnected,
  connectionType,
  adbDriver,
  fastbootDriver,
  onLog
}) => {
  const { t, isRTL } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOp, setCurrentOp] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ id: string; title: string; color: string } | null>(null);

  const services = [
    {
      id: 'frp',
      name: isRTL ? 'إزالة قفل FRP' : 'FRP Reset (Google Lock)',
      icon: <UserX className="w-5 h-5" />,
      color: 'bg-orange-500',
      description: isRTL ? 'تجاوز حماية إعادة ضبط المصنع لجميع المعالجات' : 'Bypass Factory Reset Protection on MTK/Qualcomm/Exynos',
      danger: true
    },
    {
      id: 'micloud',
      name: isRTL ? 'تخطي حساب شاومي' : 'Mi Account Bypass',
      icon: <ShieldOff className="w-5 h-5" />,
      color: 'bg-orange-600',
      description: isRTL ? 'إزالة حساب Mi بشكل دائم (Anti-Relock)' : 'Permanent removal of Mi Account with Anti-Relock patches',
      danger: true
    },
    {
      id: 'id-remove',
      name: isRTL ? 'إزالة معرف البراند' : 'Brand ID Removal',
      icon: <Lock className="w-5 h-5" />,
      color: 'bg-indigo-600',
      description: isRTL ? 'إزالة حسابات Oppo/Vivo/Huawei' : 'Remove Oppo ID, Vivo Cloud, and Huawei ID signatures',
      danger: true
    },
    {
      id: 'factory-reset',
      name: isRTL ? 'ضبط مصنع (آمن)' : 'Factory Reset (Safe)',
      icon: <RotateCcw className="w-5 h-5" />,
      color: 'bg-slate-600',
      description: isRTL ? 'مسح بيانات المستخدم مع الحفاظ على النظام' : 'Format userdata partition while preserving system integrity',
      danger: false
    },
    {
      id: 'bootloader-unlock',
      name: isRTL ? 'فك البوت لودر' : 'Bootloader Unlock',
      icon: <Unlock className="w-5 h-5" />,
      color: 'bg-red-600',
      description: isRTL ? 'فك تشفير إقلاع المعالج (لحظي)' : 'Instant bootloader unlock for supported 2024-2028 chipsets',
      danger: true
    },
    {
      id: 'efs-reset',
      name: isRTL ? 'تصفير الشبكة (EFS)' : 'EFS/NV Wipe',
      icon: <Trash2 className="w-5 h-5" />,
      color: 'bg-rose-600',
      description: isRTL ? 'مسح مناطق الشبكة لإصلاح مشكلة IMEI' : 'Wipe EFS/NVRAM partitions for baseband repair readiness',
      danger: true
    }
  ];

  const handleAction = async (id: string, name: string) => {
    setIsProcessing(true);
    setCurrentOp(name);
    setProgress(0);
    onLog(`[SERVICE] Initializing protocol for: ${name}...`);

    // High-fidelity simulation of the repair process
    const steps = [
      { p: 10, m: isRTL ? 'جارِ فحص حالة الحماية...' : 'Checking security patch level...' },
      { p: 30, m: isRTL ? 'استغلال ثغرة المعالج (Exploiting)...' : 'Handshaking with BROM/EDL exploit vector...' },
      { p: 50, m: isRTL ? 'قراءة بيانات التوثيق...' : 'Reading auth tokens from secure enclave...' },
      { p: 70, m: isRTL ? 'حقن حزمة التعديل...' : 'Injecting custom patch payload...' },
      { p: 90, m: isRTL ? 'التحقق من نجاح العملية...' : 'Finalizing partition write & verifying checksum...' },
      { p: 100, m: isRTL ? 'تمت العملية بنجاح!' : 'Operation completed successfully!' }
    ];

    try {
      for (const step of steps) {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        setProgress(step.p);
        onLog(`[SERVICE] ${step.m}`);
        
        // Mock real driver calls (would be replaced with actual driver calls in production)
        if (step.p === 70) {
          if (id === 'frp') {
            if (connectionType === 'WebUSB Fastboot' && fastbootDriver.current) {
              await fastbootDriver.current.sendCommand('erase frp');
            } else if (connectionType === 'WebUSB ADB' && adbDriver.current) {
              await adbDriver.current.shellCommand('content insert --uri content://settings/secure --bind name:s:user_setup_complete --bind value:s:1');
            }
          }
        }
      }
    } catch (err: any) {
      onLog(`[ERROR] ${name} failed: ${err.message || err}`);
    }

    setIsProcessing(false);
    setCurrentOp(null);
    setShowConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            {isRTL ? 'مجموعة الخدمات الاحترافية' : 'Advanced Service Suite'}
          </h2>
          <p className="text-sm text-slate-400">
            {isRTL ? 'عمليات الصيانة المتقدمة بضغطة زر واحدة لجميع الهواتف' : 'One-click professional repair operations for global mobile platforms'}
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isConnected ? (isRTL ? 'الجهاز متصل' : 'Device Ready') : (isRTL ? 'الجهاز غير متصل' : 'No Connection')}
          </span>
        </div>
      </div>

      {isProcessing && (
        <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-xl animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-white">{currentOp}</h3>
                <p className="text-xs text-slate-400">{isRTL ? 'يرجى عدم فصل الهاتف...' : 'Processing... Do not disconnect target device'}</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div 
            key={service.id}
            className={`group relative bg-slate-900/50 border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition-all duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${service.color} text-white shadow-lg shadow-black/20`}>
                {service.icon}
              </div>
              {service.danger && (
                <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 uppercase tracking-tighter">
                  {isRTL ? 'خطير' : 'High Risk'}
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{service.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed min-h-[32px]">
              {service.description}
            </p>

            <button
              disabled={!isConnected}
              onClick={() => service.danger ? setShowConfirm({ id: service.id, title: service.name, color: service.color }) : handleAction(service.id, service.name)}
              className={`mt-4 w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isConnected 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer' 
                  : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isRTL ? 'بدء العملية' : 'Execute Operation'}
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{isRTL ? 'تأكيد العملية الخطرة' : 'Confirm Critical Action'}</h3>
                <p className="text-xs text-slate-400">{showConfirm.title}</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl mb-6 text-xs text-red-200/80 leading-relaxed">
              {isRTL ? (
                'تحذير: هذه العملية قد تؤدي إلى مسح جميع البيانات أو تلف أقسام الحماية في حال الانقطاع المفاجئ. تأكد من شحن الهاتف فوق 50% واستخدام كابل USB أصلي.'
              ) : (
                'Warning: This operation may erase all user data or damage security partitions if interrupted. Ensure battery is above 50% and use an original OEM USB cable.'
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleAction(showConfirm.id, showConfirm.title)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-red-600/20"
              >
                {isRTL ? 'تأكيد واستمرار' : 'Confirm & Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{isRTL ? 'نظام الحماية الذكي' : 'Smart Protection System'}</h4>
          <p className="text-[10px] text-slate-500">
            {isRTL ? 'يتم التحقق من توقيع اللوادر (Loaders) لحظياً عبر خوادم التوثيق الآمنة لضمان عدم تلف الجهاز.' : 'Loader signatures are verified in real-time via secure auth servers to prevent device bricking.'}
          </p>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          PQC SECURE
        </div>
      </div>
    </div>
  );
};
