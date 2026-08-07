import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, ShieldCheck, AlertCircle, RefreshCw, FileCode } from 'lucide-react';
import { PatientProfile, WearableTelemetry, PipelineTrigger } from '../types';

interface ApiSchemaExplorerViewProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
}

export const ApiSchemaExplorerView: React.FC<ApiSchemaExplorerViewProps> = ({
  patient,
  telemetry,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<PipelineTrigger>('EMERGENCY_EVENT');
  const [customSymptoms, setCustomSymptoms] = useState('Severe pressure headache, double vision, and mild nausea.');
  const [isLoading, setIsLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  const handleExecuteRawApi = async () => {
    setIsLoading(true);
    setResponseJson(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/aegis/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: selectedTrigger,
          patientProfile: patient,
          telemetry,
          symptoms: customSymptoms,
        }),
      });

      const data = await res.json();
      const end = performance.now();
      setExecutionTimeMs(Math.round(end - start));
      setResponseJson(data);
    } catch (err: any) {
      setResponseJson({ error: err.message || 'API Call Failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Aegis AI Engine — Raw JSON API Command Console
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct endpoint tester for <span className="font-mono text-emerald-400">/api/aegis/engine</span> with strict JSON schema compliance validation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Workbench (Trigger Selector & Request Config) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileCode className="h-4 w-4 text-indigo-600" />
            Request Parameters Configuration
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Pipeline Trigger (Trigger Parameter):
            </label>
            <div className="space-y-2">
              {[
                { id: 'EMERGENCY_EVENT', label: 'Schema 1: Emergency Triage Pipeline', desc: 'Kinematic fall, PPG stress, vocal timeout' },
                { id: 'SYMPTOM_CHECK', label: 'Schema 2: Symptom & Interaction Analysis', desc: 'Clinical evaluation & allergy/drug checks' },
                { id: 'MEDICATION_SYNC', label: 'Schema 3: Medication Inventory & Refills', desc: 'Adherence score & e-pharmacy triggers' },
                { id: 'PASSPORT_GENERATE', label: 'Schema 4: Emergency Medical Passport', desc: 'Golden hour medical ID payload' },
                { id: 'GET_PATIENT_PROFILE', label: 'Schema 5: Patient & Care Manager Profile', desc: 'Demographics, UUID & assigned account manager' },
                { id: 'GENERATE_CRITICAL_REPORT', label: 'Schema 6: Immediate ER Critical Report', desc: 'Golden-hour ER alerts, vitals & historical reports' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTrigger(item.id as PipelineTrigger)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedTrigger === item.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block font-mono">{item.label}</span>
                  <span className={`text-[11px] block mt-0.5 ${selectedTrigger === item.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTrigger === 'SYMPTOM_CHECK' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Custom Symptoms String:
              </label>
              <input
                type="text"
                value={customSymptoms}
                onChange={(e) => setCustomSymptoms(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="pt-3">
            <button
              onClick={handleExecuteRawApi}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{isLoading ? 'Executing Request...' : 'POST /api/aegis/engine'}</span>
            </button>
          </div>
        </div>

        {/* Right Output Terminal */}
        <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-400 font-bold">JSON API Output Inspector</span>
              </div>

              <div className="flex items-center gap-3">
                {executionTimeMs !== null && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Latency: <span className="text-emerald-400 font-bold">{executionTimeMs} ms</span>
                  </span>
                )}
                <button
                  onClick={handleCopyJson}
                  disabled={!responseJson}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700 text-xs font-mono cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>

            {/* Output Display Area */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs gap-3">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                <span>Processing Aegis AI Pipeline Request...</span>
              </div>
            ) : responseJson ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-300">Schema Validation:</span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] font-bold">
                    VALID STRICT JSON
                  </span>
                </div>
                <pre className="font-mono text-xs text-emerald-300 bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto max-h-[360px] scrollbar-thin">
                  {JSON.stringify(responseJson, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-600 font-mono text-xs space-y-2">
                <Terminal className="h-10 w-10 mx-auto text-slate-700" />
                <p>Select a trigger on the left and click "POST /api/aegis/engine" to view raw JSON response.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Server: Express + Gemini 3.6 Flash / 3.1 Pro Engine</span>
            <span>Content-Type: application/json</span>
          </div>
        </div>

      </div>
    </div>
  );
};
