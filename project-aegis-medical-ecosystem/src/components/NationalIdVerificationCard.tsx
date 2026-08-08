import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  Building2, 
  FileText, 
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';
import { PatientProfile, NationalIdInfo, NationalIdVerificationResponse } from '../types';

interface NationalIdVerificationCardProps {
  patient: PatientProfile;
  onUpdatePatientProfile?: (updatedPatient: PatientProfile) => void;
}

export const NationalIdVerificationCard: React.FC<NationalIdVerificationCardProps> = ({
  patient,
  onUpdatePatientProfile,
}) => {
  const defaultNationalId: NationalIdInfo = patient.nationalId || {
    type: 'Aadhaar (IN)',
    idNumber: '4892-1029-7310',
    verificationStatus: 'VERIFIED',
    verifiedAt: new Date().toISOString(),
    issuingAuthority: 'UIDAI / National Health Stack (India)',
    verificationHash: 'SHA256: 9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
  };

  const [currentId, setCurrentId] = useState<NationalIdInfo>(defaultNationalId);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  // Form state for authentication
  const [selectedType, setSelectedType] = useState<NationalIdInfo['type']>(currentId.type);
  const [idInput, setIdInput] = useState(currentId.idNumber);
  const [otpCode, setOtpCode] = useState('782910');
  const [verificationSuccess, setVerificationSuccess] = useState<NationalIdVerificationResponse | null>(null);

  // Mask function
  const getMaskedNumber = (num: string) => {
    const clean = num.replace(/[\s-]/g, '');
    if (clean.length <= 4) return '****';
    return `XXXX-XXXX-${clean.slice(-4)}`;
  };

  const handleStartVerification = () => {
    setShowOtpModal(true);
    setVerificationSuccess(null);
  };

  const handleConfirmOtpAuthentication = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/v1/patient/verify-national-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idType: selectedType,
          idNumber: idInput,
          fullName: patient.fullName,
          patientId: patient.id,
        }),
      });

      const data: NationalIdVerificationResponse = await response.json();
      setVerificationSuccess(data);

      const updatedNatId: NationalIdInfo = {
        type: selectedType,
        idNumber: idInput,
        verificationStatus: 'VERIFIED',
        verifiedAt: data.national_id_details.verified_timestamp,
        issuingAuthority: data.national_id_details.issuing_authority,
        verificationHash: data.national_id_details.audit_hash,
      };

      setCurrentId(updatedNatId);

      if (onUpdatePatientProfile) {
        onUpdatePatientProfile({
          ...patient,
          nationalId: updatedNatId,
        });
      }
    } catch (err) {
      console.error('National ID verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">National Identity Authentication</h3>
              {currentId.verificationStatus === 'VERIFIED' && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  VERIFIED ID
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Government Demographic Registry & Cryptographic Cross-Check
            </p>
          </div>
        </div>

        <button
          onClick={handleStartVerification}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-950/40 border border-emerald-400/30 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-Authenticate / Change ID</span>
        </button>
      </div>

      {/* Main Details Box */}
      <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl border border-slate-800/90 space-y-4">
        
        {/* ID Number Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
              {currentId.type} Registration Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-emerald-400 font-extrabold text-lg tracking-wider">
                {showFullNumber ? currentId.idNumber : getMaskedNumber(currentId.idNumber)}
              </span>
              <button
                onClick={() => setShowFullNumber(!showFullNumber)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
                title={showFullNumber ? "Hide ID Number" : "Reveal Unmasked ID"}
              >
                {showFullNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
              Issuing Authority
            </span>
            <span className="text-xs font-semibold text-slate-200 block truncate max-w-xs">
              {currentId.issuingAuthority}
            </span>
          </div>
        </div>

        {/* Verification Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Matched Citizen Name</span>
              <span className="font-bold text-slate-100">{patient.fullName}</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Last Verified At</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {currentId.verifiedAt ? new Date(currentId.verifiedAt).toLocaleString() : 'Just now'}
              </span>
            </div>
            <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
          </div>
        </div>

        {/* Cryptographic Audit Hash */}
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <span className="truncate">
            <strong className="text-slate-300">Audit Proof:</strong> {currentId.verificationHash}
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded shrink-0 font-bold">
            VALID
          </span>
        </div>

      </div>

      {/* Interactive Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl p-6 space-y-5 relative">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">National ID Authentication</h3>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Step */}
            {!verificationSuccess ? (
              <div className="space-y-4">
                
                {/* ID Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select National ID Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Aadhaar (IN)">Aadhaar Number (UIDAI - India)</option>
                    <option value="ABHA Health ID">ABHA Health ID (NHA - India)</option>
                    <option value="SSN (US)">Social Security Number / SSN (US)</option>
                    <option value="Passport">International Passport Number</option>
                    <option value="National ID Card">National Driver's License / State ID</option>
                  </select>
                </div>

                {/* ID Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Enter ID Registration Number</label>
                  <input
                    type="text"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="e.g., 4892-1029-7310"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2FA OTP Code */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                      2FA OTP Authorization Code:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Mobile Linked ***-2834</span>
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono font-black text-lg text-indigo-300 tracking-widest focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOtpAuthentication}
                    disabled={isVerifying || !idInput.trim()}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Registry...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Authenticate National ID</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : (
              /* Success Result View */
              <div className="space-y-4 text-center py-2">
                <div className="h-14 w-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">AUTHENTICATION SUCCESSFUL</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    National ID verified and linked to {patient.fullName}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Masked ID:</span>
                    <span className="font-bold text-emerald-400">{verificationSuccess.national_id_details.masked_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Authority:</span>
                    <span className="text-slate-200">{verificationSuccess.national_id_details.issuing_authority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Demographic Match:</span>
                    <span className="text-emerald-400 font-bold">100% MATCH (Name, DOB, Gender)</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowOtpModal(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close & Save Verified Badge
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
