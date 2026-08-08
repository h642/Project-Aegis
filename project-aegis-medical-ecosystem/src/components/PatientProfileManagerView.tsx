import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Mail, Phone, Building2, User, RefreshCw, CheckCircle2, Copy, Check, FileText, AlertCircle, Fingerprint, Globe, LogOut, Database } from 'lucide-react';
import { PatientProfile, PatientProfileFetchResponse } from '../types';
import { NationalIdVerificationCard } from './NationalIdVerificationCard';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface PatientProfileManagerViewProps {
  patient: PatientProfile;
  onFetchProfile: () => Promise<PatientProfileFetchResponse>;
  onUpdatePatientProfile?: (updatedPatient: PatientProfile) => void;
  onSignOut?: () => void;
  onOpenSupabaseAuth?: () => void;
}

export const PatientProfileManagerView: React.FC<PatientProfileManagerViewProps> = ({
  patient,
  onFetchProfile,
  onUpdatePatientProfile,
  onSignOut,
  onOpenSupabaseAuth,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<PatientProfileFetchResponse | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleRunProfileFetch = async () => {
    setIsLoading(true);
    try {
      const data = await onFetchProfile();
      setFetchedData(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const activeProfile = fetchedData?.patient_profile;
  const mgr = activeProfile?.account_manager || {
    manager_id: patient.accountManager?.managerId || 'MGR-58219',
    full_name: patient.accountManager?.fullName || 'Sarah Jenkins, RN, BSN',
    role: patient.accountManager?.role || 'Senior Geriatric Care Manager',
    organization: patient.accountManager?.organization || 'Aegis Senior Care Network',
    contact_email: patient.accountManager?.contactEmail || 's.jenkins@aegiscare.org',
    direct_phone: patient.accountManager?.directPhone || '+1 (555) 018-9922',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Patient Profile, Language Settings & Care Manager
                </h2>
                <span className="bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                  SCHEMA 5 • TRIGGER: GET_PATIENT_PROFILE
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5 font-medium">
                Structured patient demographics, multilingual localization preference, UUID mapping, and assigned case manager.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRunProfileFetch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync Profile API'}</span>
            </button>

            {onOpenSupabaseAuth && (
              <button
                onClick={onOpenSupabaseAuth}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
                title="Switch patient account or login via Supabase"
              >
                <Database className="h-4 w-4" />
                <span>Supabase Auth</span>
              </button>
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
                title="Sign out of current patient profile and return to login page"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🌐 Full Multilingual Language Selection Card */}
      <LanguageSelector variant="full" />

      {/* National ID Verification Card Banner */}
      <NationalIdVerificationCard 
        patient={patient} 
        onUpdatePatientProfile={onUpdatePatientProfile} 
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Patient ID & Personal Demographics */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Patient Demographics & Unique Identifier
              </h3>
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 rounded">
                UUID Sync Status: OK
              </span>
            </div>

            {/* UUID Box */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Unique Patient ID (UUID)
                </span>
                <span className="font-mono text-emerald-400 font-bold text-base">
                  {activeProfile?.unique_patient_id || patient.id}
                </span>
              </div>
              <button
                onClick={() => handleCopyUuid(activeProfile?.unique_patient_id || patient.id)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer font-mono"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Full Name</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeProfile?.personal_details?.full_name || patient.fullName}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Age & Gender</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeProfile?.personal_details?.age || patient.age} yrs • {activeProfile?.personal_details?.gender || patient.gender}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Blood Type</span>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  {activeProfile?.personal_details?.blood_type || patient.bloodGroup}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Primary Language</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {activeProfile?.personal_details?.primary_language || patient.primaryLanguage || 'English (US)'}
                </span>
              </div>
            </div>

            {/* Medical Profile Overview */}
            <div className="pt-2 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Active Chronic Conditions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.chronicConditions.map((cond, i) => (
                    <span key={i} className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Known Drug & Severe Allergies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.knownAllergies.map((alg, i) => (
                    <span key={i} className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                      {alg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Account / Case Manager & Emergency Contacts */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Account Manager Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Assigned Case & Account Manager
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                VERIFIED CARE LEAD
              </span>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 space-y-3 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">
                    {mgr.manager_id} • {mgr.organization}
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-0.5">{mgr.full_name}</h4>
                  <p className="text-xs text-indigo-200 font-medium">{mgr.role}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                  <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{mgr.contact_email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800">
                  <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{mgr.direct_phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Network */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
              Primary Caregiver & Emergency Contacts
            </h3>

            <div className="space-y-2.5">
              {(activeProfile?.emergency_contacts || patient.emergencyContacts).map((contact, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{contact.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{contact.relationship}</span>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

