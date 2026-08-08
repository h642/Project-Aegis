import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  ShieldAlert, 
  Shield, 
  UserCheck, 
  Building2, 
  Smartphone, 
  Terminal, 
  AlertTriangle, 
  Heart, 
  Wifi, 
  Battery, 
  Fingerprint, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  ChevronRight,
  Clock,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PatientProfile, WearableTelemetry } from '../types';
import { AegisAiAssistantWidget } from './AegisAiAssistantWidget';
import { GpsStatusCard } from './GpsStatusCard';
import { fetchCurrentGpsLocation, GpsLocationData, generateMapsUrl } from '../utils/locationService';

interface HomeOverviewViewProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  setActiveTab: (tab: string) => void;
  onOpenPatientProfile: () => void;
  onEmergencyTrigger: () => void;
}

export const HomeOverviewView: React.FC<HomeOverviewViewProps> = ({
  patient,
  telemetry,
  setActiveTab,
  onOpenPatientProfile,
  onEmergencyTrigger,
}) => {
  const { t } = useTranslation();
  const modules = [
    {
      id: 'digest',
      title: t('home.digestTitle'),
      schema: '24h / 7d / 30d',
      desc: t('home.digestDesc'),
      icon: Calendar,
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-700 dark:text-teal-400',
      badge: 'CARE DIGEST',
      badgeColor: 'bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-500/40',
      stats: '24h • 7-Day • 30-Day Views',
    },
    {
      id: 'telemetry_analytics',
      title: t('home.telemetryTitle'),
      schema: 'Continuous',
      desc: t('home.telemetryDesc'),
      icon: Radio,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-400',
      badge: '24/7 CONTINUOUS',
      badgeColor: 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-500/40',
      stats: 'Interactive Recharts & AI Anomaly Radar',
    },
    {
      id: 'triage',
      title: t('home.triageTitle'),
      schema: 'Schema 1',
      desc: t('home.triageDesc'),
      icon: Activity,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
      badge: 'LIVE TELEMETRY',
      badgeColor: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-500/40',
      stats: `${telemetry.heart_rate_bpm} BPM • ${telemetry.spo2_percent}% SpO2`,
    },
    {
      id: 'critical_report',
      title: t('home.reportTitle'),
      schema: 'Schema 6',
      desc: t('home.reportDesc'),
      icon: ShieldAlert,
      color: 'from-red-500/20 to-rose-500/10 border-red-500/40 text-red-700 dark:text-red-400',
      badge: 'EMERGENCY ER',
      badgeColor: 'bg-red-500/20 text-red-900 dark:text-red-300 border-red-500/40',
      stats: 'Instant Golden-Hour Brief',
    },
    {
      id: 'symptoms',
      title: t('home.symptomsTitle'),
      schema: 'Schema 2',
      desc: t('home.symptomsDesc'),
      icon: Shield,
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-400',
      badge: 'SAFETY ENGINE',
      badgeColor: 'bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-500/40',
      stats: `${patient.activeMedications.length} Active Prescriptions`,
    },
    {
      id: 'meds',
      title: t('home.medsTitle'),
      schema: 'Schema 3',
      desc: t('home.medsDesc'),
      icon: UserCheck,
      color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-700 dark:text-teal-400',
      badge: 'PHARMACY',
      badgeColor: 'bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-500/40',
      stats: 'Auto-Refill Ready',
    },
    {
      id: 'passport',
      title: t('home.passportTitle'),
      schema: 'Schema 4',
      desc: t('home.passportDesc'),
      icon: Smartphone,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400',
      badge: 'OFF-GRID QR',
      badgeColor: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40',
      stats: `${patient.bloodGroup} • ${patient.knownAllergies.length} Allergies Listed`,
    },
    {
      id: 'profile',
      title: t('home.profileTitle'),
      schema: 'Schema 5',
      desc: t('home.profileDesc'),
      icon: Building2,
      color: 'from-blue-500/20 to-sky-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400',
      badge: 'DEMOGRAPHICS',
      badgeColor: 'bg-blue-500/20 text-blue-900 dark:text-blue-300 border-blue-500/40',
      stats: `${patient.age}y • ${patient.gender} • Verified ID`,
    },
    {
      id: 'api',
      title: t('home.apiTitle'),
      schema: 'Schemas 1–6',
      desc: t('home.apiDesc'),
      icon: Terminal,
      color: 'from-slate-200 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300',
      badge: 'DEV BENCH',
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      stats: '6 JSON Schemas Available',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-300 dark:border-slate-800 shadow-md transition-colors duration-200">
        
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                AEGISONE COMMAND CENTER v3.6
              </span>
              <span className="bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                NATIONAL ID AUTHENTICATED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {t('app.commandCenter')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {t('app.commandSubtitle')}
            </p>
          </div>

          {/* Quick Active Patient & Vitals Card */}
          <div className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3.5 shrink-0 min-w-[280px] shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <button 
                onClick={onOpenPatientProfile}
                className="flex items-center gap-2.5 hover:text-indigo-600 dark:hover:text-indigo-300 text-left group transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 block leading-tight">
                    {patient.fullName}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono block">
                    {patient.id} • {patient.bloodGroup}
                  </span>
                </div>
              </button>

              <button
                onClick={onOpenPatientProfile}
                className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-500/15 border border-indigo-500/30 px-2 py-1 rounded-md"
              >
                {t('common.details')}
              </button>
            </div>

            {/* Vitals Feed Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Heart className="h-3.5 w-3.5 text-red-500" />
                  <span>{t('telemetry.heartRate')}</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{telemetry.heart_rate_bpm}</span>
              </div>

              <div className="bg-slate-100 dark:bg-slate-900/90 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('telemetry.spo2')}</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{telemetry.spo2_percent}%</span>
              </div>
            </div>

            {/* Emergency SOS Dispatch Quick Launch */}
            <button
              onClick={onEmergencyTrigger}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-2 px-3 rounded-xl shadow-md text-xs transition-all cursor-pointer border border-red-500/40 animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{t('app.triggerSos')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Access Anything: All Engine Modules Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Clinical & Operations Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to all 6 engine schemas & developer tools
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
            7 ACTIVE MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className="bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${mod.color} border shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${mod.badgeColor}`}>
                      {mod.schema}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      <span>{mod.title}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-600 dark:text-indigo-400" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{mod.stats}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline text-[11px] flex items-center gap-1 shrink-0">
                    <span>Open Module</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📍 LIVE LOCATION Status Section */}
      <GpsStatusCard initialLocation={telemetry.gps_location} />

      {/* Real-time System Status Footer */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-900 text-slate-900 dark:text-slate-200 rounded-2xl p-5 border border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-slate-900 dark:text-white">Live ESP32 Hardware Strap Connection</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-bold">
              <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              BLE Online
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold">
              <Battery className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {telemetry.battery_level}% Battery
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 block uppercase font-semibold">Accel G-Magnitude</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{telemetry.accel_g.magnitude.toFixed(2)} G</span>
          </div>
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 block uppercase font-semibold">Fall Detection</span>
            <span className={telemetry.impact_detected ? "text-red-600 dark:text-red-400 font-extrabold" : "text-emerald-700 dark:text-emerald-400 font-extrabold"}>
              {telemetry.impact_detected ? "IMPACT DETECTED" : "NOMINAL"}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 block uppercase font-semibold">Primary Caregiver</span>
            <span className="text-slate-900 dark:text-slate-200 font-extrabold truncate block">{patient.emergencyContacts[0]?.name || 'Dr. Miller'}</span>
          </div>
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 block uppercase font-semibold">Account Manager</span>
            <span className="text-slate-900 dark:text-slate-200 font-extrabold truncate block">{patient.accountManager?.fullName || 'Sarah Jenkins'}</span>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Widget - Exclusively on Command Center Home */}
      <AegisAiAssistantWidget
        patient={patient}
        telemetry={telemetry}
        setActiveTab={setActiveTab}
        onEmergencyTrigger={onEmergencyTrigger}
      />

    </div>
  );
};
