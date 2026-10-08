import React, { useState } from 'react';
import { Cpu, Zap, Layers, Eye, Thermometer, ShieldCheck, CheckCircle2, AlertCircle, Crosshair } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

interface ChipProfile {
  id: string;
  name: string;
  chipType: 'CPU' | 'PMIC' | 'RAM_UFS' | 'BASEBAND_MODEM';
  pinCount: number;
  ballSizeMm: number;
  pitchMm: number;
  solderAlloy: 'SAC305 (217°C)' | 'Sn42Bi58 (138°C)' | 'Sn63Pb37 (183°C)';
  packageSize: string;
  gridRows: number;
  gridCols: number;
  criticalPins: { row: number; col: number; name: string; type: 'VCC' | 'GND' | 'DATA' | 'CLK' | 'RESET'; voltage: string }[];
}

const CHIP_PROFILES: ChipProfile[] = [
  {
    id: 'qualcomm-sm8550',
    name: 'Qualcomm Snapdragon 8 Gen 2 (SM8550-AB)',
    chipType: 'CPU',
    pinCount: 1540,
    ballSizeMm: 0.25,
    pitchMm: 0.35,
    solderAlloy: 'SAC305 (217°C)',
    packageSize: '14.0 x 12.5 mm BGA',
    gridRows: 12,
    gridCols: 12,
    criticalPins: [
      { row: 1, col: 1, name: 'VDD_CPU_0.75V', type: 'VCC', voltage: '0.75V DC' },
      { row: 1, col: 2, name: 'VDD_CPU_0.75V', type: 'VCC', voltage: '0.75V DC' },
      { row: 2, col: 3, name: 'GND_CORE', type: 'GND', voltage: '0.00V' },
      { row: 3, col: 4, name: 'UFS_HS_GEAR4_TX_P', type: 'DATA', voltage: '1.20V P-P' },
      { row: 3, col: 5, name: 'UFS_HS_GEAR4_TX_N', type: 'DATA', voltage: '1.20V P-P' },
      { row: 4, col: 4, name: 'SPMI_CLK', type: 'CLK', voltage: '1.80V' },
      { row: 5, col: 6, name: 'PMIC_PON_RESET_N', type: 'RESET', voltage: '1.80V High' },
      { row: 6, col: 6, name: 'VDD_LPDDR5X_1.1V', type: 'VCC', voltage: '1.10V DC' },
    ]
  },
  {
    id: 'pmic-pm8550',
    name: 'Qualcomm Power Management IC (PM8550)',
    chipType: 'PMIC',
    pinCount: 220,
    ballSizeMm: 0.30,
    pitchMm: 0.40,
    solderAlloy: 'SAC305 (217°C)',
    packageSize: '6.5 x 6.0 mm WLCSP',
    gridRows: 8,
    gridCols: 8,
    criticalPins: [
      { row: 1, col: 1, name: 'VBAT_SENSE_IN', type: 'VCC', voltage: '3.80V - 4.40V' },
      { row: 1, col: 2, name: 'VSYS_BUCK_OUT', type: 'VCC', voltage: '3.80V' },
      { row: 2, col: 2, name: 'GND_PAD', type: 'GND', voltage: '0.00V' },
      { row: 3, col: 3, name: 'LDO1_1.8V_ALWAYS', type: 'VCC', voltage: '1.80V' },
      { row: 4, col: 5, name: 'SCL_I2C_PMIC', type: 'CLK', voltage: '1.80V' },
      { row: 5, col: 5, name: 'SDA_I2C_PMIC', type: 'DATA', voltage: '1.80V' },
    ]
  },
  {
    id: 'ufs-samsung-k3kl',
    name: 'Samsung UFS 4.0 + LPDDR5X PoP Stack',
    chipType: 'RAM_UFS',
    pinCount: 315,
    ballSizeMm: 0.20,
    pitchMm: 0.30,
    solderAlloy: 'Sn42Bi58 (138°C)',
    packageSize: '11.5 x 13.0 mm PoP',
    gridRows: 10,
    gridCols: 10,
    criticalPins: [
      { row: 1, col: 1, name: 'VCC_UFS_2.8V', type: 'VCC', voltage: '2.80V' },
      { row: 1, col: 2, name: 'VCCQ_UFS_1.2V', type: 'VCC', voltage: '1.20V' },
      { row: 2, col: 2, name: 'GND_UFS', type: 'GND', voltage: '0.00V' },
      { row: 3, col: 4, name: 'UFS_CLK_P', type: 'CLK', voltage: '1.20V' },
    ]
  }
];

