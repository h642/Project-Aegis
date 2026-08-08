import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, RefreshCw, BellRing, CheckCircle, AlertTriangle, Truck, Clock, ShieldCheck, Radio } from 'lucide-react';
import { PatientProfile, MedicationRefillResponse } from '../types';

interface MedicationLogisticsViewProps {
  patient: PatientProfile;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile>>;
  onExecuteMedicationSync: () => Promise<MedicationRefillResponse>;
}

export const MedicationLogisticsView: React.FC<MedicationLogisticsViewProps> = ({
  patient,
  setPatient,
  onExecuteMedicationSync,
}) => {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<MedicationRefillResponse | null>(null);
  const [wearableTriggerMsg, setWearableTriggerMsg] = useState<string | null>(null);

  const handleSyncAndRefill = async () => {
    setIsSyncing(true);
    try {
      const res = await onExecuteMedicationSync();
      setSyncResult(res);
    } catch (err) {
      console.error("Medication sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateTakeDose = (medId: string) => {
    setPatient((prev) => ({
      ...prev,
      activeMedications: prev.activeMedications.map((m) =>
        m.id === medId ? { ...m, remainingCount: Math.max(0, m.remainingCount - 1) } : m
      ),
    }));
    setWearableTriggerMsg(`ESP32-S3 Haptic Confirmation Logged for ${medId}! Remaining count updated.`);
    setTimeout(() => setWearableTriggerMsg(null), 4000);
  };

  const handleSimulateRefillPills = (medId: string) => {
    setPatient((prev) => ({
      ...prev,
      activeMedications: prev.activeMedications.map((m) =>
        m.id === medId ? { ...m, remainingCount: m.remainingCount + 30 } : m
      ),
    }));
    setWearableTriggerMsg(`E-Pharmacy Auto-Refill Batch (+30 pills) received for ${medId}. Inventory restored.`);
    setTimeout(() => setWearableTriggerMsg(null), 4000);
  };

  const handleTriggerWearableChime = (medName: string) => {
    setWearableTriggerMsg(`🔊 Vibrating ESP32-S3 Haptic Motor & Playing 80dB Audible Reminder Chime for ${medName}...`);
    setTimeout(() => setWearableTriggerMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('pharmacy.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t('pharmacy.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAndRefill}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow-md shadow-teal-200 dark:shadow-none transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Hardware & Refills...' : 'Execute Medication Sync (Schema 3)'}</span>
        </button>
      </div>

      {/* Wearable Simulation Notification Toast */}
      {wearableTriggerMsg && (
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl border border-emerald-500/40 shadow-lg flex items-center gap-3 animate-fade-in font-mono text-xs">
          <Radio className="h-5 w-5 text-emerald-400 shrink-0 animate-bounce" />
          <span>{wearableTriggerMsg}</span>
        </div>
      )}

      {/* Adherence Rate & Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Adherence Score Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Long-Term Adherence Score:</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{patient.adherenceRate}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> HIGH COMPLIANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated from 90-day wearable strap dose confirmation timestamps.
          </p>
        </div>

        {/* E-Pharmacy Vendor Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Integrated E-Pharmacy Vendor:</span>
          <div className="my-3 flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">HealthPharm Central & Metro Rx</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Auto-dispatch enabled</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fulfills reorder triggers when remaining count drops below thresholds.
          </p>
        </div>

        {/* Wearable Sync Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Wearable Strap Sync State:</span>
          <div className="my-3 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">ESP32-S3 Haptic Motor</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Last Sync: Just now</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vibrates wrist and plays audible alert at scheduled prescription times.
          </p>
        </div>

      </div>

      {/* Active Prescription Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Active Patient Prescriptions & Stock Inventories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patient.activeMedications.map((med) => {
            const isLow = med.remainingCount <= med.threshold;
            return (
              <div
                key={med.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLow
                    ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-1 ring-amber-300/50'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{med.name}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{med.dosage} • {med.frequency}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    isLow
                      ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    {isLow ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>

                {/* Stock Meter */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Remaining Pills:</span>
                    <span className={`font-bold ${isLow ? 'text-amber-800 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {med.remainingCount} / {med.threshold} threshold
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (med.remainingCount / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
                  <button
                    onClick={() => handleSimulateTakeDose(med.id)}
                    className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-semibold py-1.5 px-3 rounded text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Log Take Dose (-1 pill)</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTriggerWearableChime(med.name)}
                      className="flex-1 bg-teal-100 dark:bg-teal-950 hover:bg-teal-200 dark:hover:bg-teal-900 text-teal-900 dark:text-teal-200 font-medium py-1 px-2 rounded text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <BellRing className="h-3 w-3" />
                      <span>Test Chime</span>
                    </button>

                    <button
                      onClick={() => handleSimulateRefillPills(med.id)}
                      className="flex-1 bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-medium py-1 px-2 rounded text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Truck className="h-3 w-3" />
                      <span>Refill (+30)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Output Schema 3 Box */}
      {syncResult && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Schema 3 Output Payload (Medication Sync & Refill Dispatch):
            </span>
            <span className="text-[10px] text-slate-500 font-mono">status_code: {syncResult.status_code}</span>
          </div>
          <pre className="font-mono text-xs text-emerald-300 overflow-x-auto max-h-56 scrollbar-thin">
            {JSON.stringify(syncResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
