import React from 'react';
import { Shield, Menu, User, Activity, AlertTriangle, Wifi, Battery, Building2, ShieldAlert, Smartphone, Terminal, UserCheck, ArrowLeft, Sun, Moon, Database } from 'lucide-react';
import { PatientProfile, WearableTelemetry } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  activeTab: string;
  onEmergencyTrigger: () => void;
  onToggleMobileMenu?: () => void;
  onOpenPatientProfile?: () => void;
  onOpenSupabaseAuth?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  patient,
  telemetry,
  activeTab,
  onEmergencyTrigger,
  onToggleMobileMenu,
  onOpenPatientProfile,
  onOpenSupabaseAuth,
  onGoBack,
  canGoBack,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const { t } = useTranslation();

  const tabTitles: Record<string, { category: string; title: string; badge: string }> = {
    home: { category: 'Command Center', title: t('nav.home'), badge: 'Hub' },
    telemetry_analytics: { category: 'Command Center', title: t('nav.telemetry'), badge: 'Continuous' },
    triage: { category: 'Emergency Operations', title: t('nav.triage'), badge: 'Schema 1' },
    symptoms: { category: 'Clinical & Pharmacy', title: t('nav.symptoms'), badge: 'Schema 2' },
    meds: { category: 'Clinical & Pharmacy', title: t('nav.pharmacy'), badge: 'Schema 3' },
    passport: { category: 'Patient & Records', title: t('nav.passport'), badge: 'Schema 4' },
    profile: { category: 'Patient & Records', title: t('nav.profile'), badge: 'Schema 5' },
    critical_report: { category: 'Emergency Operations', title: t('nav.report'), badge: 'Schema 6' },
    api: { category: 'Developer & API', title: t('nav.api'), badge: 'Schemas 1–6' },
  };

  const current = tabTitles[activeTab] || { category: 'Workstation', title: 'Clinical Module', badge: 'Aegis Core' };
  const isLight = themeMode === 'light';

  return (
    <header className={`${isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-slate-100 border-slate-800'} border-b sticky top-0 z-20 shadow-md transition-colors duration-200`}>
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left Breadcrumb, Back Button & Module Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className={`lg:hidden p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'} cursor-pointer`}
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Back Button */}
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              title="Return to previous module / page"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <ArrowLeft className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {current.category}
              </span>
              <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>•</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                {current.badge}
              </span>
            </div>
            <h1 className={`text-base sm:text-lg font-extrabold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {current.title}
            </h1>
          </div>
        </div>

        {/* Right Status Actions, Day/Night Theme Toggle & Patient Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* 🌐 Multilingual Language Selector */}
          <LanguageSelector variant="compact" />

          {/* Supabase Auth & Medical Login Button */}
          {onOpenSupabaseAuth && (
            <button
              onClick={onOpenSupabaseAuth}
              title="Open Supabase Auth (Email, Mobile OTP, Google) & Medical Onboarding"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Supabase Auth</span>
            </button>
          )}

          {/* Day / Night Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isLight ? "Switch to Night Mode (Dark Theme)" : "Switch to Day Mode (Light Theme)"}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center justify-center ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
              }`}
            >
              {isLight ? (
                <Moon className="h-4 w-4 text-indigo-600" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Patient Quick Info Card */}
          <button
            onClick={onOpenPatientProfile}
            title="Click to view complete patient profile popup"
            className={`hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs text-left transition-all cursor-pointer group shadow-sm ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                : 'bg-slate-800/90 hover:bg-slate-800 hover:border-indigo-500/50 border-slate-700/80'
            }`}
          >
            <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold transition-all shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className={`font-bold group-hover:text-indigo-600 transition-colors block leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {patient.fullName}
                </span>
                <span className="text-[9px] text-indigo-500 font-mono font-bold bg-indigo-500/15 px-1 rounded">VIEW</span>
              </div>
              <span className={`text-[10px] font-mono block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {patient.age}y • {patient.gender} • {patient.bloodGroup}
              </span>
            </div>
          </button>

          {/* Quick SOS Trigger Button */}
          <button
            onClick={onEmergencyTrigger}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-red-950/30 text-xs transition-all cursor-pointer animate-pulse border border-red-500/30"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">{t('app.sosDispatch')}</span>
          </button>

        </div>

      </div>
    </header>
  );
};

