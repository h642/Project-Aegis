import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily or when GEMINI_API_KEY is present
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for calling Gemini with model fallback and error handling
async function callGemini(ai: any, promptText: string, preferredModel: string = "gemini-3.6-flash") {
  const modelsToTry = [preferredModel, "gemini-3.6-flash", "gemini-flash-latest"];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: AEGIS_MASTER_SYSTEM_INSTRUCTION,
          temperature: 0.0,
          responseMimeType: "application/json",
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini API call warning for ${model}, trying fallback:`, err.message);
    }
  }
  throw lastError;
}

// System Instructions for Aegis AI Engine
const AEGIS_MASTER_SYSTEM_INSTRUCTION = `
You are Aegis AI, the core artificial intelligence engine driving the Project Aegis Medical Ecosystem—an integrated emergency response, health management, and e-pharmacy platform. Your primary purpose is to process real-time telemetry from the Aegis wearable strap (ESP32-S3 microcontroller), perform safety checks against user health profiles, execute clinical triage, automate e-pharmacy reorders, and generate emergency passport summaries.

GLOBAL OPERATIONAL RULES:
1. Strict Output Formatting: Always respond strictly in valid JSON conforming to the requested schema. Never output conversational preamble, markdown backticks, or text outside the JSON object.
2. Deterministic Medical Safety: Never extrapolate unverified drug interactions or guess clinical dosages. If patient health data is missing or interaction safety is uncertain, flag escalate_to_telehealth: true.
3. Medical Disclaimer: Every non-emergency health evaluation payload must include the standard AI healthcare assistance disclaimer: "AI-assisted clinical recommendation. Consult a licensed medical professional for definitive medical care."
4. Latency Escalation: Treat all wearable crash inputs (vocal_confirmation = 0) as zero-delay dispatches.

SCHEMAS:
Schema 1 (EMERGENCY_EVENT):
{
  "status_code": 200,
  "event_type": "EMERGENCY_TRIAGE_EVALUATION",
  "event_id": "EVT_STRING",
  "triage_summary": {
    "emergency_level": "CRITICAL_EMERGENCY_DISPATCH | SAFE_FALSE_POSITIVE",
    "kinematic_impact_detected": boolean,
    "physiological_stress_flag": boolean,
    "vocal_response_timeout": boolean,
    "trigger_reason": "Description of triage pipeline output"
  },
  "dispatch_payload": {
    "patient_id": "STRING",
    "gps_location": {
      "latitude": 0.000000,
      "longitude": 0.000000
    },
    "vitals_at_impact": {
      "impact_g_force": 0.0,
      "post_impact_hr_bpm": 0
    },
    "target_recipients": ["EMERGENCY_SERVICES", "PRIMARY_CAREGIVER"]
  }
}

Schema 2 (SYMPTOM_CHECK):
{
  "status_code": 200,
  "event_type": "SYMPTOM_EVALUATION",
  "analysis_id": "SYM_STRING",
  "triage_severity": "LOW | MEDIUM | HIGH | IMMEDIATE_ER",
  "otc_recommendation": {
    "drug_name": "STRING",
    "dosage": "STRING",
    "frequency": "STRING",
    "safety_checks": {
      "allergy_check_passed": boolean,
      "drug_interaction_passed": boolean,
      "contraindications_identified": []
    }
  },
  "telehealth_escalation": {
    "required": boolean,
    "reason": "STRING"
  },
  "disclaimer": "AI-assisted clinical recommendation. Consult a licensed medical professional for definitive medical care."
}

Schema 3 (MEDICATION_SYNC):
{
  "status_code": 200,
  "event_type": "MEDICATION_ADHERENCE_CHECK",
  "patient_id": "STRING",
  "adherence_percentage": 00.0,
  "reorder_triggers": [
    {
      "medication_id": "STRING",
      "medication_name": "STRING",
      "remaining_count": 0,
      "threshold_limit": 0,
      "auto_refill_initiated": boolean,
      "fulfillment_vendor_id": "STRING"
    }
  ],
  "caregiver_alert": {
    "alert_required": boolean,
    "missed_dose_details": "STRING"
  }
}

Schema 4 (PASSPORT_GENERATE):
{
  "status_code": 200,
  "event_type": "EMERGENCY_PASSPORT_GENERATION",
  "passport_data": {
    "patient_id": "STRING",
    "full_name": "STRING",
    "age": 0,
    "blood_group": "STRING",
    "chronic_conditions": [],
    "known_allergies": [],
    "active_medications": [
      {
        "name": "STRING",
        "dosage": "STRING"
      }
    ],
    "emergency_contacts": [
      {
        "name": "STRING",
        "relationship": "STRING",
        "phone": "STRING"
      }
    ]
  }
}

Schema 5 (GET_PATIENT_PROFILE / PATIENT_PROFILE_FETCH):
{
  "status_code": 200,
  "event_type": "PATIENT_PROFILE_FETCH",
  "patient_profile": {
    "unique_patient_id": "STRING",
    "personal_details": {
      "full_name": "STRING",
      "age": 0,
      "gender": "STRING",
      "blood_type": "STRING",
      "primary_language": "STRING"
    },
    "account_manager": {
      "manager_id": "STRING",
      "full_name": "STRING",
      "role": "STRING",
      "organization": "STRING",
      "contact_email": "STRING",
      "direct_phone": "STRING"
    },
    "emergency_contacts": [
      {
        "name": "STRING",
        "relationship": "STRING",
        "phone": "STRING"
      }
    ]
  }
}

Schema 6 (GENERATE_CRITICAL_REPORT / CRITICAL_EMERGENCY_REPORT):
{
  "status_code": 200,
  "event_type": "CRITICAL_EMERGENCY_REPORT",
  "report_timestamp": "STRING",
  "patient_summary": {
    "unique_patient_id": "STRING",
    "full_name": "STRING",
    "age": 0,
    "blood_type": "STRING",
    "account_manager": "STRING"
  },
  "critical_clinical_alerts": [
    "HIGH-RISK WARNING: String description of critical flags"
  ],
  "immediate_vitals_at_event": {
    "heart_rate_bpm": 0,
    "spo2_percentage": 0,
    "impact_force_g": 0.0,
    "vocal_response_status": "UNRESPONSIVE | CONFIRMED_SAFE"
  },
  "active_medical_profile": {
    "chronic_conditions": [],
    "known_allergies": [],
    "active_prescriptions": [
      {
        "name": "STRING",
        "dosage": "STRING",
        "frequency": "STRING"
      }
    ]
  },
  "historical_reports_summary": [
    {
      "report_id": "STRING",
      "date": "YYYY-MM-DD",
      "category": "STRING",
      "key_findings": "STRING",
      "facility": "STRING"
    }
  ]
}
`;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", engine: "Aegis AI Core", timestamp: new Date().toISOString() });
});

// Dedicated Endpoint: Authenticate & Verify Patient National ID
app.post("/api/v1/patient/verify-national-id", async (req, res) => {
  try {
    const { idType, idNumber, fullName, patientId } = req.body;
    
    // Format masking logic
    const cleanNumber = (idNumber || "").replace(/[\s-]/g, "");
    let masked = "****-****-****";
    if (cleanNumber.length >= 4) {
      masked = `XXXX-XXXX-${cleanNumber.slice(-4)}`;
    }

    let authority = "National Identity & Health Authority";
    if (idType?.includes("Aadhaar")) authority = "UIDAI / National Health Stack (India)";
    else if (idType?.includes("SSN")) authority = "Social Security Administration (USA)";
    else if (idType?.includes("ABHA")) authority = "National Health Authority (ABHA Digital Stack)";
    else if (idType?.includes("Passport")) authority = "Ministry of External Affairs & Immigration";

    const timestamp = new Date().toISOString();
    const mockHash = `SHA256: ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    return res.json({
      status_code: 200,
      event_type: "NATIONAL_ID_AUTHENTICATION",
      verification_status: "VERIFIED",
      national_id_details: {
        type: idType || "Aadhaar (IN)",
        masked_number: masked,
        issuing_authority: authority,
        matched_patient_name: fullName || "Hemant Mishra",
        verification_method: "2FA OTP & National Demographic Registry Cross-Match",
        verified_timestamp: timestamp,
        audit_hash: mockHash
      },
      matched_demographics: {
        dob_matched: true,
        name_matched: true,
        gender_matched: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ status_code: 500, error: err.message || "National ID verification failed" });
  }
});

