import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Copy, 
  Check, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  AlertTriangle, 
  Heart, 
  Activity, 
  ExternalLink,
  Calendar,
  Pill,
  ShieldAlert,
  Fingerprint,
  Lock,
  Globe,
  LogOut
} from 'lucide-react';
import { PatientProfile } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onOpenFullProfileTab?: () => void;
  onSignOut?: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOpenFullProfileTab,
  onSignOut,
}) => {
  const { t } = useTranslation();
  const [copiedUuid, setCopiedUuid] = useState(false);

  if (!isOpen) return null;

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(patient.id);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const accountMgr = patient.accountManager || {
    managerId: 'MGR-58219',
    fullName: 'Sarah Jenkins, RN, BSN',
    role: 'Senior Geriatric Care Manager',
    organization: 'Aegis Senior Care Network',
    contactEmail: 's.jenkins@aegiscare.org',
    directPhone: '+1 (555) 018-9922',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-indigo-950/50 shrink-0 border border-indigo-400/30">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {patient.fullName}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  AEGIS PROTECTED
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-300 font-mono">
                <span>ID: {patient.id}</span>
                <span>•</span>
                <span>{patient.age} Yrs</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span className="text-red-400 font-bold">{patient.bloodGroup}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Language Selector Component */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>{t('language.title')}</span>
              </div>
              <LanguageSelector variant="compact" />
            </div>
            <p className="text-[11px] text-slate-400">
              {t('language.selectSubtitle')}
            </p>
          </div>

          {/* UUID Copy & Quick Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Unique Patient UUID
                </span>
                <span className="font-mono text-emerald-400 font-bold text-sm sm:text-base">
                  {patient.id}
                </span>
              </div>
              <button
                onClick={handleCopyUuid}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer font-mono transition-all"
              >
                {copiedUuid ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedUuid ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Primary Language
                </span>
                <span className="font-bold text-slate-200 text-xs sm:text-sm">
                  {patient.primaryLanguage || 'English (US)'}
                </span>
              </div>
              <Activity className="h-4 w-4 text-indigo-400 shrink-0" />
            </div>
          </div>

          {/* Authenticated National Identity Banner */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    {patient.nationalId?.type || 'Aadhaar (IN)'} National Registry
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                    AUTHENTICATED
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                  ID: {patient.nationalId?.idNumber ? `XXXX-XXXX-${patient.nationalId.idNumber.replace(/[\s-]/g, '').slice(-4)}` : 'XXXX-XXXX-7310'}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] font-mono text-slate-400">
              <span className="block text-slate-300 font-medium">{patient.nationalId?.issuingAuthority || 'UIDAI / National Health Stack'}</span>
              <span className="text-[10px] text-emerald-400/80 block">Verified via 2FA Demographic Cross-Match</span>
            </div>
          </div>

          {/* Assigned Case & Account Manager */}
          <div className="bg-gradient-to-br from-slate-950 to-indigo-950/60 p-4 sm:p-5 rounded-xl border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                Assigned Case & Account Manager
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {accountMgr.managerId}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">{accountMgr.fullName}</h3>
              <p className="text-xs text-indigo-200">{accountMgr.role} • {accountMgr.organization}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="flex items-center gap-2 text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{accountMgr.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{accountMgr.directPhone}</span>
              </div>
            </div>
          </div>

          {/* Medical Profile: Conditions & Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Chronic Conditions */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-amber-400" />
                Chronic Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {patient.chronicConditions.map((cond, idx) => (
                  <span key={idx} className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium px-2.5 py-1 rounded-lg">
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Known Severe Allergies */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Known Severe Allergies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {patient.knownAllergies.map((alg, idx) => (
                  <span key={idx} className="bg-red-500/10 text-red-300 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {alg}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Active Prescriptions */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
              <Pill className="h-4 w-4 text-teal-400" />
              Active Prescriptions:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {patient.activeMedications.map((med, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-bold text-white block truncate">{med.name}</span>
                  <span className="text-[11px] text-slate-400 block">{med.dosage} • {'frequency' in med ? (med as any).frequency : 'Daily'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-red-400" />
              Emergency Contacts & Primary Caregiver:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {patient.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{contact.name}</span>
                    <span className="text-[11px] text-slate-400 block">{contact.relationship}</span>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-mono text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-md flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {onOpenFullProfileTab && (
              <button
                onClick={() => {
                  onOpenFullProfileTab();
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-indigo-950/50"
              >
                <span>Open Patient Console</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                title="Sign out of current patient session and return to Login"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sign Out Session</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs border border-slate-700 cursor-pointer transition-all"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
};
