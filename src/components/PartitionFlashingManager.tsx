import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Play, FileCode, HardDrive } from 'lucide-react';
import { ANDROID_STANDARD_PARTITIONS, PartitionDescriptor } from '../types/partitions';

interface PartitionFlashingProps {
  isConnected: boolean;
  isUnlocked: boolean;
  onFlash: (partition: string, fileBytes: Uint8Array, fileName: string) => Promise<void>;
  onLog: (msg: string) => void;
}

export const PartitionFlashingManager: React.FC<PartitionFlashingProps> = ({
  isConnected,
  isUnlocked,
  onFlash,
  onLog
}) => {
  const [selectedPartition, setSelectedPartition] = useState<string>('boot');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [flashProgress, setFlashProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onLog(`[FILE] Loaded image file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

      const buffer = await file.arrayBuffer();
      setFileBytes(new Uint8Array(buffer));
    }
  };

  const handleTriggerFlash = async () => {
    if (!selectedFile || !fileBytes) {
      onLog('[WARN] Please choose an image file (*.img, *.bin) first.');
      return;
    }
    if (!isConnected) {
      onLog('[WARN] No target device connected via WebUSB Fastboot.');
      return;
    }

    setIsProcessing(true);
    setFlashProgress(10);
    try {
      await onFlash(selectedPartition, fileBytes, selectedFile.name);
      setFlashProgress(100);
      onLog(`[SUCCESS] Flash operation completed for partition: ${selectedPartition}`);
    } catch (e: any) {
      onLog(`[ERROR] Flashing halted: ${e.message || e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          Real Partition Flasher & Image Streamer
        </h2>
        <p className="text-xs text-slate-400">
          Streams uncompressed partition binaries directly to mobile flash controller via Fastboot bulk protocol
        </p>
      </div>

      {/* Safety warning */}
      <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl flex items-start gap-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 block">Pre-Flight Flashing Checklist:</span>
          <p className="text-slate-300">
            • Device must be in Fastboot/Bootloader mode with battery &gt; 35%.<br />
            • Flashing requires Bootloader Unlocked state ({isUnlocked ? 'Verified Unlocked' : 'Locked or Inconclusive'}).<br />
            • Radio & calibration partitions (EFS, NVRAM) are locked against destructive overwriting to protect baseband certificates.
          </p>
        </div>
      </div>

      {/* Flashing Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Target Partition Configuration */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Target Partition Destination
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Select Partition:</label>
              <select
                value={selectedPartition}
                onChange={(e) => setSelectedPartition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                {ANDROID_STANDARD_PARTITIONS.filter(p => p.safeToFlash).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} — {p.description.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* File selector */}
            <div>
              <label className="text-slate-400 block mb-1.5 font-medium">Raw Image File (*.img, *.bin):</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-lg p-5 text-center transition-colors bg-slate-950/50">
                <input
                  type="file"
                  id="partition-file-upload"
                  className="hidden"
                  accept=".img,.bin,.sin"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="partition-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                  <span className="text-xs font-medium text-slate-300">
                    {selectedFile ? selectedFile.name : 'Click to select partition image file'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Raw binary block file'}
                  </span>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                disabled={isProcessing || !selectedFile || !isConnected}
                onClick={handleTriggerFlash}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isProcessing || !selectedFile || !isConnected
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                {isProcessing ? 'Streaming Bytes via Fastboot Bulk...' : `Flash Image to '${selectedPartition}'`}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Partition Registry Reference */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Partition Structure Reference
          </h3>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
            {ANDROID_STANDARD_PARTITIONS.map((part) => (
              <div
                key={part.name}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-cyan-400">{part.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      part.safeToFlash
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                        : 'bg-red-950 text-red-300 border border-red-800/40'
                    }`}
                  >
                    {part.safeToFlash ? 'Writable' : 'Protected Calibration'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{part.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