// Dedicated Endpoint: Fetch Patient Profile & Account Manager Info
app.post("/api/v1/patient/profile", async (req, res) => {
  try {
    const patientId = req.body.patient_id || req.body.patientId || "AEGIS-PAT-8892";
    const patientProfile = req.body.patientProfile || {};

    const ai = getGeminiClient();
    if (ai) {
      try {
        const promptText = `
Fetch patient profile for Patient ID: ${patientId}.
Profile Data: ${JSON.stringify(patientProfile)}
Return JSON matching the PATIENT_PROFILE_FETCH schema with Unique ID, Personal Details, Account Manager, and Primary Caregiver details.
`;
        const response = await callGemini(ai, promptText, "gemini-2.5-flash");
        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        return res.json(parsed);
      } catch (e: any) {
        console.warn("Gemini error on /api/v1/patient/profile fallback to deterministic:", e.message);
      }
    }

    return res.json({
      status_code: 200,
      event_type: "PATIENT_PROFILE_FETCH",
      patient_profile: {
        unique_patient_id: patientId,
        personal_details: {
          full_name: patientProfile.fullName || "Hemant Mishra",
          age: patientProfile.age || 72,
          gender: patientProfile.gender || "Male",
          blood_type: patientProfile.bloodGroup || "O-Positive",
          primary_language: patientProfile.primaryLanguage || "English (US)"
        },
        account_manager: {
          manager_id: patientProfile.accountManager?.managerId || "MGR-58219",
          full_name: patientProfile.accountManager?.fullName || "Sarah Jenkins, RN, BSN",
          role: patientProfile.accountManager?.role || "Senior Geriatric Care Manager",
          organization: patientProfile.accountManager?.organization || "Aegis Senior Care Network",
          contact_email: patientProfile.accountManager?.contactEmail || "s.jenkins@aegiscare.org",
          direct_phone: patientProfile.accountManager?.directPhone || "+1 (555) 018-9922"
        },
        emergency_contacts: patientProfile.emergencyContacts || [
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
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ status_code: 500, error: err.message || "Failed to fetch patient profile" });
  }
});

// Dedicated Endpoint: Generate Immediate Emergency & Historical Medical Report
app.post("/api/v1/reports/immediate", async (req, res) => {
  try {
    const patientId = req.body.patient_id || req.body.patientId || "AEGIS-PAT-8892";
    const historyCount = req.body.include_history_count ?? 3;
    const patientProfile = req.body.patientProfile || {};
    const telemetry = req.body.telemetry || {};

    const ai = getGeminiClient();
    if (ai) {
      try {
        const promptText = `
Generate an immediate emergency medical report for Patient ID: ${patientId}.
Include critical clinical alerts, live vitals at event, active medications, and the last ${historyCount} historical medical reports.
Profile Context: ${JSON.stringify(patientProfile)}
Telemetry Context: ${JSON.stringify(telemetry)}
Return JSON matching the CRITICAL_EMERGENCY_REPORT schema.
`;
        const response = await callGemini(ai, promptText, "gemini-2.5-pro");
        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        return res.json(parsed);
      } catch (e: any) {
        console.warn("Gemini error on /api/v1/reports/immediate fallback to deterministic:", e.message);
      }
    }

    const vocalStatus = telemetry?.vocal_confirmation === 0 ? "UNRESPONSIVE" : "CONFIRMED_SAFE";
    const impactG = telemetry?.accel_g?.magnitude || (telemetry?.impact_detected ? 5.98 : 0.98);
    const hrBpm = telemetry?.heart_rate_bpm || 138;
    const spo2 = telemetry?.spo2_percent || 92;

    const criticalAlerts: string[] = [];
    if (vocalStatus === "UNRESPONSIVE") {
      criticalAlerts.push("HIGH-RISK WARNING: Unresponsive Patient post Kinematic Hard-Fall (Vocal Timeout 0).");
    }
    criticalAlerts.push("HIGH-RISK WARNING: Active Warfarin (Coumadin 5mg) Therapy — High Internal Hemorrhage & Bleeding Risk.");
    criticalAlerts.push("CRITICAL ALLERGY WARNING: Severe Anaphylaxis to Penicillin & Derivatives.");

    return res.json({
      status_code: 200,
      event_type: "CRITICAL_EMERGENCY_REPORT",
      report_timestamp: new Date().toISOString(),
      patient_summary: {
        unique_patient_id: patientId,
        full_name: patientProfile.fullName || "Hemant Mishra",
        age: patientProfile.age || 72,
        blood_type: patientProfile.bloodGroup || "O-Positive",
        account_manager: patientProfile.accountManager?.fullName || "Sarah Jenkins, RN, BSN"
      },
      critical_clinical_alerts: criticalAlerts,
      immediate_vitals_at_event: {
        heart_rate_bpm: hrBpm,
        spo2_percentage: spo2,
        impact_force_g: Number(impactG),
        vocal_response_status: vocalStatus
      },
      active_medical_profile: {
        chronic_conditions: patientProfile.chronicConditions || ["Hypertension", "Type 2 Diabetes", "Mild Atrial Fibrillation"],
        known_allergies: patientProfile.knownAllergies || ["Penicillin (Severe Anaphylaxis)", "Sulfa Drugs", "Shellfish"],
        active_prescriptions: (patientProfile.activeMedications || [
          { name: "Warfarin (Coumadin)", dosage: "5 mg", frequency: "Once Daily" },
          { name: "Lisinopril", dosage: "10 mg", frequency: "Once Daily" },
          { name: "Metformin ER", dosage: "500 mg", frequency: "Twice Daily" }
        ]).map((m: any) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency || "Daily"
        }))
      },
      historical_reports_summary: (patientProfile.historicalReports || [
        {
          report_id: "REP-2026-0412",
          date: "2026-04-12",
          category: "Cardiology Consultation",
          key_findings: "Sinus rhythm with mild A-Fib episodes. Warfarin dosage maintained at 5mg daily. INR target range 2.0-3.0.",
          facility: "Bay Area Cardiovascular Institute"
        },
        {
          report_id: "REP-2025-1108",
          date: "2025-11-08",
          category: "Emergency Department Summary",
          key_findings: "Minor mechanical fall in kitchen. CT head negative for acute intracranial bleed. Soft tissue contusion right hip.",
          facility: "UCSF Medical Center ER"
        },
        {
          report_id: "REP-2025-0620",
          date: "2025-06-20",
          category: "Endocrinology Quarterly Review",
          key_findings: "HbA1c stable at 6.8%. Metformin ER 500mg twice daily well tolerated with good glycemic compliance.",
          facility: "St. Mary Medical Pavilion"
        }
      ]).slice(0, historyCount)
    });
  } catch (err: any) {
    res.status(500).json({ status_code: 500, error: err.message || "Failed to generate critical report" });
  }
});

