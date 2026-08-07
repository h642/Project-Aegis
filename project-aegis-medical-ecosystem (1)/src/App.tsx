import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TriagePipelineView } from './components/TriagePipelineView';
import { HomeOverviewView } from './components/HomeOverviewView';
import { DailyWellnessDigestView } from './components/DailyWellnessDigestView';
import { ContinuousTelemetryView } from './components/ContinuousTelemetryView';
import { SymptomAnalysisView } from './components/SymptomAnalysisView';
import { MedicationLogisticsView } from './components/MedicationLogisticsView';
import { EmergencyPassportView } from './components/EmergencyPassportView';
import { PatientProfileManagerView } from './components/PatientProfileManagerView';
import { CriticalReportEngineView } from './components/CriticalReportEngineView';
import { ApiSchemaExplorerView } from './components/ApiSchemaExplorerView';
import { PatientProfileModal } from './components/PatientProfileModal';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import { supabase } from './lib/supabase';
import { DEFAULT_PATIENT_PROFILE, INITIAL_TELEMETRY } from './data/mockData';
import { 
  PatientProfile, 
  WearableTelemetry, 
  EmergencyTriageResponse, 
  SymptomEvaluationResponse, 
  MedicationRefillResponse, 
  EmergencyPassportResponse, 
  PatientProfileFetchResponse,
  CriticalEmergencyReportResponse,
  PipelineTrigger 
} from './types';
import { AlertTriangle, MapPin, Radio, PhoneCall, ShieldAlert, X, ExternalLink } from 'lucide-react';
import { fetchCurrentGpsLocation, generateMapsUrl } from './utils/locationService';

