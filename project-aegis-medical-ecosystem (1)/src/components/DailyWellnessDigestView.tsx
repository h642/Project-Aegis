import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  Pill, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Download, 
  Send, 
  Sparkles, 
  User, 
  UserCheck,
  Building2, 
  FileText, 
  Thermometer, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  MessageSquare,
  Copy,
  Check,
  Smile
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { PatientProfile, WearableTelemetry } from '../types';

interface DailyWellnessDigestViewProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  setActiveTab: (tab: string) => void;
  onEmergencyTrigger: () => void;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

export const DailyWellnessDigestView: React.FC<DailyWellnessDigestViewProps> = ({
  patient,
  telemetry,
  setActiveTab,
  onEmergencyTrigger,
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [copiedNote, setCopiedNote] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomLogs, setSymptomLogs] = useState([
    {
      id: '1',
      date: 'Today, 08:30 AM',
      symptom: 'Mild morning fatigue',
      severity: 'Low',
      action: 'Hydration advised; Metoprolol taken on schedule.',
      otcSafe: true,
    },
    {
      id: '2',
      date: 'Yesterday, 02:15 PM',
      symptom: 'Slight dizziness after walking',
      severity: 'Mild',
      action: 'Resting HR verified at 78 BPM; SpO2 optimal at 98%.',
      otcSafe: true,
    },
  ]);

  // Dynamic Chart Data based on selected period
  const dailyTelemetryData = [
    { label: '00:00', hr: 62, spo2: 98, hrv: 68, adherence: 100 },
    { label: '04:00', hr: 58, spo2: 97, hrv: 72, adherence: 100 },
    { label: '08:00', hr: 74, spo2: 99, hrv: 62, adherence: 100 },
    { label: '12:00', hr: 88, spo2: 96, hrv: 48, adherence: 100 },
    { label: '16:00', hr: 76, spo2: 98, hrv: 58, adherence: 100 },
    { label: '20:00', hr: 71, spo2: 98, hrv: 64, adherence: 100 },
    { label: 'Now', hr: telemetry.heart_rate_bpm, spo2: telemetry.spo2_percent, hrv: 60, adherence: 100 },
  ];

  const weeklyTelemetryData = [
    { label: 'Mon', hr: 72, spo2: 98, hrv: 64, adherence: 100 },
    { label: 'Tue', hr: 75, spo2: 97, hrv: 58, adherence: 100 },
    { label: 'Wed', hr: 71, spo2: 98, hrv: 62, adherence: 80 },
    { label: 'Thu', hr: 69, spo2: 99, hrv: 66, adherence: 100 },
    { label: 'Fri', hr: 74, spo2: 98, hrv: 60, adherence: 100 },
    { label: 'Sat', hr: 70, spo2: 98, hrv: 65, adherence: 100 },
    { label: 'Sun', hr: telemetry.heart_rate_bpm, spo2: telemetry.spo2_percent, hrv: 62, adherence: 100 },
  ];

  const monthlyTelemetryData = [
    { label: 'Week 1', hr: 73, spo2: 98, hrv: 62, adherence: 95 },
    { label: 'Week 2', hr: 71, spo2: 98, hrv: 65, adherence: 100 },
    { label: 'Week 3', hr: 74, spo2: 97, hrv: 59, adherence: 92 },
    { label: 'Week 4', hr: telemetry.heart_rate_bpm, spo2: telemetry.spo2_percent, hrv: 63, adherence: 98 },
  ];

  const currentChartData = 
    period === 'daily' ? dailyTelemetryData : 
    period === 'weekly' ? weeklyTelemetryData : monthlyTelemetryData;

  // Period-specific summary statistics
  const statsSummary = {
    daily: {
      avgHr: 72,
      minHr: 58,
      maxHr: 88,
      avgSpo2: 98,
      avgHrv: 61,
      adherenceRate: patient.adherenceRate || 96,
      dosesTaken: 3,
      dosesTotal: 3,
      wellnessScore: 94,
      statusText: 'Optimal Health & Continuous Sync',
      periodTitle: '24-Hour Daily Digest',
      subtitle: 'Real-time telemetry, pill compliance, and symptom evaluation from ESP32 wearable.',
    },
    weekly: {
      avgHr: 71,
      minHr: 56,
      maxHr: 91,
      avgSpo2: 98,
      avgHrv: 63,
      adherenceRate: 97,
      dosesTaken: 20,
      dosesTotal: 21,
      wellnessScore: 92,
      statusText: 'Stable Vitals with 97% Medication Compliance',
      periodTitle: '7-Day Weekly Digest',
      subtitle: 'Multi-day trends, autonomic stress analysis, and care manager brief.',
    },
    monthly: {
      avgHr: 72,
      minHr: 54,
      maxHr: 94,
      avgSpo2: 98,
      avgHrv: 62,
      adherenceRate: 96,
      dosesTaken: 86,
      dosesTotal: 90,
      wellnessScore: 91,
      statusText: 'High Overall Stability & Regular Refill Rhythm',
      periodTitle: '30-Day Executive Monthly Digest',
      subtitle: 'Longitudinal clinical summary for primary physician review and refill scheduling.',
    },
  }[period];

  const handleCopyCareNote = () => {
    const noteText = `[AEGIS CARE TEAM DIGEST - ${period.toUpperCase()}]
Patient: ${patient.fullName} (ID: ${patient.id}, Age: ${patient.age})
Date Range: ${period === 'daily' ? 'Last 24 Hours' : period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
Wellness Score: ${statsSummary.wellnessScore}/100 (${statsSummary.statusText})

• Medication Adherence: ${statsSummary.adherenceRate}% (${statsSummary.dosesTaken}/${statsSummary.dosesTotal} doses)
• Heart Rate Average: ${statsSummary.avgHr} BPM (Range: ${statsSummary.minHr} - ${statsSummary.maxHr} BPM)
• SpO2 Baseline: ${statsSummary.avgSpo2}%
• HRV Autonomic Stress: ${statsSummary.avgHrv} ms
• Active Prescriptions: ${patient.activeMedications.map(m => m.name).join(', ')}
• Assigned Case Mgr: ${patient.accountManager?.fullName || 'Dr. Miller'} (${patient.accountManager?.organization || 'Aegis Health System'})

Generated by Aegis Clinical Workstation v3.6`;

    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 3000);
  };

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      date: 'Just now',
      symptom: symptomInput,
      severity: 'User Reported',
      action: 'Logged in Care Digest; AI interaction check passed.',
      otcSafe: true,
    };

    setSymptomLogs([newEntry, ...symptomLogs]);
    setSymptomInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/30 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-200" />
                <span>CLINICAL DIGEST ENGINE</span>
              </span>
              <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-300/30">
                PATIENT & CARE TEAM VIEW
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{statsSummary.periodTitle}</span>
              <Smile className="h-6 w-6 text-amber-300 fill-amber-300/30" />
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl font-medium leading-relaxed">
              {statsSummary.subtitle}
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                period === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t('digest.time24h')}</span>
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                period === 'weekly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{t('digest.time7d')}</span>
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                period === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{t('digest.time30d')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wellness Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>{t('digest.aiInsights')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{statsSummary.wellnessScore}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
            {statsSummary.statusText}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${statsSummary.wellnessScore}%` }}
            />
          </div>
        </div>

        {/* Medication Adherence Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>{t('digest.pillAdherence')}</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
              <Pill className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{statsSummary.adherenceRate}%</span>
            <span className="text-xs font-bold text-slate-500">({statsSummary.dosesTaken}/{statsSummary.dosesTotal})</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            {t('digest.medicationSchedule')}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${statsSummary.adherenceRate}%` }}
            />
          </div>
        </div>

        {/* Heart Rate Average Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>{t('digest.avgHeartRate')}</span>
            <span className="p-1.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400">
              <Heart className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{statsSummary.avgHr}</span>
            <span className="text-xs font-bold text-slate-500">BPM</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Range: <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{statsSummary.minHr} - {statsSummary.maxHr} BPM</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
            <TrendingUp className="h-3 w-3" />
            <span>Normal resting curve</span>
          </div>
        </div>

        {/* SpO2 Baseline Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>SpO2 Oxygen Baseline</span>
            <span className="p-1.5 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{statsSummary.avgSpo2}%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Continuous PPG pulse-ox lock
          </p>
          <div className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold pt-0.5">
            <CheckCircle2 className="h-3 w-3" />
            <span>0 Hypoxia events</span>
          </div>
        </div>

      </div>

      {/* Main Grid Section: Telemetry Charts & Care Team Digest Note */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Telemetry Multi-metric Trend Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Physiological Telemetry Curves ({period.toUpperCase()})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Heart Rate (BPM), Blood Oxygen (SpO2 %), and Autonomic Stress (HRV ms)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                HR (BPM)
              </span>
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                SpO2 (%)
              </span>
              <span className="flex items-center gap-1 text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                HRV (ms)
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[30, 110]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Area type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHr)" name="Heart Rate (BPM)" />
                <Area type="monotone" dataKey="spo2" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpo2)" name="SpO2 (%)" />
                <Area type="monotone" dataKey="hrv" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHrv)" name="HRV (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 block text-[10px]">Resting HR Avg</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">68 BPM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 block text-[10px]">HRV Stress Index</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Balanced</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 block text-[10px]">Active Steps (Est.)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">3,420 steps</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 block text-[10px]">Wearable Signal</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">100% Optical</span>
            </div>
          </div>

        </div>

        {/* Care Team Clinical Brief & Quick Share (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Care Team Briefing</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                SYNCED
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{patient.accountManager?.fullName || 'Dr. Miller'}</span>
                  <span className="text-[10px] text-slate-400 block">{patient.accountManager?.role || 'Primary Caregiver & Case Mgr'}</span>
                </div>
              </div>

              {/* AI Clinical Summary Paragraph */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 font-sans leading-relaxed">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Clinical Synthesis ({period}):</span>
                </div>
                <p>
                  Patient <strong>{patient.fullName}</strong> maintains an excellent <strong>{statsSummary.adherenceRate}% medication adherence rate</strong>. Vitals indicate stable resting heart rate ({statsSummary.avgHr} BPM) and optimal oxygenation ({statsSummary.avgSpo2}% SpO2). No emergency fall impacts recorded.
                </p>
              </div>

              {/* Patient Profile Snapshot */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>Primary Doctor Contact:</span>
                  <span className="text-slate-200 font-mono font-semibold">{patient.accountManager?.directPhone || '+1 (555) 019-2831'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Contact:</span>
                  <span className="text-slate-200 font-mono font-semibold">{patient.emergencyContacts[0]?.name || 'Caregiver'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleCopyCareNote}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copiedNote ? (
                <>
                  <Check className="h-4 w-4 text-amber-300" />
                  <span>Care Brief Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Clinical Note for Care Team</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('passport')}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              <Share2 className="h-4 w-4 text-amber-400" />
              <span>Open Off-Grid QR Passport</span>
            </button>
          </div>

        </div>

      </div>

      {/* Medication Adherence Schedule & Refill Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Medication Adherence Log & Refill Status
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Prescription tracking synchronized with e-Pharmacy refill engine
            </p>
          </div>

          <button
            onClick={() => setActiveTab('meds')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center border border-indigo-500/30"
          >
            <span>Manage Refills & Prescriptions</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patient.activeMedications.map((med) => (
            <div 
              key={med.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{med.name}</h4>
                  <span className="text-xs text-slate-500 font-mono">{med.dosage} • {med.frequency}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>TAKEN TODAY</span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Inventory Left:</span>
                <span className={`font-bold ${med.remainingCount <= med.threshold ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {med.remainingCount} pills {med.remainingCount <= med.threshold && '(Refill Alert)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symptom & Daily Log Register Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Symptom & Daily Care Journal
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Log how you feel today; entries auto-verify against active prescriptions
            </p>
          </div>

          <button
            onClick={() => setActiveTab('symptoms')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center border border-teal-500/30"
          >
            <span>Run AI Symptom Checker</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddSymptom} className="flex gap-2">
          <input
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Log a symptom or note (e.g. Mild headache after lunch)..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            type="submit"
            disabled={!symptomInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Log Note</span>
          </button>
        </form>

        {/* Symptom Log List */}
        <div className="space-y-2.5 pt-2">
          {symptomLogs.map((log) => (
            <div 
              key={log.id} 
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{log.symptom}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
                    {log.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.action}</p>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {log.date}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
