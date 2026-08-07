import React, { useState } from 'react';
import { Smartphone, Printer, QrCode, Shield, Phone, AlertTriangle, UserCheck, Heart, Download, Edit3, Save } from 'lucide-react';
import { PatientProfile, EmergencyPassportResponse } from '../types';
import { useTranslation } from 'react-i18next';

interface EmergencyPassportViewProps {
  patient: PatientProfile;
  setPatient: React.Dispatch<React.SetStateAction<PatientProfile>>;
  onGeneratePassport: () => Promise<EmergencyPassportResponse>;
}

export const EmergencyPassportView: React.FC<EmergencyPassportViewProps> = ({
  patient,
  setPatient,
  onGeneratePassport,
}) => {
  const { t } = useTranslation();
  const [passportResponse, setPassportResponse] = useState<EmergencyPassportResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleFetchPassport = async () => {
    setIsGenerating(true);
    try {
      const res = await onGeneratePassport();
      setPassportResponse(res);
    } catch (err) {
      console.error("Passport fetch error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('passport.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {t('passport.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer border border-slate-300 dark:border-slate-700"
          >
            {isEditing ? <Save className="h-4 w-4 text-emerald-600" /> : <Edit3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
            <span>{isEditing ? t('common.save') : t('common.edit')}</span>
          </button>

          <button
            onClick={handleFetchPassport}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-md shadow-red-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            <span>{isGenerating ? t('common.loading') : t('passport.generatePayload')}</span>
          </button>
        </div>
      </div>

      {/* Emergency Medical ID Card Badge (Printable Area) */}
      <div className="bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 border-2 border-red-500 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0 transition-colors duration-200">
        
        {/* Background Emblem */}
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
          <Shield className="w-80 h-80 text-slate-900 dark:text-white" />
        </div>

        {/* ER Badge Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-red-900/30">
              ER
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-red-600 dark:text-red-400 uppercase tracking-widest font-bold">PROJECT AEGIS</span>
                <span className="text-[10px] bg-red-500/20 text-red-800 dark:text-red-300 px-2 py-0.5 rounded font-bold border border-red-500/40">
                  {t('passport.goldenHourId')}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('passport.emergencyMedicalPassport')}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono cursor-pointer shadow-xs"
            >
              <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('passport.paramedicQr')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono cursor-pointer print:hidden shadow-xs"
            >
              <Printer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('passport.printBadge')}</span>
            </button>
          </div>
        </div>

        {/* Badge Main Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          
          {/* Patient Core Profile */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-extrabold tracking-wider">
              {t('passport.patientIdentification')}
            </span>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('profile.fullName')}:</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{patient.fullName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">{t('profile.age')}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{patient.age} yrs • {patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">{t('profile.bloodType')}:</span>
                <span className="font-mono font-black text-red-600 dark:text-red-400 text-base">{patient.bloodGroup}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold">
              ID: {patient.id}
            </div>
          </div>

          {/* Critical Allergies & Chronic Conditions */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-black tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t('passport.severeAllergiesConditions')}
            </span>

            <div>
              <span className="text-xs text-red-600 dark:text-red-400 font-bold block mb-1">{t('profile.allergies')}:</span>
              <div className="flex flex-wrap gap-1">
                {patient.knownAllergies.map((a, i) => (
                  <span key={i} className="bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800 font-extrabold text-xs px-2 py-0.5 rounded">
                    ⚠️ {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">{t('profile.chronicConditions')}:</span>
              <div className="flex flex-wrap gap-1">
                {patient.chronicConditions.map((c, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-semibold text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Medications & Emergency Contacts */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-black tracking-wider flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {t('passport.activeMedsContacts')}
            </span>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">{t('passport.activePrescriptions')}:</span>
              <div className="space-y-1 text-xs font-mono">
                {patient.activeMedications.map((m) => (
                  <div key={m.id} className="flex justify-between bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-slate-200 font-bold">{m.name}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{m.dosage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">{t('passport.primaryEmergencyContact')}:</span>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">{patient.emergencyContacts[0]?.name}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{patient.emergencyContacts[0]?.relationship}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold block mt-0.5">{patient.emergencyContacts[0]?.phone}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium gap-2">
          <span>{t('passport.encryptedPayload')}</span>
          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{t('passport.readyForEr')}</span>
        </div>
      </div>

      {/* Paramedic QR Code Modal Preview */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl text-center">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                {t('passport.paramedicQr')}
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Simulated High-Res QR Code graphic */}
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner my-2">
              <svg viewBox="0 0 100 100" className="w-48 h-48">
                <path fill="#000" d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M22,22 h6 v6 h-6 z" />
                <path fill="#000" d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M72,22 h6 v6 h-6 z" />
                <path fill="#000" d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M22,72 h6 v6 h-6 z" />
                <path fill="#000" d="M50,10 h5 v10 h-5 z M45,25 h10 v5 h-10 z M50,40 h15 v5 h-15 z" />
                <path fill="#000" d="M50,55 h10 v10 h-10 z M65,50 h10 v15 h-10 z M80,60 h10 v10 h-10 z" />
                <path fill="#000" d="M45,70 h20 v5 h-20 z M55,80 h15 v10 h-15 z M75,75 h15 v15 h-15 z" />
              </svg>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              {t('passport.qrInstruction')}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2 px-4 rounded-lg text-xs text-white cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      {/* JSON Schema 4 Output Payload */}
      {passportResponse && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Schema 4 Output Payload (Emergency Medical Passport):
            </span>
            <span className="text-[10px] text-slate-500 font-mono">status_code: {passportResponse.status_code}</span>
          </div>
          <pre className="font-mono text-xs text-emerald-300 overflow-x-auto max-h-56 scrollbar-thin">
            {JSON.stringify(passportResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
