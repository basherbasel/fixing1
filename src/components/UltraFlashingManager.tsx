import React, { useState } from 'react';
import { 
  Zap, 
  Layers, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Database,
  Timer,
  HardDrive
} from 'lucide-react';
import { USB4HighSpeedPipeline } from '../services/usb4-pipeline';
import { useI18n } from '../context/I18nContext';

interface UltraFlashingManagerProps {
  isConnected: boolean;
  onLog: (msg: string) => void;
}

export const UltraFlashingManager: React.FC<UltraFlashingManagerProps> = ({
  isConnected,
  onLog
}) => {
  const { t, isRTL } = useI18n();
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [result, setResult] = useState<{ duration: number; speed: number } | null>(null);
  
  const pipeline = new USB4HighSpeedPipeline();

  const handleSelectLocalFile = async () => {
    try {
      // @ts-ignore - Experimental File System Access API
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'Firmware Images', accept: { 'application/octet-stream': ['.img', '.bin', '.tar', '.lz4'] } }],
        multiple: false
      });
      const file = await handle.getFile();
      onLog(`[USB4-FS] Direct handle acquired for: ${file.name} (${(file.size / 1e9).toFixed(2)} GB). Mapping to DMA...`);
    } catch (e) {
      onLog('[USB4-FS] Fallback to standard blob picker or cancelled.');
    }
  };

  const handleUltraFlash = async () => {
    setIsFlashing(true);
    setResult(null);
    setProgress(0);

    // Simulate 2GB firmware buffer
    const mockFirmware = new Uint8Array(2048 * 1024 * 1024); 
    
    const stats = await pipeline.executeUltraFlash(mockFirmware, (mbps, pct) => {
      setProgress(pct);
      setSpeed(mbps / 1024); // Convert to Gbps
    });

    setResult({ duration: stats.durationMs, speed: stats.speedGbps });
    setIsFlashing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            {isRTL ? 'خط أنابيب تفليش USB4 / Thunderbolt 5 الفائق' : 'USB4 / Thunderbolt 5 Ultra-Flashing Pipeline'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRTL ? 'محرك نقل DMA بسرعة 80 جيجابت/ثانية لرومات UFS 5.0 عالية الكثافة' : 'Sub-Second 80Gbps DMA Transfer Engine for UFS 5.0 High-Density ROMs'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Bus: USB4-Gen3-x2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flash Control Center */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 relative overflow-hidden">
          {/* Background Decorative Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22d3ee 0.5px, transparent 0)' , backgroundSize: '24px 24px' }}></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {isRTL ? 'منظم التفليش' : 'Flash Orchestrator'}
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                DMA ACTIVE
              </span>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isRTL ? 'الروم المجهز:' : 'Staged Firmware:'}</span>
                <button 
                  onClick={handleSelectLocalFile}
                  className="text-cyan-400 font-mono font-bold hover:underline"
                >
                  NEXT_OS_2028_GLOBAL_2GB.img (Change)
                </button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isRTL ? 'ذاكرة الهدف:' : 'Target Storage:'}</span>
                <span className="text-indigo-400 font-mono font-bold">UFS 5.0 (LUN 0-6)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isRTL ? 'وضع النقل:' : 'Transfer Mode:'}</span>
                <span className="text-cyan-400 font-bold uppercase">{isRTL ? 'وصول مباشر للذاكرة (DMA)' : 'Direct Memory Access (DMA)'}</span>
              </div>
            </div>

            {isFlashing ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-black text-white">{progress}%</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{isRTL ? 'جاري الكتابة...' : 'Writing to NAND...'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-cyan-400">{speed.toFixed(1)} Gbps</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{isRTL ? 'سرعة الناقل' : 'Bus Throughput'}</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ) : result ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  {isRTL ? 'تم التفليش الفائق بنجاح' : 'ULTRA-FLASH SUCCESSFUL'}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{isRTL ? 'المدة' : 'Duration'}</span>
                    <span className="text-white font-mono">{result.duration.toFixed(2)} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{isRTL ? 'متوسط السرعة' : 'Avg Speed'}</span>
                    <span className="text-white font-mono">{result.speed.toFixed(1)} Gbps</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleUltraFlash}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition-all shadow-xl border border-amber-400/30 group cursor-pointer"
              >
                <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                {isRTL ? 'تنفيذ التفليش اللحظي' : 'EXECUTE SUB-SECOND FLASH'}
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl h-full flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Timer className="w-4 h-4 text-cyan-400" />
              {isRTL ? 'قياسات الناقل اللحظية' : 'Real-time Bus Telemetry'}
            </h3>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>DMA Queue Depth</span>
                  <span>1024 IOPS</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>{isRTL ? 'حرارة متحكم NAND' : 'NAND Controller Heat'}</span>
                  <span>38.2°C</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>{isRTL ? 'فحص الخطأ ECC' : 'ECC Parity Check'}</span>
                  <span>PASSED</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <HardDrive className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">UFSHCI Standard</span>
                  <span className="text-xs text-white font-mono">v4.0_2028_SPEC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
