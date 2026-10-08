import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
import { Thermometer, Activity, AlertTriangle } from 'lucide-react';
import { RealWebUsbAdb } from '../services/webusb-adb';

interface ThermalMonitorProps {
  adbDriver: React.RefObject<RealWebUsbAdb>;
  isConnected: boolean;
  connectionType: string;
  onLog: (msg: string) => void;
}

interface ThermalData {
  name: string;
  temp: number;
}

export const ThermalMonitor: React.FC<ThermalMonitorProps> = ({
  adbDriver,
  isConnected,
  connectionType,
  onLog
}) => {
  const [data, setData] = useState<ThermalData[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollThermal = async () => {
      if (!isConnected || connectionType !== 'WebUSB ADB' || !adbDriver.current?.connected) {
        setIsPolling(false);
        return;
      }

      try {
        const output = await adbDriver.current.shellCommand('cat /sys/class/thermal/thermal_zone*/temp');
        if (output) {
          const lines = output.split('\n');
          const zones: ThermalData[] = lines.map((line, idx) => {
            const val = parseInt(line.trim(), 10);
            const temp = isNaN(val) ? 0 : (val > 1000 ? val / 1000 : val);
            return {
              name: `Z${idx}`,
              temp: parseFloat(temp.toFixed(1))
            };
          }).filter(z => z.temp > 0 && z.temp < 150);
          
          if (zones.length > 0) {
            setData(zones);
            setIsPolling(true);
            setError(null);
          }
        }
      } catch (err: any) {
        console.error('Thermal polling error:', err);
        if (!err.message?.includes('closed')) {
          setError(err.message || 'Failed to poll sensors');
        }
        setIsPolling(false);
      }
    };

    if (isConnected && connectionType === 'WebUSB ADB') {
      pollThermal();
      interval = setInterval(pollThermal, 2000);
    } else {
      setIsPolling(false);
      setData([]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, connectionType, adbDriver]);

  const getBarColor = (temp: number) => {
    if (temp > 60) return '#f43f5e'; // Rose-500
    if (temp > 45) return '#fbbf24'; // Amber-400
    return '#22d3ee'; // Cyan-400
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className={`w-4 h-4 ${data.some(d => d.temp > 50) ? 'text-rose-400' : 'text-cyan-400'}`} />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            Silicon Thermal Matrix
            {isPolling && (
              <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                ADB LIVE
              </span>
            )}
          </h3>
        </div>
        <Activity className={`w-3.5 h-3.5 ${isPolling ? 'text-emerald-400' : 'text-slate-600'}`} />
      </div>

      <div className="flex-1 min-h-[200px] relative">
        {isConnected && connectionType === 'WebUSB ADB' ? (
          data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff0a' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f1f5f9'
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Bar dataKey="temp" radius={[4, 4, 0, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.temp)} />
                  ))}
                  <LabelList 
                    dataKey="temp" 
                    position="top" 
                    style={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    formatter={(val: any) => `${val}°`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                Synchronizing Sensors...
              </span>
            </div>
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
            <div className="p-3 bg-slate-900 rounded-full border border-slate-800">
              <Thermometer className="w-6 h-6 text-slate-600" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                Interface Standby
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Authorize ADB WebUSB connection to visualize real-time hardware thermal zones.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-rose-950/20 border border-rose-500/20 rounded text-[10px] text-rose-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
        <span>Bus: 0x01 (Thermal)</span>
        <span>Freq: 0.5Hz</span>
      </div>
    </div>
  );
};
