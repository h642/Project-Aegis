import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Heart, 
  ShieldAlert, 
  Zap, 
  Wifi, 
  Battery, 
  Clock, 
  RefreshCw, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Thermometer, 
  Radio, 
  TrendingUp, 
  Sliders, 
  Download,
  Share2,
  BellRing
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { PatientProfile, WearableTelemetry, TelemetryTimeSeriesPoint, HealthAnomalyAlert } from '../types';

interface ContinuousTelemetryViewProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  onEmergencyTrigger: () => void;
}

export const ContinuousTelemetryView: React.FC<ContinuousTelemetryViewProps> = ({
  patient,
  telemetry,
  onEmergencyTrigger,
}) => {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<'heartRate' | 'spo2' | 'hrv' | 'temp'>('heartRate');
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '6h'>('24h');
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);

  // Sample 24-hour time-series data generated from wristband telemetry
  const timeSeriesData: TelemetryTimeSeriesPoint[] = [
    { time: '02:00', heartRate: 62, spo2: 98, hrvMs: 65, tempCelsius: 36.4, accelG: 1.01 },
    { time: '04:00', heartRate: 58, spo2: 97, hrvMs: 72, tempCelsius: 36.3, accelG: 0.98 },
    { time: '06:00', heartRate: 61, spo2: 98, hrvMs: 68, tempCelsius: 36.5, accelG: 1.02 },
    { time: '08:00', heartRate: 78, spo2: 99, hrvMs: 54, tempCelsius: 36.6, accelG: 1.15 },
    { time: '10:00', heartRate: 85, spo2: 98, hrvMs: 48, tempCelsius: 36.7, accelG: 1.28 },
    { time: '12:00', heartRate: 92, spo2: 96, hrvMs: 42, tempCelsius: 36.8, accelG: 1.45, anomaly: 'Tachycardia Spike' },
    { time: '14:00', heartRate: 74, spo2: 98, hrvMs: 58, tempCelsius: 36.6, accelG: 1.10 },
    { time: '16:00', heartRate: 81, spo2: 97, hrvMs: 51, tempCelsius: 36.7, accelG: 1.22 },
    { time: '18:00', heartRate: 88, spo2: 99, hrvMs: 46, tempCelsius: 36.8, accelG: 1.35 },
    { time: '20:00', heartRate: 76, spo2: 98, hrvMs: 60, tempCelsius: 36.5, accelG: 1.08 },
    { time: '22:00', heartRate: 67, spo2: 98, hrvMs: 66, tempCelsius: 36.4, accelG: 1.03 },
    { time: '23:45', heartRate: telemetry.heart_rate_bpm, spo2: telemetry.spo2_percent, hrvMs: 52, tempCelsius: 36.6, accelG: telemetry.accel_g.magnitude },
  ];

  const anomalies: HealthAnomalyAlert[] = [
    {
      id: 'ANOM-102',
      timestamp: '12:04 PM Today',
      severity: 'WARNING',
      metric: 'Heart Rate',
      value: '92 BPM (Resting)',
      threshold: '> 88 BPM',
      clinicalInsight: 'Elevated resting heart rate detected following beta-blocker dose window.',
      actionTaken: 'Caregiver notified via automated Push Alert. Dose timing logged.',
    },
    {
      id: 'ANOM-098',
      timestamp: '04:15 AM Today',
      severity: 'INFO',
      metric: 'SpO2',
      value: '96% Brief Dip',
      threshold: '< 95%',
      clinicalInsight: 'Transient nocturnal SpO2 reduction during REM sleep cycle.',
      actionTaken: 'Monitored without active dispatch. Auto-resolved in 4 minutes.',
    },
    {
      id: 'ANOM-084',
      timestamp: 'Yesterday 09:30 PM',
      severity: 'CRITICAL',
      metric: 'Motion Impact',
      value: `${telemetry.accel_g.magnitude.toFixed(2)} G Impact`,
      threshold: '> 2.2 G',
      clinicalInsight: 'Abrupt vertical displacement and impact deceleration logged by hand band IMU.',
      actionTaken: 'Triggered 20-second vocal check. Patient confirmed safe.',
    },
  ];

  const isLightMode = typeof document !== 'undefined' && document.body.classList.contains('light-theme');

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 border border-slate-300 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              ESP32 HAND BAND ACTIVE
            </span>
            <span className="bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              24/7 CONTINUOUS TELEMETRY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {t('telemetry.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            {t('telemetry.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulatingStream(!isSimulatingStream)}
            className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
              isSimulatingStream
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulatingStream ? 'animate-spin' : ''}`} />
            <span>{isSimulatingStream ? 'Streaming Real-Time' : 'Simulate Stream'}</span>
          </button>

          <button
            onClick={onEmergencyTrigger}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md cursor-pointer transition-all border border-red-500/30"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t('app.sosDispatch')}</span>
          </button>
        </div>
      </div>

      {/* Vitals Quick Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Heart Rate Card */}
        <button
          onClick={() => setActiveMetric('heartRate')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMetric === 'heartRate'
              ? 'bg-red-500/10 border-red-500/50 shadow-md ring-2 ring-red-500/20'
              : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-extrabold uppercase tracking-wider">{t('telemetry.heartRate')}</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{telemetry.heart_rate_bpm}</span>
            <span className="text-xs text-red-600 dark:text-red-400 font-mono font-bold">BPM</span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono block mt-1 font-semibold">{t('telemetry.normal')} (60–95)</span>
        </button>

        {/* SpO2 Blood Oxygen */}
        <button
          onClick={() => setActiveMetric('spo2')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMetric === 'spo2'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-extrabold uppercase tracking-wider">{t('telemetry.spo2')}</span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{telemetry.spo2_percent}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">% SpO2</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono block mt-1 font-semibold">Optimal Saturation</span>
        </button>

        {/* HRV Autonomic Score */}
        <button
          onClick={() => setActiveMetric('hrv')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMetric === 'hrv'
              ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-extrabold uppercase tracking-wider">HRV Stress</span>
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">52</span>
            <span className="text-xs text-indigo-700 dark:text-indigo-400 font-mono font-bold">ms RMSSD</span>
          </div>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-mono block mt-1 font-semibold">Balanced Autonomic Tone</span>
        </button>

        {/* Skin Temperature */}
        <button
          onClick={() => setActiveMetric('temp')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMetric === 'temp'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-extrabold uppercase tracking-wider">Skin Temp</span>
            <Thermometer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">36.6</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">°C</span>
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono block mt-1 font-semibold">Afebrile (36.1–37.2)</span>
        </button>

      </div>

      {/* Main Interactive Time-Series Recharts Area */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>24-Hour Telemetry Trend Curve</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Interactive PPG optical sensor & wristband IMU data stream
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
              <button
                onClick={() => setTimeRange('6h')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${timeRange === '6h' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                6H
              </button>
              <button
                onClick={() => setTimeRange('12h')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${timeRange === '12h' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                12H
              </button>
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${timeRange === '24h' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                24H
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#cbd5e1' : '#334155'} opacity={0.7} />
              <XAxis dataKey="time" stroke={isLightMode ? '#475569' : '#94a3b8'} fontSize={11} tickLine={false} />
              <YAxis stroke={isLightMode ? '#475569' : '#94a3b8'} fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: isLightMode ? '#ffffff' : '#0f172a', borderColor: isLightMode ? '#cbd5e1' : '#334155', borderRadius: '0.75rem', color: isLightMode ? '#0f172a' : '#f8fafc' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />

              {activeMetric === 'heartRate' && (
                <>
                  <ReferenceLine y={90} stroke="#f87171" strokeDasharray="3 3" label={{ value: 'Tachycardia Threshold', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#hrGrad)" />
                </>
              )}

              {activeMetric === 'spo2' && (
                <>
                  <ReferenceLine y={95} stroke="#34d399" strokeDasharray="3 3" label={{ value: 'Min Target SpO2 (95%)', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#spo2Grad)" />
                </>
              )}

              {activeMetric === 'hrv' && (
                <Area type="monotone" dataKey="hrvMs" name="HRV (ms)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#hrvGrad)" />
              )}

              {activeMetric === 'temp' && (
                <Area type="monotone" dataKey="tempCelsius" name="Skin Temp (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#tempGrad)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* AI Anomaly Detection & Hardware Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Anomaly Alerts Stream */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-black text-slate-900 dark:text-white text-base">Automated AI Anomaly Detection Radar</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
              3 LOGGED EVENTS
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div 
                key={anom.id}
                className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      anom.severity === 'CRITICAL' 
                        ? 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/40' 
                        : anom.severity === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/40'
                    }`}>
                      {anom.severity}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">{anom.metric}: {anom.value}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-bold">{anom.timestamp}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <strong className="text-indigo-700 dark:text-indigo-300 font-bold">Clinical Insight:</strong> {anom.clinicalInsight}
                </p>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between shadow-xs">
                  <span><strong>Action:</strong> {anom.actionTaken}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">RESOLVED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hand Band Hardware Diagnostics Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Hardware Strap Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">ESP32-S3 BLE Wrist Module</p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Optical PPG SQI Score</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">98% Crisp Signal</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Skin Contact Lock</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Locked
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">BLE Ping Latency</span>
              <span className="font-extrabold text-indigo-700 dark:text-indigo-400">14 ms</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Battery Level</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Battery className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {telemetry.battery_level}%
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">IMU Accelerometer</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-200">{telemetry.accel_g.magnitude.toFixed(2)} G</span>
            </div>
          </div>

          {/* Overall Health Recovery Score Card */}
          <div className="bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-indigo-950 dark:to-slate-950 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
              Daily Wearable Recovery Index
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">86 / 100</div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              Optimal cardiovascular recovery and sleep stability
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
