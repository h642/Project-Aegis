import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileText, Heart, Activity, ShieldAlert, History, Building2, Calendar, RefreshCw, Printer, Download, Check, Copy } from 'lucide-react';
import { PatientProfile, WearableTelemetry, CriticalEmergencyReportResponse } from '../types';

interface CriticalReportEngineViewProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  onGenerateReport: (historyCount: number) => Promise<CriticalEmergencyReportResponse>;
}

export const CriticalReportEngineView: React.FC<CriticalReportEngineViewProps> = ({
  patient,
  telemetry,
  onGenerateReport,
}) => {
  const { t } = useTranslation();
  const [historyCount, setHistoryCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<CriticalEmergencyReportResponse | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleRunReportGeneration = async (count: number) => {
    setIsLoading(true);
    try {
      const data = await onGenerateReport(count);
      setReportData(data);
    } catch (err) {
      console.error('Failed to generate critical report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const activeVitals = reportData?.immediate_vitals_at_event || {
    heart_rate_bpm: telemetry.heart_rate_bpm,
    spo2_percentage: telemetry.spo2_percent,
    impact_force_g: telemetry.accel_g.magnitude,
    vocal_response_status: telemetry.vocal_confirmation === 0 ? ('UNRESPONSIVE' as const) : ('CONFIRMED_SAFE' as const),
  };

  const clinicalAlerts = reportData?.critical_clinical_alerts || [
    telemetry.vocal_confirmation === 0
      ? 'HIGH-RISK WARNING: Unresponsive Patient post Kinematic Hard-Fall (Vocal Timeout 0).'
      : 'EVALUATION NOTICE: Patient confirmed safe via wearable vocal response.',
    'HIGH-RISK WARNING: Active Warfarin (Coumadin 5mg) Therapy — High Internal Hemorrhage & Bleeding Risk.',
    'CRITICAL ALLERGY WARNING: Severe Anaphylaxis to Penicillin & Derivatives.',
  ];

  const historyList = reportData?.historical_reports_summary || (patient.historicalReports || []).slice(0, historyCount).map((r) => ({
    report_id: r.reportId,
    date: r.date,
    category: r.category,
    key_findings: r.keyFindings,
    facility: r.facility,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('report.title')}
                </h2>
                <span className="bg-red-500/20 text-red-900 dark:text-red-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                  SCHEMA 6
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5 font-medium">
                {t('report.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs shadow-2xs">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold pl-1">History Count:</span>
              {[1, 2, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    setHistoryCount(cnt);
                    handleRunReportGeneration(cnt);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    historyCount === cnt ? 'bg-red-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRunReportGeneration(historyCount)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow-md shadow-red-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating Report...' : 'Compile Live Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP PRIORITY CLINICAL ALERTS BANNER (GOLDEN HOUR ER ADMISSION) */}
      <div className="bg-gradient-to-r from-red-100 via-slate-100 to-red-100 dark:from-red-950 dark:via-slate-900 dark:to-red-950 rounded-xl p-6 border-2 border-red-500/60 shadow-md space-y-3 transition-colors duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-red-300 dark:border-red-800/50">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500 animate-pulse" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
              TOP-LEVEL PRIORITY CLINICAL WARNINGS (GOLDEN HOUR ER PROTOCOL)
            </h3>
          </div>
          <span className="text-xs font-mono font-black text-red-800 dark:text-red-400 bg-red-200/80 dark:bg-red-900/40 border border-red-400 dark:border-red-700/50 px-3 py-1 rounded-full">
            IMMEDIATE ACTION REQUIRED
          </span>
        </div>

        <div className="space-y-2">
          {clinicalAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-red-500/10 dark:bg-red-900/30 p-3 rounded-lg border border-red-300 dark:border-red-800/60 text-xs font-bold text-red-900 dark:text-red-100">
              <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 mt-1.5 animate-ping" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout: Live Vitals vs Active Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Immediate Wearable Vitals at Event */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Immediate Wearable Vitals at Event
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ESP32-S3 Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Impact G-Force</span>
              <span className={`text-xl font-extrabold font-mono ${activeVitals.impact_force_g > 2.5 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {activeVitals.impact_force_g.toFixed(2)} G
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Post-Impact Heart Rate</span>
              <span className={`text-xl font-extrabold font-mono ${activeVitals.heart_rate_bpm > 110 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {activeVitals.heart_rate_bpm} BPM
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Oxygen Saturation (SpO2)</span>
              <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {activeVitals.spo2_percentage}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Vocal Inquiry Status</span>
              <span className={`text-xs font-bold font-mono inline-block mt-1 px-2 py-0.5 rounded ${
                activeVitals.vocal_response_status === 'UNRESPONSIVE'
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {activeVitals.vocal_response_status}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono">
            <span>Patient Summary: </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {reportData?.patient_summary?.full_name || patient.fullName} (ID: {reportData?.patient_summary?.unique_patient_id || patient.id}, {reportData?.patient_summary?.blood_type || patient.bloodGroup})
            </span>
          </div>
        </div>

        {/* Right: Active Medical Profile */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Active Medical Profile & Prescriptions
            </h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              HER/EHR SYNCHRONIZED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Chronic Conditions:</span>
              <ul className="space-y-1.5">
                {(reportData?.active_medical_profile?.chronic_conditions || patient.chronicConditions).map((cond, i) => (
                  <li key={i} className="text-xs text-slate-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Known Severe Allergies:</span>
              <ul className="space-y-1.5">
                {(reportData?.active_medical_profile?.known_allergies || patient.knownAllergies).map((alg, i) => (
                  <li key={i} className="text-xs text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    <span>{alg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Active Prescriptions:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(reportData?.active_medical_profile?.active_prescriptions || patient.activeMedications).map((med, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{med.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{med.dosage} • {'frequency' in med ? (med as any).frequency : 'Daily'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Historical EHR Reports Summary Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Historical Medical Reports Summary (Last {historyList.length} Entries)
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono cursor-pointer"
            >
              {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedJson ? 'Copied JSON' : 'Export Payload JSON'}</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print ER Brief</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {historyList.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded">
                    {item.report_id}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{item.category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.facility}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-1">
                <span className="font-bold text-slate-900 dark:text-white">Key Clinical Findings: </span>
                {item.key_findings}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
