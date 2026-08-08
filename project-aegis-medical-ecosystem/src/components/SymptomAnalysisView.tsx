import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, CheckCircle, Video, Stethoscope, Search, Pill, ShieldAlert, Sparkles, Mic, MicOff } from 'lucide-react';
import { PatientProfile, SymptomEvaluationResponse } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SymptomAnalysisViewProps {
  patient: PatientProfile;
  onExecuteSymptomCheck: (symptoms: string) => Promise<SymptomEvaluationResponse>;
}

export const SymptomAnalysisView: React.FC<SymptomAnalysisViewProps> = ({
  patient,
  onExecuteSymptomCheck,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomEvaluationResponse | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser. Please type your symptoms.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const quickSymptoms = [
    { label: "Mild Tension Headache", text: "Experiencing a mild dull headache around temples, no fever." },
    { label: "Chest Tightness & Shortness of Breath", text: "Sudden onset of heavy chest pain, pressure, and shortness of breath." },
    { label: "Cough & Congestion", text: "Nasal congestion, mild dry cough, and sinus pressure." },
    { label: "Joint Pain & Fever", text: "Knee arthritis flare-up with mild muscle aching." },
  ];

  const handleRunAnalysis = async (symptomString?: string) => {
    const textToSubmit = symptomString || inputText;
    if (!textToSubmit.trim()) return;

    setIsLoading(true);
    try {
      const response = await onExecuteSymptomCheck(textToSubmit);
      setResult(response);
    } catch (err) {
      console.error("Symptom check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('symptoms.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {t('symptoms.subtitle')}
            </p>
          </div>
        </div>

        {/* Patient Profile Summary Card */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Active Prescriptions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.activeMedications.map((m) => (
                <span key={m.id} className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 font-semibold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {m.name} ({m.dosage})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Known Allergies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.knownAllergies.map((a, i) => (
                <span key={i} className="bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 font-semibold px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                  ⚠️ {a}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Chronic Conditions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.chronicConditions.map((c, i) => (
                <span key={i} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium px-2 py-0.5 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Box & Quick Symptoms */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
          Describe Patient Symptoms or Select a Scenario:
        </label>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickSymptoms.map((qs, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(qs.text);
                handleRunAnalysis(qs.text);
              }}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer font-medium"
            >
              + {qs.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening... Speak your symptoms clearly..." : "Type or speak symptoms here (e.g. 'Experiencing a dull headache and sinus pain for two days...')"}
            className="w-full h-28 p-3.5 pr-12 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute top-3 right-3 p-2 rounded-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-bounce shadow-md shadow-red-500/40'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
            }`}
            title={isListening ? 'Click to stop recording' : 'Dictate symptoms using microphone'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => handleRunAnalysis()}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? 'Running Safety & Interaction Checks...' : 'Analyze Symptoms & Safety'}</span>
          </button>
        </div>
      </div>

      {/* Results Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Aegis Clinical Evaluation Report</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{result.analysis_id}</span>
          </div>

          {/* Severity Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            result.triage_severity === 'IMMEDIATE_ER'
              ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              : result.triage_severity === 'HIGH'
              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {result.triage_severity === 'IMMEDIATE_ER' ? (
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Triage Severity Rating:</span>
                <span className="text-lg font-extrabold">{result.triage_severity}</span>
              </div>
            </div>

            {result.telehealth_escalation.required && (
              <div className="flex items-center gap-2 bg-red-600 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-sm">
                <Video className="h-4 w-4" />
                <span>Telehealth / ER Escalation Flagged</span>
              </div>
            )}
          </div>

          {/* OTC Recommendation & Safety Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OTC Drug Recommendation */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                OTC Medication Recommendation:
              </h4>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Drug Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{result.otc_recommendation.drug_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Recommended Dosage:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{result.otc_recommendation.dosage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Frequency:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{result.otc_recommendation.frequency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety & Contraindication Checklist */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Deterministic Safety Checks:
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Known Allergy Cross-Check:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    result.otc_recommendation.safety_checks.allergy_check_passed
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200'
                  }`}>
                    {result.otc_recommendation.safety_checks.allergy_check_passed ? 'PASSED' : 'ALLERGY WARNING'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Drug-to-Drug Interaction Check:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    result.otc_recommendation.safety_checks.drug_interaction_passed
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200'
                  }`}>
                    {result.otc_recommendation.safety_checks.drug_interaction_passed ? 'NO HAZARDS' : 'HAZARD DETECTED'}
                  </span>
                </div>

                {result.otc_recommendation.safety_checks.contraindications_identified.length > 0 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded text-amber-900 dark:text-amber-200 text-xs">
                    <span className="font-bold block mb-1">Identified Contraindications:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      {result.otc_recommendation.safety_checks.contraindications_identified.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* JSON Output Schema 2 Preview */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl">
            <span className="text-xs font-mono text-emerald-400 font-bold block mb-2">
              Schema 2 Response Output (Symptom & Interaction Analysis):
            </span>
            <pre className="font-mono text-xs text-slate-200 overflow-x-auto max-h-48 scrollbar-thin">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {/* Mandatory AI Healthcare Disclaimer */}
          <div className="bg-slate-100 text-slate-600 p-3 rounded-lg text-xs italic text-center border border-slate-200">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
