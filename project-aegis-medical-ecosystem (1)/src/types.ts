export type PipelineTrigger = 
  | 'EMERGENCY_EVENT' 
  | 'SYMPTOM_CHECK' 
  | 'MEDICATION_SYNC' 
  | 'PASSPORT_GENERATE'
  | 'GET_PATIENT_PROFILE'
  | 'GENERATE_CRITICAL_REPORT';

export interface WearableTelemetry {
  timestamp: string;
  accel_g: { x: number; y: number; z: number; magnitude: number };
  heart_rate_bpm: number;
  spo2_percent: number;
  vocal_confirmation: 0 | 1; // 0 = no response, 1 = confirmed safe
  impact_detected: boolean;
  battery_level: number;
  gps_location: {
    latitude: number;
    longitude: number;
    location_name?: string;
    accuracy?: number;
    timestamp?: string;
    is_live?: boolean;
    is_cached?: boolean;
    location_url?: string;
  };
}

// Schema 1: Emergency Triage Pipeline Dispatch
export interface EmergencyTriageResponse {
  status_code: number;
  event_type: 'EMERGENCY_TRIAGE_EVALUATION';
  event_id: string;
  triage_summary: {
    emergency_level: 'CRITICAL_EMERGENCY_DISPATCH' | 'SAFE_FALSE_POSITIVE';
    kinematic_impact_detected: boolean;
    physiological_stress_flag: boolean;
    vocal_response_timeout: boolean;
    trigger_reason: string;
  };
  dispatch_payload: {
    patient_id: string;
    gps_location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp?: string;
      is_live?: boolean;
      is_cached?: boolean;
      location_url?: string;
    };
    vitals_at_impact: {
      impact_g_force: number;
      post_impact_hr_bpm: number;
    };
    target_recipients: ('EMERGENCY_SERVICES' | 'PRIMARY_CAREGIVER' | 'ER_HOSPITAL')[];
  };
}

// Schema 2: Symptom & Interaction Analysis
export interface SymptomEvaluationResponse {
  status_code: number;
  event_type: 'SYMPTOM_EVALUATION';
  analysis_id: string;
  triage_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE_ER';
  otc_recommendation: {
    drug_name: string;
    dosage: string;
    frequency: string;
    safety_checks: {
      allergy_check_passed: boolean;
      drug_interaction_passed: boolean;
      contraindications_identified: string[];
    };
  };
  telehealth_escalation: {
    required: boolean;
    reason: string;
  };
  disclaimer: string;
}

// Schema 3: Medication Inventory & Refill Dispatch
export interface MedicationRefillResponse {
  status_code: number;
  event_type: 'MEDICATION_ADHERENCE_CHECK';
  patient_id: string;
  adherence_percentage: number;
  reorder_triggers: {
    medication_id: string;
    medication_name: string;
    remaining_count: number;
    threshold_limit: number;
    auto_refill_initiated: boolean;
    fulfillment_vendor_id: string;
  }[];
  caregiver_alert: {
    alert_required: boolean;
    missed_dose_details: string;
  };
}

// Schema 4: Emergency Medical Passport Payload
export interface EmergencyPassportResponse {
  status_code: number;
  event_type: 'EMERGENCY_PASSPORT_GENERATION';
  passport_data: {
    patient_id: string;
    full_name: string;
    age: number;
    blood_group: string;
    chronic_conditions: string[];
    known_allergies: string[];
    active_medications: {
      name: string;
      dosage: string;
    }[];
    emergency_contacts: {
      name: string;
      relationship: string;
      phone: string;
    }[];
  };
}

// Schema 5: Patient Profile & Account Manager Payload
export interface PatientProfileFetchResponse {
  status_code: number;
  event_type: 'PATIENT_PROFILE_FETCH';
  patient_profile: {
    unique_patient_id: string;
    personal_details: {
      full_name: string;
      age: number;
      gender: string;
      blood_type: string;
      primary_language: string;
    };
    account_manager: {
      manager_id: string;
      full_name: string;
      role: string;
      organization: string;
      contact_email: string;
      direct_phone: string;
    };
    emergency_contacts: {
      name: string;
      relationship: string;
      phone: string;
    }[];
  };
}

// Schema 6: Immediate Emergency & Historical Medical Report Payload
export interface CriticalEmergencyReportResponse {
  status_code: number;
  event_type: 'CRITICAL_EMERGENCY_REPORT';
  report_timestamp: string;
  patient_summary: {
    unique_patient_id: string;
    full_name: string;
    age: number;
    blood_type: string;
    account_manager: string;
  };
  critical_clinical_alerts: string[];
  immediate_vitals_at_event: {
    heart_rate_bpm: number;
    spo2_percentage: number;
    impact_force_g: number;
    vocal_response_status: 'UNRESPONSIVE' | 'CONFIRMED_SAFE';
  };
  active_medical_profile: {
    chronic_conditions: string[];
    known_allergies: string[];
    active_prescriptions: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
  };
  historical_reports_summary: {
    report_id: string;
    date: string;
    category: string;
    key_findings: string;
    facility: string;
  }[];
}

export interface NationalIdInfo {
  type: 'Aadhaar (IN)' | 'SSN (US)' | 'ABHA Health ID' | 'Passport' | 'National ID Card';
  idNumber: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING' | 'REJECTED';
  verifiedAt?: string;
  issuingAuthority?: string;
  verificationHash?: string;
}

export interface NationalIdVerificationResponse {
  status_code: number;
  event_type: 'NATIONAL_ID_AUTHENTICATION';
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'FAILED';
  national_id_details: {
    type: string;
    masked_number: string;
    issuing_authority: string;
    matched_patient_name: string;
    verification_method: string;
    verified_timestamp: string;
    audit_hash: string;
  };
  matched_demographics: {
    dob_matched: boolean;
    name_matched: boolean;
    gender_matched: boolean;
  };
}

export interface TelemetryTimeSeriesPoint {
  time: string;
  heartRate: number;
  spo2: number;
  hrvMs: number;
  tempCelsius: number;
  accelG: number;
  anomaly?: string;
}

export interface HealthAnomalyAlert {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  metric: 'Heart Rate' | 'SpO2' | 'HRV' | 'Skin Temp' | 'Motion Impact';
  value: string;
  threshold: string;
  clinicalInsight: string;
  actionTaken: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  primaryLanguage?: string;
  nationalId?: NationalIdInfo;
  accountManager?: {
    managerId: string;
    fullName: string;
    role: string;
    organization: string;
    contactEmail: string;
    directPhone: string;
  };
  chronicConditions: string[];
  knownAllergies: string[];
  activeMedications: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    remainingCount: number;
    threshold: number;
    times: string[];
    vendorName: string;
  }[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  historicalReports?: {
    reportId: string;
    date: string;
    category: string;
    keyFindings: string;
    facility: string;
  }[];
  adherenceRate: number;
  hapticIntensity?: number;
  lastSyncTimestamp: string;
}
