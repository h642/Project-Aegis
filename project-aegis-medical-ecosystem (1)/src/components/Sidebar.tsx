import React, { useState } from 'react';
import { 
  Activity, 
  Shield, 
  UserCheck, 
  Smartphone, 
  Building2, 
  ShieldAlert, 
  Terminal, 
  AlertTriangle, 
  Wifi, 
  Battery, 
  Heart, 
  Activity as PulseIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User,
  Radio,
  LayoutDashboard,
  Calendar,
  Globe,
  FileText,
  Pill,
  Stethoscope,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  Database
} from 'lucide-react';
import { PatientProfile, WearableTelemetry } from '../types';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface SidebarProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmergencyTrigger: () => void;
  onOpenPatientProfile?: () => void;
  onOpenSupabaseAuth?: () => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  patient,
  telemetry,
  activeTab,
  setActiveTab,
  onEmergencyTrigger,
  onOpenPatientProfile,
  onOpenSupabaseAuth,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { t } = useTranslation();
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = [
    {
      group: 'COMMAND CENTER',
      items: [
        { id: 'home', label: t('nav.home'), sub: 'Hub for All Modules & Telemetry', icon: LayoutDashboard, badge: 'MAIN' },
        { id: 'digest', label: t('nav.digest'), sub: '24h, Weekly & Monthly Summary', icon: Calendar, badge: 'DIGEST' },
        { id: 'telemetry_analytics', label: t('nav.telemetry'), sub: 'PPG Trends & AI Anomaly Radar', icon: PulseIcon, badge: '24/7' },
      ],
    },
    {
      group: 'EMERGENCY OPERATIONS',
      items: [
        { id: 'triage', label: t('nav.triage'), sub: 'Schema 1 • Live Fall & Vitals', icon: Activity, badge: 'LIVE' },
        { id: 'critical_report', label: t('nav.report'), sub: 'Schema 6 • Golden-Hour Brief', icon: ShieldAlert, badge: 'ALERT' },
      ],
    },
    {
      group: 'CLINICAL & PHARMACY',
      items: [
        { id: 'symptoms', label: t('nav.symptoms'), sub: 'Schema 2 • Interaction Check', icon: Shield },
        { id: 'meds', label: t('nav.pharmacy'), sub: 'Schema 3 • e-Prescriptions', icon: UserCheck },
      ],
    },
    {
      group: 'PATIENT & RECORDS',
      items: [
        { id: 'profile', label: t('nav.profile'), sub: 'Schema 5 • Demographics & Case Mgr', icon: Building2 },
        { id: 'passport', label: t('nav.passport'), sub: 'Schema 4 • Off-Grid Emergency ID', icon: Smartphone },
      ],
    },
    {
      group: 'DEVELOPER & API',
      items: [
        { id: 'api', label: t('nav.api'), sub: 'Inspect Engine Schemas 1–6', icon: Terminal },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-slate-100/95 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-slate-100 flex flex-col border-r border-slate-300 dark:border-slate-800/80 shrink-0 h-screen sticky top-0 shadow-xl z-30 transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header & Compress Toggle Button */}
      <div className={`p-3 border-b border-slate-200 dark:border-slate-800/70 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-slate-200/60 dark:bg-slate-950/40 backdrop-blur-md transition-all`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 flex items-center justify-center shadow-md shrink-0">
              <Shield className="h-5 w-5 text-white dark:text-slate-950 font-black" />
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">AegisOne</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  v3.6
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold truncate">Clinical Workstation</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Expand Sidebar"
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            <Shield className="h-5 w-5 text-white dark:text-slate-950 font-black" />
          </button>
        )}

        {/* Compress / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Compress Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Patient Mini Banner */}
      <button
        onClick={() => {
          if (onOpenPatientProfile) onOpenPatientProfile();
          if (setIsOpenMobile) setIsOpenMobile(false);
        }}
        title={`Patient Profile: ${patient.fullName} (${patient.id})`}
        className={`w-full text-left p-3 bg-slate-200/60 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 backdrop-blur-md border-b border-slate-300 dark:border-slate-800/70 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all cursor-pointer group`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all font-bold">
            <User className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="truncate min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {patient.fullName}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono block truncate">
                {patient.id} • {patient.bloodGroup}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        )}
      </button>

      {/* Supabase Auth & Onboarding Trigger Button */}
      {onOpenSupabaseAuth && (
        <button
          onClick={() => {
            onOpenSupabaseAuth();
            if (setIsOpenMobile) setIsOpenMobile(false);
          }}
          title="Supabase Backend Auth (Email, Mobile OTP, Google) & Medical Report"
          className={`w-full p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-b border-slate-300 dark:border-slate-800 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } transition-all cursor-pointer font-bold text-xs group`}
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span>Supabase Auth & Medical Login</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-bold">
              AUTH
            </span>
          )}
        </button>
      )}

      {/* Live Health & System Summary Card in Left Sidebar */}
      {!isCollapsed ? (
        <div className="px-3 pt-2.5 pb-2 border-b border-slate-300 dark:border-slate-800/70 bg-slate-200/40 dark:bg-slate-900/40">
          <button
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-200/80 dark:bg-slate-800/60 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all cursor-pointer font-bold text-xs"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="tracking-tight">{t('summary.title')}</span>
            </div>
            {isSummaryOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
          </button>

          {isSummaryOpen && (
            <div className="mt-2 space-y-2 p-2.5 bg-white/90 dark:bg-slate-950/80 rounded-xl border border-slate-300/80 dark:border-slate-800 text-xs shadow-sm">
              {/* Status Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">{t('summary.patientStatus')}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  telemetry.impact_detected 
                    ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                }`}>
                  {telemetry.impact_detected ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      <span>{t('summary.fallAlert')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>{t('summary.vitalsNormal')}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Vitals Quick Grid */}
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">{t('telemetry.heartRate')}</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{telemetry.heart_rate_bpm} BPM</span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">{t('telemetry.spo2')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{telemetry.spo2_percent}%</span>
                </div>
              </div>

              {/* Conditions & Case Manager Summary */}
              <div className="space-y-1 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">{t('summary.caseManager')}:</span>
                  <span className="font-semibold truncate max-w-[120px] text-right">{patient.accountManager?.fullName || 'Sarah Jenkins, RN'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px]">{t('summary.conditions')}:</span>
                  <span className="font-semibold text-right truncate max-w-[120px]">{patient.chronicConditions?.slice(0, 2).join(', ') || 'None'}</span>
                </div>
              </div>

              {/* Quick Link to Digest */}
              <button
                onClick={() => handleSelect('digest')}
                className="w-full mt-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold py-1 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 border border-indigo-500/20 cursor-pointer"
              >
                <Calendar className="h-3 w-3" />
                <span>{t('digest.title')}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-2 border-b border-slate-300 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => handleSelect('digest')}
            title="Live Patient Summary Digest"
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 hover:bg-indigo-500 hover:text-white transition-all text-slate-700 dark:text-slate-300 cursor-pointer relative"
          >
            <FileText className="h-4 w-4" />
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
              telemetry.impact_detected ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
            }`} />
          </button>
        </div>
      )}

      {/* Grouped Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {cat.group}
              </h3>
            )}
            {isCollapsed && idx > 0 && <div className="border-t border-slate-300/60 dark:border-slate-800/60 my-2" />}
            <div className="space-y-1">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    title={`${item.label} — ${item.sub}`}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2.5'
                    } rounded-xl transition-all cursor-pointer group text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/10 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 transition-all ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-slate-200/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 group-hover:bg-slate-300 dark:group-hover:bg-slate-700/70'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="truncate">
                          <span className="text-xs block truncate font-bold text-slate-900 dark:text-slate-200">{item.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{item.sub}</span>
                        </div>
                      )}
                    </div>
                    
                    {!isCollapsed && item.badge && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        item.badge === 'ALERT' 
                          ? 'bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/40' 
                          : item.badge === 'LIVE' || item.badge === '24/7' || item.badge === 'MAIN'
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 🌐 Language Selection Box inside Sidebar */}
        <div className="pt-2 px-1">
          {!isCollapsed ? (
            <div className="p-3 bg-slate-200/60 dark:bg-slate-950/50 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3 text-indigo-500" />
                  <span>{t('settings.language')}</span>
                </span>
              </div>
              <LanguageSelector variant="compact" className="w-full" />
            </div>
          ) : (
            <div className="flex justify-center">
              <LanguageSelector variant="compact" className="w-10" />
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Status & Instant Emergency SOS Footer */}
      <div className="p-2.5 border-t border-slate-300 dark:border-slate-800/80 bg-slate-200/70 dark:bg-slate-950/60 backdrop-blur-md space-y-2">
        
        {/* Live ESP32 Telemetry Box */}
        {!isCollapsed ? (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-2.5 border border-slate-300 dark:border-slate-800/80 space-y-2 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="h-3.5 w-3.5" />
                <span>ESP32-S3 STRAP</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                <Battery className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{telemetry.battery_level}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800/70 text-[10px] font-mono text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded border border-slate-200 dark:border-slate-800/50">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="font-bold text-slate-900 dark:text-slate-200">{telemetry.heart_rate_bpm} BPM</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded border border-slate-200 dark:border-slate-800/50">
                <PulseIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-slate-200">{telemetry.spo2_percent}% SpO2</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            title={`Telemetry: ${telemetry.heart_rate_bpm} BPM, ${telemetry.spo2_percent}% SpO2, Battery ${telemetry.battery_level}%`}
            className="flex flex-col items-center p-1.5 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800 text-[10px] font-mono gap-1"
          >
            <div className="flex items-center gap-1 text-red-500 font-bold">
              <Heart className="h-3 w-3" />
              <span>{telemetry.heart_rate_bpm}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-bold">
              <Battery className="h-3 w-3" />
              <span>{telemetry.battery_level}%</span>
            </div>
          </div>
        )}

        {/* Big SOS Dispatch Button */}
        <button
          onClick={onEmergencyTrigger}
          title={t('app.triggerSos')}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold ${
            isCollapsed ? 'py-2 px-1 rounded-xl' : 'py-2.5 px-3 rounded-xl'
          } shadow-lg text-xs transition-all cursor-pointer animate-pulse border border-red-500/40`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{t('app.triggerSos')}</span>}
        </button>

      </div>
    </aside>
  );
};