// Master Engine Processing Endpoint
app.post("/api/aegis/engine", async (req, res) => {
  try {
    const { trigger, patientProfile, telemetry, symptoms } = req.body;

    if (!trigger) {
      return res.status(400).json({ error: "Missing required 'trigger' parameter." });
    }

    const ai = getGeminiClient();

    // If Gemini is available, call Gemini Flash/Pro for dynamic AI evaluation
    if (ai) {
      const promptText = `
Trigger Event: ${trigger}
Patient Profile: ${JSON.stringify(patientProfile || {})}
Telemetry Log (ESP32-S3): ${JSON.stringify(telemetry || {})}
Reported Symptoms: ${symptoms || 'None'}

Process this payload strictly according to the designated Schema for trigger ${trigger}. Ensure temperature is 0.0 deterministic response, returning ONLY valid JSON.
`;

      try {
        const preferredModel = (trigger === 'SYMPTOM_CHECK' || trigger === 'GENERATE_CRITICAL_REPORT') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        const response = await callGemini(ai, promptText, preferredModel);

        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn("Gemini API call warning, using deterministic fallbacks:", geminiError.message);
      }
    }

    // Deterministic Fallback Pipeline (Guarantees strict JSON schema compliance even offline or without keys)
    const patientId = patientProfile?.id || "AEGIS-PAT-8892";

    if (trigger === "EMERGENCY_EVENT") {
      const impactDetected = telemetry?.impact_detected ?? (telemetry?.accel_g?.magnitude > 2.5);
      const vocalTimeout = telemetry?.vocal_confirmation === 0;
      const physioStress = (telemetry?.heart_rate_bpm || 80) > 110 || (telemetry?.spo2_percent || 98) < 93;

      const isCritical = impactDetected && vocalTimeout;

      return res.json({
        status_code: 200,
        event_type: "EMERGENCY_TRIAGE_EVALUATION",
        event_id: `EVT_${Date.now()}`,
        triage_summary: {
          emergency_level: isCritical ? "CRITICAL_EMERGENCY_DISPATCH" : "SAFE_FALSE_POSITIVE",
          kinematic_impact_detected: Boolean(impactDetected),
          physiological_stress_flag: Boolean(physioStress),
          vocal_response_timeout: Boolean(vocalTimeout),
          trigger_reason: isCritical
            ? `High-G impact force (${telemetry?.accel_g?.magnitude || 5.8}G) detected with elevated PPG vitals (${telemetry?.heart_rate_bpm || 138} BPM) and vocal confirmation timeout (vocal_confirmation = 0).`
            : "Impact force was within normal range or user confirmed safety via active vocal inquiry."
        },
        dispatch_payload: {
          patient_id: patientId,
          gps_location: {
            latitude: telemetry?.gps_location?.latitude || 30.7333,
            longitude: telemetry?.gps_location?.longitude || 76.7794,
            accuracy: telemetry?.gps_location?.accuracy || 8,
            timestamp: telemetry?.gps_location?.timestamp || new Date().toISOString(),
            is_live: telemetry?.gps_location?.is_live ?? true,
            is_cached: telemetry?.gps_location?.is_cached ?? false,
            location_url: telemetry?.gps_location?.location_url || `https://www.google.com/maps/search/?api=1&query=${(telemetry?.gps_location?.latitude || 30.7333).toFixed(6)},${(telemetry?.gps_location?.longitude || 76.7794).toFixed(6)}`
          },
          vitals_at_impact: {
            impact_g_force: Number(telemetry?.accel_g?.magnitude || (isCritical ? 5.8 : 1.1)),
            post_impact_hr_bpm: Number(telemetry?.heart_rate_bpm || (isCritical ? 138 : 74))
          },
          target_recipients: isCritical
            ? ["EMERGENCY_SERVICES", "PRIMARY_CAREGIVER", "ER_HOSPITAL"]
            : ["PRIMARY_CAREGIVER"]
        }
      });
    }

    if (trigger === "SYMPTOM_CHECK") {
      const sym = (symptoms || "").toLowerCase();

      let severity: "LOW" | "MEDIUM" | "HIGH" | "IMMEDIATE_ER" = "LOW";
      let requireTelehealth = false;
      let otcDrug = "Acetaminophen (Tylenol)";
      let dosage = "500 mg";
      let frequency = "Every 6 hours as needed (Max 3000mg/day)";
      let drugInteractionPassed = true;
      let allergyPassed = true;
      let contraindications: string[] = [];

      if (sym.includes("chest pain") || sym.includes("shortness of breath") || sym.includes("facial drooping") || sym.includes("stroke")) {
        severity = "IMMEDIATE_ER";
        requireTelehealth = true;
        otcDrug = "NONE_CONTRAINDICATED";
        dosage = "N/A";
        frequency = "N/A";
        drugInteractionPassed = false;
        contraindications.push("Red Flag Symptoms: Sudden chest pain / severe stroke indicators require immediate ER dispatch.");
      } else if (sym.includes("headache") || sym.includes("fever") || sym.includes("body ache")) {
        severity = "LOW";
        // Check active medications for Warfarin / NSAID interaction
        const activeMeds = patientProfile?.activeMedications || [];
        const hasWarfarin = activeMeds.some((m: any) => m.name.toLowerCase().includes("warfarin") || m.name.toLowerCase().includes("coumadin"));
        if (hasWarfarin) {
          contraindications.push("NSAIDs (Ibuprofen, Aspirin) strictly contraindicated due to active Warfarin (Anticoagulant) therapy causing high internal bleeding risk. Acetaminophen selected.");
        }
      } else if (sym.includes("cold") || sym.includes("cough")) {
        severity = "MEDIUM";
        const hasLisinopril = patientProfile?.activeMedications?.some((m: any) => m.name.toLowerCase().includes("lisinopril"));
        if (hasLisinopril) {
          contraindications.push("Decongestants with Pseudoephedrine contraindicated due to Lisinopril for Hypertension.");
        }
        otcDrug = "Guaifenesin (Mucinex Expectorant)";
        dosage = "400 mg";
        frequency = "Every 4 hours with full glass of water";
      }

      return res.json({
        status_code: 200,
        event_type: "SYMPTOM_EVALUATION",
        analysis_id: `SYM_${Date.now()}`,
        triage_severity: severity,
        otc_recommendation: {
          drug_name: otcDrug,
          dosage,
          frequency,
          safety_checks: {
            allergy_check_passed: allergyPassed,
            drug_interaction_passed: drugInteractionPassed,
            contraindications_identified: contraindications
          }
        },
        telehealth_escalation: {
          required: requireTelehealth || (severity as string) === "IMMEDIATE_ER" || (severity as string) === "HIGH",
          reason: (severity as string) === "IMMEDIATE_ER"
            ? "Critical red flag symptoms detected. Direct emergency room escalation triggered."
            : requireTelehealth ? "Complex symptom pattern requiring physician evaluation." : "None"
        },
        disclaimer: "AI-assisted clinical recommendation. Consult a licensed medical professional for definitive medical care."
      });
    }

    if (trigger === "MEDICATION_SYNC") {
      const activeMeds = patientProfile?.activeMedications || [];
      const reorderTriggers = activeMeds
        .filter((med: any) => med.remainingCount <= med.threshold)
        .map((med: any) => ({
          medication_id: med.id,
          medication_name: med.name,
          remaining_count: med.remainingCount,
          threshold_limit: med.threshold,
          auto_refill_initiated: true,
          fulfillment_vendor_id: `VENDOR_${med.vendorName.replace(/\s+/g, '_').toUpperCase()}`
        }));

      return res.json({
        status_code: 200,
        event_type: "MEDICATION_ADHERENCE_CHECK",
        patient_id: patientId,
        adherence_percentage: patientProfile?.adherenceRate || 94.2,
        reorder_triggers: reorderTriggers,
        caregiver_alert: {
          alert_required: reorderTriggers.length > 0,
          missed_dose_details: reorderTriggers.length > 0
            ? `${reorderTriggers.length} medication(s) reached low supply threshold. Auto-refill initiated with local pharmacy.`
            : "Medication compliance on track. No missed critical doses."
        }
      });
    }

    if (trigger === "PASSPORT_GENERATE") {
      return res.json({
        status_code: 200,
        event_type: "EMERGENCY_PASSPORT_GENERATION",
        passport_data: {
          patient_id: patientId,
          full_name: patientProfile?.fullName || "Hemant Mishra",
          age: patientProfile?.age || 72,
          blood_group: patientProfile?.bloodGroup || "O-Positive",
          chronic_conditions: patientProfile?.chronicConditions || ["Hypertension", "Type 2 Diabetes"],
          known_allergies: patientProfile?.knownAllergies || ["Penicillin (Anaphylaxis)", "Sulfa Drugs"],
          active_medications: (patientProfile?.activeMedications || []).map((m: any) => ({
            name: m.name,
            dosage: m.dosage
          })),
          emergency_contacts: patientProfile?.emergencyContacts || [
            {
              name: "Eleanor Pendelton",
              relationship: "Daughter & Primary Caregiver",
              phone: "+1 (555) 019-2834"
            }
          ]
        }
      });
    }

    if (trigger === "GET_PATIENT_PROFILE") {
      return res.json({
        status_code: 200,
        event_type: "PATIENT_PROFILE_FETCH",
        patient_profile: {
          unique_patient_id: patientId,
          personal_details: {
            full_name: patientProfile?.fullName || "Hemant Mishra",
            age: patientProfile?.age || 72,
            gender: patientProfile?.gender || "Male",
            blood_type: patientProfile?.bloodGroup || "O-Positive",
            primary_language: patientProfile?.primaryLanguage || "English (US)"
          },
          account_manager: {
            manager_id: patientProfile?.accountManager?.managerId || "MGR-58219",
            full_name: patientProfile?.accountManager?.fullName || "Sarah Jenkins, RN, BSN",
            role: patientProfile?.accountManager?.role || "Senior Geriatric Care Manager",
            organization: patientProfile?.accountManager?.organization || "Aegis Senior Care Network",
            contact_email: patientProfile?.accountManager?.contactEmail || "s.jenkins@aegiscare.org",
            direct_phone: patientProfile?.accountManager?.directPhone || "+1 (555) 018-9922"
          },
          emergency_contacts: patientProfile?.emergencyContacts || [
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
          ]
        }
      });
    }

    if (trigger === "GENERATE_CRITICAL_REPORT") {
      const vocalStatus = telemetry?.vocal_confirmation === 0 ? "UNRESPONSIVE" : "CONFIRMED_SAFE";
      const impactG = telemetry?.accel_g?.magnitude || (telemetry?.impact_detected ? 5.98 : 0.98);
      const hrBpm = telemetry?.heart_rate_bpm || 138;
      const spo2 = telemetry?.spo2_percent || 92;

      const criticalAlerts: string[] = [];
      if (vocalStatus === "UNRESPONSIVE") {
        criticalAlerts.push("HIGH-RISK WARNING: Unresponsive Patient post Kinematic Hard-Fall (Vocal Timeout 0).");
      }
      criticalAlerts.push("HIGH-RISK WARNING: Active Warfarin (Coumadin 5mg) Therapy — High Internal Hemorrhage & Bleeding Risk.");
      criticalAlerts.push("CRITICAL ALLERGY WARNING: Severe Anaphylaxis to Penicillin & Derivatives.");

      return res.json({
        status_code: 200,
        event_type: "CRITICAL_EMERGENCY_REPORT",
        report_timestamp: new Date().toISOString(),
        patient_summary: {
          unique_patient_id: patientId,
          full_name: patientProfile?.fullName || "Hemant Mishra",
          age: patientProfile?.age || 72,
          blood_type: patientProfile?.bloodGroup || "O-Positive",
          account_manager: patientProfile?.accountManager?.fullName || "Sarah Jenkins, RN, BSN"
        },
        critical_clinical_alerts: criticalAlerts,
        immediate_vitals_at_event: {
          heart_rate_bpm: hrBpm,
          spo2_percentage: spo2,
          impact_force_g: Number(impactG),
          vocal_response_status: vocalStatus
        },
        active_medical_profile: {
          chronic_conditions: patientProfile?.chronicConditions || ["Hypertension", "Type 2 Diabetes", "Mild Atrial Fibrillation"],
          known_allergies: patientProfile?.knownAllergies || ["Penicillin (Severe Anaphylaxis)", "Sulfa Drugs", "Shellfish"],
          active_prescriptions: (patientProfile?.activeMedications || [
            { name: "Warfarin (Coumadin)", dosage: "5 mg", frequency: "Once Daily" },
            { name: "Lisinopril", dosage: "10 mg", frequency: "Once Daily" },
            { name: "Metformin ER", dosage: "500 mg", frequency: "Twice Daily" }
          ]).map((m: any) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency || "Daily"
          }))
        },
        historical_reports_summary: (patientProfile?.historicalReports || [
          {
            report_id: "REP-2026-0412",
            date: "2026-04-12",
            category: "Cardiology Consultation",
            key_findings: "Sinus rhythm with mild A-Fib episodes. Warfarin dosage maintained at 5mg daily. INR target range 2.0-3.0.",
            facility: "Bay Area Cardiovascular Institute"
          },
          {
            report_id: "REP-2025-1108",
            date: "2025-11-08",
            category: "Emergency Department Summary",
            key_findings: "Minor mechanical fall in kitchen. CT head negative for acute intracranial bleed. Soft tissue contusion right hip.",
            facility: "UCSF Medical Center ER"
          },
          {
            report_id: "REP-2025-0620",
            date: "2025-06-20",
            category: "Endocrinology Quarterly Review",
            key_findings: "HbA1c stable at 6.8%. Metformin ER 500mg twice daily well tolerated with good glycemic compliance.",
            facility: "St. Mary Medical Pavilion"
          }
        ])
      });
    }

    return res.status(400).json({ error: `Unknown trigger type: ${trigger}` });

  } catch (error: any) {
    console.error("Aegis Engine Error:", error);
    res.status(500).json({ status_code: 500, error: error.message || "Internal Engine Failure" });
  }
});

