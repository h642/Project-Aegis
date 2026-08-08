import { PatientProfile, WearableTelemetry } from '../types';

export const DEFAULT_PATIENT_PROFILE: PatientProfile = {
  id: "AEGIS-PAT-8892",
  fullName: "Hemant Mishra",
  age: 72,
  gender: "Male",
  bloodGroup: "O-Positive",
  primaryLanguage: "English (US)",
  nationalId: {
    type: "Aadhaar (IN)",
    idNumber: "4892-1029-7310",
    verificationStatus: "VERIFIED",
    verifiedAt: "2026-08-01T10:15:00.000Z",
    issuingAuthority: "UIDAI / National Health Stack",
    verificationHash: "SHA256: 9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a"
  },
  accountManager: {
    managerId: "MGR-58219",
    fullName: "Sarah Jenkins, RN, BSN",
    role: "Senior Geriatric Care Manager",
    organization: "Aegis Senior Care Network",
    contactEmail: "s.jenkins@aegiscare.org",
    directPhone: "+1 (555) 018-9922"
  },
  chronicConditions: ["Hypertension", "Type 2 Diabetes", "Mild Atrial Fibrillation"],
  knownAllergies: ["Penicillin (Severe Anaphylaxis)", "Sulfa Drugs", "Shellfish"],
  activeMedications: [
    {
      id: "MED-001",
      name: "Warfarin (Coumadin)",
      dosage: "5 mg",
      frequency: "Once Daily",
      remainingCount: 6,
      threshold: 10,
      times: ["08:00 AM"],
      vendorName: "HealthPharm Central"
    },
    {
      id: "MED-002",
      name: "Lisinopril",
      dosage: "10 mg",
      frequency: "Once Daily",
      remainingCount: 24,
      threshold: 10,
      times: ["09:00 AM"],
      vendorName: "HealthPharm Central"
    },
    {
      id: "MED-003",
      name: "Metformin ER",
      dosage: "500 mg",
      frequency: "Twice Daily",
      remainingCount: 4,
      threshold: 15,
      times: ["08:00 AM", "07:00 PM"],
      vendorName: "Metro Rx Express"
    }
  ],
  emergencyContacts: [
    {
      name: "Eleanor Pendelton",
      relationship: "Daughter & Primary Caregiver",
      phone: "+1 (555) 019-2834"
    },
    {
      name: "Dr. Marcus Vance",
      relationship: "Attending Cardiologist",
      phone: "+1 (555) 482-9901"
    }
  ],
  historicalReports: [
    {
      reportId: "REP-2026-0412",
      date: "2026-04-12",
      category: "Cardiology Consultation",
      keyFindings: "Sinus rhythm with mild A-Fib episodes. Warfarin dosage maintained at 5mg daily. INR target range 2.0-3.0.",
      facility: "Bay Area Cardiovascular Institute"
    },
    {
      reportId: "REP-2025-1108",
      date: "2025-11-08",
      category: "Emergency Department Summary",
      keyFindings: "Minor mechanical fall in kitchen. CT head negative for acute intracranial bleed. Soft tissue contusion right hip.",
      facility: "UCSF Medical Center ER"
    },
    {
      reportId: "REP-2025-0620",
      date: "2025-06-20",
      category: "Endocrinology Quarterly Review",
      keyFindings: "HbA1c stable at 6.8%. Metformin ER 500mg twice daily well tolerated with good glycemic compliance.",
      facility: "St. Mary Medical Pavilion"
    }
  ],
  adherenceRate: 94.2,
  hapticIntensity: 80,
  lastSyncTimestamp: new Date().toISOString()
};

export const INITIAL_TELEMETRY: WearableTelemetry = {
  timestamp: new Date().toISOString(),
  accel_g: { x: 0.02, y: 0.98, z: 0.15, magnitude: 0.99 },
  heart_rate_bpm: 72,
  spo2_percent: 98,
  vocal_confirmation: 1,
  impact_detected: false,
  battery_level: 88,
  gps_location: {
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: "Market Street Suite 402, San Francisco, CA"
  }
};

export const TELEMETRY_PRESETS = {
  NORMAL: {
    name: "Normal Resting Telemetry",
    accel_g: { x: 0.03, y: 0.97, z: 0.12, magnitude: 0.98 },
    heart_rate_bpm: 72,
    spo2_percent: 98,
    vocal_confirmation: 1 as const,
    impact_detected: false,
  },
  HARD_FALL_CRITICAL: {
    name: "High-G Hard Fall (No Vocal Response)",
    accel_g: { x: 3.85, y: -4.12, z: 2.10, magnitude: 5.98 },
    heart_rate_bpm: 138,
    spo2_percent: 92,
    vocal_confirmation: 0 as const,
    impact_detected: true,
  },
  STUMBLE_SAFE: {
    name: "Stumble Impact (Vocal Confirmed Safe)",
    accel_g: { x: 2.10, y: 1.45, z: 0.88, magnitude: 2.70 },
    heart_rate_bpm: 104,
    spo2_percent: 97,
    vocal_confirmation: 1 as const,
    impact_detected: true,
  },
  CARDIO_STRESS: {
    name: "Physiological Stress Spike (Elevated PPG)",
    accel_g: { x: 0.12, y: 0.89, z: 0.32, magnitude: 0.95 },
    heart_rate_bpm: 145,
    spo2_percent: 91,
    vocal_confirmation: 0 as const,
    impact_detected: false,
  }
};