export const ChipStencilInspector: React.FC<{ onLog?: (msg: string) => void }> = ({ onLog }) => {
  const { isRTL } = useI18n();
  const [selectedChip, setSelectedChip] = useState<ChipProfile>(CHIP_PROFILES[0]);
  const [hoveredPin, setHoveredPin] = useState<{ row: number; col: number; name: string; type: string; voltage: string } | null>(null);

  const handleSelectChip = (chip: ChipProfile) => {
    setSelectedChip(chip);
    setHoveredPin(null);
    if (onLog) onLog(`[STENCIL-INSPECT] Loaded BGA Stencil map for ${chip.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isRTL ? 'مساعد إعادة صب البال وتفتيش شبلونة BGA Micro-Pin' : 'Interactive Micro-Pin BGA & Stencil Inspection Assistant'}
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                2028 HARDWARE
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? 'خريطة تفاعلية لكرات اللحام وقيم الفولتيات ومخطط الحرارة للمايكرو-آيسي' : 'Interactive ball map, pad voltages, stencil thermal profiles, and BGA reballing metrics'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Thermometer className="w-4 h-4 text-rose-400" />
          <span>Alloy: <strong className="text-purple-300">{selectedChip.solderAlloy}</strong></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chip Selection & Technical Specs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            {isRTL ? 'اختيار الشريحة / الآيسي' : 'Target Integrated Circuit (IC)'}
          </h3>

          <div className="space-y-2">
            {CHIP_PROFILES.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleSelectChip(chip)}
                className={`w-full p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedChip.id === chip.id
                    ? 'bg-purple-500/10 border-purple-500/50 text-slate-100 shadow-md shadow-purple-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-purple-300">{chip.chipType}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                    {chip.pinCount} PINS
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 line-clamp-1">{chip.name}</div>
                <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Pitch: {chip.pitchMm}mm</span>
                  <span>Ball: {chip.ballSizeMm}mm</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed BGA Specs */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-slate-400 text-[11px] font-semibold border-b border-slate-800 pb-2 flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-purple-400" />
              {isRTL ? 'مواصفات الشبلونة بالدقة' : 'BGA Stencil Specifications'}
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Package Dim:</span>
              <span className="text-slate-200">{selectedChip.packageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ball Diameter:</span>
              <span className="text-purple-300">{selectedChip.ballSizeMm} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Grid Pitch:</span>
              <span className="text-purple-300">{selectedChip.pitchMm} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Melting Point:</span>
              <span className="text-rose-400 font-bold">{selectedChip.solderAlloy}</span>
            </div>
          </div>
        </div>

        {/* Interactive BGA Ball Grid Matrix Canvas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200">{selectedChip.name}</h3>
              <p className="text-xs text-slate-400">
                {isRTL ? 'مرّر المؤشر فوق أي كرة لحام للاطلاع على القيمة والوظيفة' : 'Hover over BGA pads to inspect pinout signal, rail voltage, and thermal ground plane'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> VCC</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> GND</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> DATA</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> CLK</span>
            </div>
          </div>

          {/* Interactive Ball Matrix */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center min-h-[300px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedChip.gridCols}, minmax(0, 1fr))` }}>
              {Array.from({ length: selectedChip.gridRows * selectedChip.gridCols }).map((_, idx) => {
                const row = Math.floor(idx / selectedChip.gridCols) + 1;
                const col = (idx % selectedChip.gridCols) + 1;
                const critical = selectedChip.criticalPins.find(p => p.row === row && p.col === col);

                let bgClass = 'bg-slate-800 hover:bg-slate-700 border-slate-700';
                if (critical) {
                  if (critical.type === 'VCC') bgClass = 'bg-rose-500/80 border-rose-400 shadow-sm shadow-rose-500/30';
                  else if (critical.type === 'GND') bgClass = 'bg-emerald-500/80 border-emerald-400 shadow-sm shadow-emerald-500/30';
                  else if (critical.type === 'DATA') bgClass = 'bg-cyan-500/80 border-cyan-400 shadow-sm shadow-cyan-500/30';
                  else if (critical.type === 'CLK') bgClass = 'bg-purple-500/80 border-purple-400 shadow-sm shadow-purple-500/30';
                  else if (critical.type === 'RESET') bgClass = 'bg-amber-500/80 border-amber-400 shadow-sm shadow-amber-500/30';
                }

                return (
                  <button
                    key={idx}
                    onMouseEnter={() => {
                      if (critical) setHoveredPin({ ...critical });
                      else setHoveredPin({ row, col, name: `PAD_${row}_${col}`, type: 'NC / GENERAL', voltage: 'N/A' });
                    }}
                    className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono text-white/90 ${bgClass}`}
                  >
                    {critical ? critical.name.charAt(0) : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hovered Pin Diagnostics Banner */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
            {hoveredPin ? (
              <div className="flex items-center gap-4 text-slate-200">
                <span className="text-purple-400 font-bold">R{hoveredPin.row}-C{hoveredPin.col}</span>
                <span className="text-slate-100 font-semibold">{hoveredPin.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">{hoveredPin.type}</span>
                <span className="text-emerald-400 font-bold">{hoveredPin.voltage}</span>
              </div>
            ) : (
              <span className="text-slate-500 italic">Hover over any BGA pad to display pin signal details...</span>
            )}
            <span className="text-[10px] text-slate-500">2028 MICRO-BGA INSPECTOR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
