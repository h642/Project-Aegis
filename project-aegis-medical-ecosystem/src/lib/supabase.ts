import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PatientProfile, WearableTelemetry, EmergencyTriageResponse } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authMethod?: 'email' | 'phone' | 'google';
  isLoading: boolean;
}

// 1. Save or Update Full Medical Profile in Supabase
export const saveSupabaseMedicalProfile = async (
  user: User | null,
  medicalData: Partial<PatientProfile>
): Promise<{ success: boolean; error?: string }> => {
  if (supabase) {
    try {
      // 1. Update auth user metadata if user is logged in via Supabase Auth
      if (user) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: {
            medical_profile: medicalData,
            has_onboarded_medical: true,
          },
        });

        if (metaError) {
          console.warn('Supabase updateUser metadata error:', metaError);
        }
      }

      const targetId = user?.id || medicalData.id || 'p_demo_01';

      // 2. Insert/Upsert into 'patient_profiles' database table
      const { error: tableError } = await supabase.from('patient_profiles').upsert({
        id: targetId,
        email: user?.email || (medicalData as any).email || 'patient@aegiscare.org',
        phone: user?.phone || (medicalData as any).phone || '+1 (555) 019-2831',
        full_name: medicalData.fullName || 'Rajesh Mishra',
        age: medicalData.age || 71,
        gender: medicalData.gender || 'Male',
        blood_group: medicalData.bloodGroup || 'O+',
        primary_language: medicalData.primaryLanguage || 'English',
        chronic_conditions: medicalData.chronicConditions || [],
        known_allergies: medicalData.knownAllergies || [],
        emergency_contacts: medicalData.emergencyContacts || [],
        active_medications: medicalData.activeMedications || [],
        medical_payload: medicalData,
        updated_at: new Date().toISOString(),
      });

      if (tableError) {
        console.warn('Supabase table upsert note:', tableError.message);
        return { success: false, error: tableError.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('saveSupabaseMedicalProfile error:', err);
      return { success: false, error: err.message || 'Failed to save profile' };
    }
  }

  return { success: true };
};

// 2. Fetch Patient Profile from Supabase
export const fetchSupabaseMedicalProfile = async (
  userId: string
): Promise<{ profile?: Partial<PatientProfile>; error?: string }> => {
  if (!supabase) return { error: 'Supabase client not initialized' };

  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return {
        profile: data.medical_payload || {
          fullName: data.full_name,
          age: data.age,
          gender: data.gender,
          bloodGroup: data.blood_group,
          chronicConditions: data.chronic_conditions,
          knownAllergies: data.known_allergies,
          emergencyContacts: data.emergency_contacts,
          activeMedications: data.active_medications,
        },
      };
    }
    return {};
  } catch (err: any) {
    console.warn('fetchSupabaseMedicalProfile error:', err.message);
    return { error: err.message };
  }
};

// 3. Save Realtime Wearable Telemetry Log
export const saveSupabaseTelemetryLog = async (
  userId: string,
  telemetry: WearableTelemetry
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false };

  try {
    const { error } = await supabase.from('telemetry_logs').insert({
      patient_id: userId,
      heart_rate_bpm: telemetry.heart_rate_bpm,
      spo2_percent: telemetry.spo2_percent,
      impact_detected: telemetry.impact_detected,
      accel_magnitude: telemetry.accel_g.magnitude,
      vocal_confirmation: telemetry.vocal_confirmation,
      battery_level: telemetry.battery_level,
      latitude: telemetry.gps_location.latitude,
      longitude: telemetry.gps_location.longitude,
      raw_payload: telemetry,
      created_at: new Date().toISOString(),
    });

    if (error) console.info('Telemetry log insert note:', error.message);
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// 4. Save Emergency Triage Pipeline Record
export const saveSupabaseTriageRecord = async (
  userId: string,
  triage: EmergencyTriageResponse
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false };

  try {
    const { error } = await supabase.from('triage_history').insert({
      patient_id: userId,
      event_id: triage.event_id,
      emergency_level: triage.triage_summary.emergency_level,
      trigger_reason: triage.triage_summary.trigger_reason,
      kinematic_impact: triage.triage_summary.kinematic_impact_detected,
      physiological_stress: triage.triage_summary.physiological_stress_flag,
      dispatch_recipients: triage.dispatch_payload.target_recipients,
      full_triage_payload: triage,
      created_at: new Date().toISOString(),
    });

    if (error) console.info('Triage record insert note:', error.message);
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