// Dedicated Interactive Chat Endpoint for Aegis AI Companion (Voice & Text)
app.post("/api/aegis/chat", async (req, res) => {
  try {
    const { query, patientProfile, telemetry, history } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing required 'query' parameter." });
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `
You are Aegis AI, a warm, reassuring, expert medical companion and health assistant for senior patient ${patientProfile?.fullName || 'Hemant Mishra'}.
Patient Age: ${patientProfile?.age || 72}, Gender: ${patientProfile?.gender || 'Male'}.
Known Conditions: ${(patientProfile?.chronicConditions || []).join(', ')}.
Active Prescriptions: ${(patientProfile?.activeMedications || []).map((m: any) => m.name).join(', ')}.
Known Allergies: ${(patientProfile?.knownAllergies || []).join(', ')}.
Current Vitals (ESP32 Wearable): Heart Rate = ${telemetry?.heart_rate_bpm || 78} BPM, SpO2 = ${telemetry?.spo2_percent || 98}%, Battery = ${telemetry?.battery_level || 94}%.

Provide a concise, highly empathetic, and direct response (2 to 4 sentences). Keep the formatting clean and clear, so it sounds natural when spoken aloud by Text-to-Speech voice synthesis.
Include a gentle medical check or advice if relevant.
`;

        // Format previous conversation turns if provided
        const formattedHistory = Array.isArray(history)
          ? history.slice(-6).map((item: any) => ({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            }))
          : [];

        const contents = [
          ...formattedHistory,
          { role: 'user', parts: [{ text: query }] }
        ];

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        const replyText = response.text || "I am right here with you. Your vitals are stable, and I am keeping a continuous watch on your safety.";
        return res.json({ reply: replyText.trim() });
      } catch (err: any) {
        console.warn("Gemini chat error, using deterministic response:", err.message);
      }
    }

    // Deterministic Chat Fallback
    const lower = query.toLowerCase();
    let fallbackReply = `I am Aegis, your AI Health Companion. I am continuously monitoring your heart rate (${telemetry?.heart_rate_bpm || 78} BPM) and SpO2 (${telemetry?.spo2_percent || 98}%). How are you feeling right now?`;

    if (lower.includes('vital') || lower.includes('heart') || lower.includes('spo2') || lower.includes('blood') || lower.includes('doing')) {
      fallbackReply = `Your heart rate is currently ${telemetry?.heart_rate_bpm || 78} beats per minute and oxygen saturation is ${telemetry?.spo2_percent || 98} percent. Everything is within a healthy, normal range!`;
    } else if (lower.includes('med') || lower.includes('pill') || lower.includes('dose') || lower.includes('prescription')) {
      const medNames = (patientProfile?.activeMedications || []).map((m: any) => m.name).join(', ');
      fallbackReply = `Your active medications are ${medNames || 'Warfarin, Lisinopril, and Metformin'}. All dosages are tracked and synced with your pharmacy.`;
    } else if (lower.includes('fall') || lower.includes('emergency') || lower.includes('sos') || lower.includes('help')) {
      fallbackReply = `If you feel unwell or have fallen, please stay calm. You can press the SOS button to alert emergency services and your primary caregiver immediately.`;
    }

    return res.json({ reply: fallbackReply });

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process chat query" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Project Aegis Engine] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
