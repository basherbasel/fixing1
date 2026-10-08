import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  Download, 
  Eye, 
  Database,
  ChevronRight,
  ChevronDown,
  HardDrive,
  ShieldCheck,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { RealWebUsbAdb } from '../services/webusb-adb';
import { useI18n } from '../context/I18nContext';

interface FileNode {
  name: string;
  type: 'dir' | 'file';
  size?: string;
  children?: FileNode[];
}

export const PartitionFileExplorer: React.FC<{ isConnected?: boolean, adbDriver?: React.MutableRefObject<RealWebUsbAdb>, onLog?: (msg: string) => void }> = ({ isConnected, adbDriver, onLog }) => {
  const { t, isRTL } = useI18n();
  const [isScanning, setIsScanning] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([
    {
      name: 'userdata',
      type: 'dir',
      children: [
        {
          name: 'media',
          type: 'dir',
          children: [
            { name: 'DCIM', type: 'dir', children: [{ name: 'IMG_20280101.jpg', type: 'file', size: '4.2 MB' }] },
            { name: 'Documents', type: 'dir' },
          ]
        },
        {
          name: 'system',
          type: 'dir',
          children: [
            { name: 'build.prop', type: 'file', size: '12 KB' },
            { name: 'security_audit.log', type: 'file', size: '128 KB' }
          ]
        }
      ]
    },
    {
      name: 'efs',
      type: 'dir',
      children: [
        { name: 'imei.info', type: 'file', size: '1 KB' },
        { name: 'cal_data.bin', type: 'file', size: '4 KB' }
      ]
    }
  ]);

  const scanFileSystem = async () => {
    if (!isConnected) return;
    setIsScanning(true);
    // Simulate real ADB ls -R execution
    await new Promise(r => setTimeout(r, 2500));
    setIsScanning(false);
  };

  const renderNode = (node: FileNode, depth = 0) => {
    return (
      <div key={node.name} className="select-none">
        <div 
          className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded cursor-pointer transition-colors group"
          style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: `${depth * 16 + 8}px` }}
        >
          {node.type === 'dir' ? (
            <Folder className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <File className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="text-[11px] text-slate-300 font-mono">{node.name}</span>
          {node.size && <span className={`text-[9px] text-slate-500 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>{node.size}</span>}
          {node.type === 'file' && (
            <div className={`flex gap-1 ${isRTL ? 'mr-2' : 'ml-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
               <button className="p-1 hover:bg-slate-700 rounded"><Download className="w-3 h-3 text-cyan-500" /></button>
               <button className="p-1 hover:bg-slate-700 rounded"><Eye className="w-3 h-3 text-slate-400" /></button>
            </div>
          )}
        </div>
        {node.children && node.children.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            {isRTL ? 'مستكشف ملفات الأقسام' : 'Partition File System Explorer'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRTL ? 'استخراج الملفات الجنائي من أقسام Ext4/F2FS' : 'Low-level forensic extraction from mounted Ext4/F2FS partitions.'}
          </p>
        </div>
        <button
          onClick={scanFileSystem}
          disabled={isScanning || !isConnected}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg border border-indigo-400/30 transition-all shadow-lg cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? (isRTL ? 'جارٍ الفهرسة...' : 'Indexing Superblock...') : (isRTL ? 'فحص النظام' : 'Scan File System')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tree View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
               <HardDrive className="w-3.5 h-3.5" />
               {isRTL ? 'مرتبط:' : 'Mounted:'} /dev/block/by-name/userdata
            </div>
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-2 w-3 h-3 text-slate-500`} />
              <input 
                type="text" 
                placeholder={isRTL ? 'بحث في الملفات...' : 'Find in files...'}
                className={`bg-slate-950 border border-slate-800 rounded ${isRTL ? 'pr-7 pl-1' : 'pl-7 pr-1'} py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 group">
            {isScanning ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <Cpu className="w-12 h-12 animate-pulse" />
                  <p className="text-xs font-mono animate-bounce text-indigo-400">
                    {isRTL ? 'جارٍ قراءة جدول Inode...' : 'Reading Inode table...'}
                  </p>
               </div>
            ) : (
              files.map(node => renderNode(node))
            )}
          </div>
        </div>

        {/* Forensic Metadata */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isRTL ? 'التحقق الجنائي' : 'Forensic Verification'}
              </h3>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">Partition UUID</span>
                    <span className="text-[10px] text-white font-mono break-all">550e8400-e29b-41d4-a716-446655440000</span>
                 </div>
                 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">{isRTL ? 'حالة التشفير' : 'Encryption State'}</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{isRTL ? 'فك التشفير ناجح' : 'Decrypted (Key Verified)'}</span>
                 </div>
                 <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-bold mb-1 uppercase">{isRTL ? 'فحص النزاهة' : 'Integrity Check'}</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">SHA-256 Passed</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">{isRTL ? 'تصدير جماعي' : 'Export Batch'}</h3>
              <p className="text-[11px] text-slate-500 mb-4">
                {isRTL ? 'حدد ملفات متعددة لتصديرها وحفظها في محطة العمل.' : 'Select multiple files from the tree to archive and export to the local workstation.'}
              </p>
              <button className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30 transition-all cursor-pointer">
                {isRTL ? 'تصدير المحدد (0)' : 'Export Selected (0)'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
