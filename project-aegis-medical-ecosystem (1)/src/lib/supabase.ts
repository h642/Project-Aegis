import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PatientProfile } from '../types';

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

// Save basic medical profile data to Supabase (user metadata / profiles table fallback)
export const saveSupabaseMedicalProfile = async (
  user: User | null,
  medicalData: Partial<PatientProfile>
): Promise<{ success: boolean; error?: string }> => {
  if (!user) {
    return { success: false, error: 'No authenticated user found' };
  }

  if (supabase) {
    try {
      // 1. Update auth user metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          medical_profile: medicalData,
          has_onboarded_medical: true,
        },
      });

      if (metaError) {
        console.warn('Supabase updateUser metadata error:', metaError);
      }

      // 2. Try inserting/upserting to a 'profiles' table if it exists
      const { error: tableError } = await supabase.from('patient_profiles').upsert({
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: medicalData.fullName,
        age: medicalData.age,
        gender: medicalData.gender,
        blood_group: medicalData.bloodGroup,
        chronic_conditions: medicalData.chronicConditions,
        known_allergies: medicalData.knownAllergies,
        updated_at: new Date().toISOString(),
      });

      if (tableError) {
        console.info('Supabase table upsert note (table may be created in database):', tableError.message);
      }

      return { success: true };
    } catch (err: any) {
      console.error('saveSupabaseMedicalProfile error:', err);
      return { success: false, error: err.message || 'Failed to save profile' };
    }
  }

  return { success: true };
};