export default function App() {
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT_PROFILE);
  const [telemetry, setTelemetry] = useState<WearableTelemetry>(INITIAL_TELEMETRY);
  const [activeTab, setActiveTabState] = useState('home');
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<EmergencyTriageResponse | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isSupabaseAuthOpen, setIsSupabaseAuthOpen] = useState(true);

  // Sign Out Handler
  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign Out error:', err);
      }
    }
    setIsPatientModalOpen(false);
    setIsSupabaseAuthOpen(true);
  };

  // Custom Tab Selector with History Stack
  const handleSelectTab = (newTab: string) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTabState(newTab);
    }
  };

  // Back Key Handler
  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((old) => old.slice(0, -1));
      setActiveTabState(prev);
    } else {
      setActiveTabState('home');
    }
  };

  // Theme Toggle Handler
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }, [themeMode]);

  // Initial GPS Location Sync on App Mount
  useEffect(() => {
    fetchCurrentGpsLocation(true).then((loc) => {
      setTelemetry((prev) => ({
        ...prev,
        gps_location: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy || 8,
          timestamp: loc.timestamp,
          is_live: loc.is_live,
          is_cached: loc.is_cached,
          location_name: loc.location_name,
          location_url: loc.location_url,
        },
      }));
    });
  }, []);

  // Supabase Authentication Check on App Startup
  useEffect(() => {
    let isMounted = true;
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          if (meta.medical_profile) {
            setPatient((prev) => ({
              ...prev,
              ...meta.medical_profile,
            }));
          } else if (session.user.email) {
            setPatient((prev) => ({
              ...prev,
              fullName: meta.full_name || prev.fullName,
            }));
          }
        } else {
          // Open Supabase Auth modal when app starts up if not authenticated
          setIsSupabaseAuthOpen(true);
        }
      }).catch((err) => {
        console.warn('Supabase session lookup error on startup:', err);
        setIsSupabaseAuthOpen(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (!session) {
          setIsSupabaseAuthOpen(true);
        } else if (session.user?.user_metadata?.medical_profile) {
          setPatient((prev) => ({
            ...prev,
            ...session.user.user_metadata.medical_profile,
          }));
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Auto open auth modal on startup even in preview mode
      setIsSupabaseAuthOpen(true);
    }
  }, []);

  // Master function to execute API calls against backend /api/aegis/engine
  const executeEngineTrigger = async (
    trigger: PipelineTrigger,
    customTelemetry?: WearableTelemetry,
    customSymptoms?: string
  ): Promise<any> => {
    try {
      const response = await fetch('/api/aegis/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger,
          patientProfile: patient,
          telemetry: customTelemetry || telemetry,
          symptoms: customSymptoms || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`Engine HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // If critical dispatch occurred, popup emergency modal alert overlay
      if (trigger === 'EMERGENCY_EVENT' && data.triage_summary?.emergency_level === 'CRITICAL_EMERGENCY_DISPATCH') {
        setActiveEmergencyAlert(data);
      }

      return data;
    } catch (err) {
      console.error("Execute Engine Trigger failed:", err);
      throw err;
    }
  };

  // Dedicated caller for /api/v1/patient/profile (Schema 5)
  const fetchPatientProfileApi = async (): Promise<PatientProfileFetchResponse> => {
    try {
      const response = await fetch('/api/v1/patient/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          patientProfile: patient,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error("fetchPatientProfileApi failed, falling back to engine:", err);
      return executeEngineTrigger('GET_PATIENT_PROFILE');
    }
  };

  // Dedicated caller for /api/v1/reports/immediate (Schema 6)
  const generateCriticalReportApi = async (historyCount: number = 3): Promise<CriticalEmergencyReportResponse> => {
    try {
      const response = await fetch('/api/v1/reports/immediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          include_history_count: historyCount,
          patientProfile: patient,
          telemetry,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error("generateCriticalReportApi failed, falling back to engine:", err);
      return executeEngineTrigger('GENERATE_CRITICAL_REPORT');
    }
  };

  // SOS Quick Trigger Button Handler
  const handleSosTrigger = async () => {
    // Dynamically retrieve current phone GPS location (with fallback to last-known cached)
    const currentLoc = await fetchCurrentGpsLocation(true, 5000);

    const criticalTelemetry: WearableTelemetry = {
      ...telemetry,
      impact_detected: true,
      vocal_confirmation: 0,
      accel_g: { x: 4.12, y: -3.89, z: 2.45, magnitude: 6.18 },
      heart_rate_bpm: 142,
      spo2_percent: 91,
      timestamp: new Date().toISOString(),
      gps_location: {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        accuracy: currentLoc.accuracy || 8,
        timestamp: currentLoc.timestamp,
        is_live: currentLoc.is_live,
        is_cached: currentLoc.is_cached,
        location_name: currentLoc.location_name,
        location_url: currentLoc.location_url,
      },
    };
    setTelemetry(criticalTelemetry);
    handleSelectTab('triage');
    await executeEngineTrigger('EMERGENCY_EVENT', criticalTelemetry);
  };

  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} font-sans flex flex-col lg:flex-row transition-colors duration-200`}>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          patient={patient}
          telemetry={telemetry}
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onEmergencyTrigger={handleSosTrigger}
          onOpenPatientProfile={() => setIsPatientModalOpen(true)}
          onOpenSupabaseAuth={() => setIsSupabaseAuthOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-full">
            <Sidebar
              patient={patient}
              telemetry={telemetry}
              activeTab={activeTab}
              setActiveTab={handleSelectTab}
              onEmergencyTrigger={handleSosTrigger}
              onOpenPatientProfile={() => setIsPatientModalOpen(true)}
              onOpenSupabaseAuth={() => setIsSupabaseAuthOpen(true)}
              isOpenMobile={isMobileMenuOpen}
              setIsOpenMobile={setIsMobileMenuOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content Workstation Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header
          patient={patient}
          telemetry={telemetry}
          activeTab={activeTab}
          onEmergencyTrigger={handleSosTrigger}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenPatientProfile={() => setIsPatientModalOpen(true)}
          onOpenSupabaseAuth={() => setIsSupabaseAuthOpen(true)}
          onGoBack={handleGoBack}
          canGoBack={activeTab !== 'home' || tabHistory.length > 0}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Workstation View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'home' && (
            <HomeOverviewView
              patient={patient}
              telemetry={telemetry}
              setActiveTab={handleSelectTab}
              onOpenPatientProfile={() => setIsPatientModalOpen(true)}
              onEmergencyTrigger={handleSosTrigger}
            />
          )}

          {activeTab === 'digest' && (
            <DailyWellnessDigestView
              patient={patient}
              telemetry={telemetry}
              setActiveTab={handleSelectTab}
              onEmergencyTrigger={handleSosTrigger}
            />
          )}

          {activeTab === 'telemetry_analytics' && (
            <ContinuousTelemetryView
              patient={patient}
              telemetry={telemetry}
              onEmergencyTrigger={handleSosTrigger}
            />
          )}

          {activeTab === 'triage' && (
            <TriagePipelineView
              patient={patient}
              setPatient={setPatient}
              telemetry={telemetry}
              setTelemetry={setTelemetry}
              onExecuteTrigger={(trigger, customTelemetry) =>
                executeEngineTrigger(trigger, customTelemetry) as Promise<EmergencyTriageResponse>
              }
            />
          )}

          {activeTab === 'symptoms' && (
            <SymptomAnalysisView
              patient={patient}
              onExecuteSymptomCheck={(symptoms) =>
                executeEngineTrigger('SYMPTOM_CHECK', undefined, symptoms) as Promise<SymptomEvaluationResponse>
              }
            />
          )}

          {activeTab === 'meds' && (
            <MedicationLogisticsView
              patient={patient}
              setPatient={setPatient}
              onExecuteMedicationSync={() =>
                executeEngineTrigger('MEDICATION_SYNC') as Promise<MedicationRefillResponse>
              }
            />
          )}

          {activeTab === 'passport' && (
            <EmergencyPassportView
              patient={patient}
              setPatient={setPatient}
              onGeneratePassport={() =>
                executeEngineTrigger('PASSPORT_GENERATE') as Promise<EmergencyPassportResponse>
              }
            />
          )}

          {activeTab === 'profile' && (
            <PatientProfileManagerView
              patient={patient}
              onFetchProfile={fetchPatientProfileApi}
              onUpdatePatientProfile={(updated) => setPatient(updated)}
              onSignOut={handleSignOut}
              onOpenSupabaseAuth={() => setIsSupabaseAuthOpen(true)}
            />
          )}

          {activeTab === 'critical_report' && (
            <CriticalReportEngineView
              patient={patient}
              telemetry={telemetry}
              onGenerateReport={generateCriticalReportApi}
            />
          )}

          {activeTab === 'api' && (
            <ApiSchemaExplorerView patient={patient} telemetry={telemetry} />
          )}
        </main>

        {/* Workstation Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 px-6 text-xs mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Project Aegis Medical Ecosystem • Wearable Telemetry & AI Workstation</span>
            <span className="font-mono text-[11px] text-emerald-400">Deterministic Clinical Triage • ESP32-S3 Synced</span>
          </div>
        </footer>

      </div>

      {/* Emergency Modal Overlay Alert (CRITICAL_EMERGENCY_DISPATCH) */}
      {activeEmergencyAlert && (
        <div className="fixed inset-0 bg-red-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border-2 border-red-500 shadow-2xl overflow-hidden animate-bounce-short">
            
            {/* Modal Header */}
            <div className="bg-red-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 animate-pulse" />
                <span className="font-extrabold text-base tracking-wide">CRITICAL EMERGENCY DISPATCH</span>
              </div>
              <button
                onClick={() => setActiveEmergencyAlert(null)}
                className="text-white hover:text-slate-200 cursor-pointer p-1 rounded hover:bg-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-950/60 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-200">
                <span className="font-bold block mb-1">Trigger Event Reason:</span>
                {activeEmergencyAlert.triage_summary.trigger_reason}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Impact Force:</span>
                  <span className="text-lg font-bold text-red-400">
                    {activeEmergencyAlert.dispatch_payload.vitals_at_impact.impact_g_force} G
                  </span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Post-Impact HR:</span>
                  <span className="text-lg font-bold text-red-400">
                    {activeEmergencyAlert.dispatch_payload.vitals_at_impact.post_impact_hr_bpm} BPM
                  </span>
                </div>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span>Patient GPS Location:</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    activeEmergencyAlert.dispatch_payload.gps_location.is_cached
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {activeEmergencyAlert.dispatch_payload.gps_location.is_cached ? '⚠️ Last Known Location' : '🟢 Live Location'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded border border-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Latitude:</span>
                    <span className="text-emerald-400 font-bold">{activeEmergencyAlert.dispatch_payload.gps_location.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Longitude:</span>
                    <span className="text-emerald-400 font-bold">{activeEmergencyAlert.dispatch_payload.gps_location.longitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Accuracy:</span>
                    <span className="text-slate-200">±{activeEmergencyAlert.dispatch_payload.gps_location.accuracy || 8} meters</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Updated:</span>
                    <span className="text-slate-200">
                      {new Date(activeEmergencyAlert.dispatch_payload.gps_location.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={activeEmergencyAlert.dispatch_payload.gps_location.location_url || generateMapsUrl(activeEmergencyAlert.dispatch_payload.gps_location.latitude, activeEmergencyAlert.dispatch_payload.gps_location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded text-center block text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>📍 View Patient Location in Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-lg border border-slate-700 text-xs">
                <span className="font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-indigo-400" />
                  Dispatched Recipients:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeEmergencyAlert.dispatch_payload.target_recipients.map((rec, i) => (
                    <span key={i} className="bg-red-900/60 text-red-200 border border-red-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveEmergencyAlert(null)}
                className="w-full bg-red-600 hover:bg-red-500 font-bold py-2.5 px-4 rounded-lg text-xs text-white cursor-pointer transition-all"
              >
                Acknowledge & Dismiss Dispatch Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Profile Popup Modal */}
      <PatientProfileModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patient={patient}
        onOpenFullProfileTab={() => handleSelectTab('profile')}
        onSignOut={handleSignOut}
      />

      {/* Supabase Authentication & Medical Onboarding Modal */}
      <SupabaseAuthModal
        isOpen={isSupabaseAuthOpen}
        onClose={() => setIsSupabaseAuthOpen(false)}
        patient={patient}
        onUpdatePatient={(updated) => setPatient(updated)}
      />

    </div>
  );
}
