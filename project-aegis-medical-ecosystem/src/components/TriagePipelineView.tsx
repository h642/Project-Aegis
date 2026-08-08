import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertOctagon, CheckCircle2, Mic, MicOff, Radio, MapPin, Send, Cpu, Heart, RefreshCw, Zap, BellRing, ExternalLink } from 'lucide-react';
import { PatientProfile, WearableTelemetry, EmergencyTriageResponse } from '../types';
import { TELEMETRY_PRESETS } from '../data/mockData';
import { fetchCurrentGpsLocation } from '../utils/locationService';

interface TriagePipelineViewProps {
  patient: PatientProfile;
  setPatient?: React.Dispatch<React.SetStateAction<PatientProfile>>;
  telemetry: WearableTelemetry;
  setTelemetry: React.Dispatch<React.SetStateAction<WearableTelemetry>>;
  onExecuteTrigger: (trigger: 'EMERGENCY_EVENT', customTelemetry?: WearableTelemetry) => Promise<EmergencyTriageResponse>;
}

export const TriagePipelineView: React.FC<TriagePipelineViewProps> = ({
  patient,
  setPatient,
  telemetry,
  setTelemetry,
  onExecuteTrigger,
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingHaptics, setIsTestingHaptics] = useState(false);
  const [hapticIntensity, setHapticIntensity] = useState<number>(patient.hapticIntensity ?? 80);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [hapticConfirmation, setHapticConfirmation] = useState<{
    active: boolean;
    timestamp: string;
    pattern: string;
    deviceId: string;
    acknowledged: boolean;
  } | null>(null);
  const [lastResponse, setLastResponse] = useState<EmergencyTriageResponse | null>(null);
  const [waveData, setWaveData] = useState<number[]>([40, 45, 42, 48, 44, 46, 50, 43, 47, 49, 45]);

  useEffect(() => {
    if (patient.hapticIntensity !== undefined) {
      setHapticIntensity(patient.hapticIntensity);
    }
  }, [patient.hapticIntensity]);

  // Simulate real-time continuous sensor noise / pulse wave
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveData((prev) => {
        const nextVal = Math.max(20, Math.min(80, prev[prev.length - 1] + (Math.random() * 14 - 7)));
        return [...prev.slice(1), nextVal];
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for vocal confirmation (30s inquiry)
  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Countdown reached 0 -> vocal response timed out (vocal_confirmation = 0)
      handleVocalTimeout();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleApplyPreset = (presetKey: keyof typeof TELEMETRY_PRESETS) => {
    const p = TELEMETRY_PRESETS[presetKey];
    const newTelemetry: WearableTelemetry = {
      ...telemetry,
      accel_g: p.accel_g,
      heart_rate_bpm: p.heart_rate_bpm,
      spo2_percent: p.spo2_percent,
      vocal_confirmation: p.vocal_confirmation,
      impact_detected: p.impact_detected,
      timestamp: new Date().toISOString(),
    };
    setTelemetry(newTelemetry);

    if (p.impact_detected && p.vocal_confirmation === 0) {
      // Start 30s countdown for vocal inquiry
      setCountdown(30);
    } else {
      setCountdown(null);
    }
  };

  const handleTestHaptics = () => {
    setIsTestingHaptics(true);
    setTimeout(() => {
      setIsTestingHaptics(false);
      setHapticConfirmation({
        active: true,
        timestamp: new Date().toLocaleTimeString(),
        pattern: `Dual Pulse Vibration @ ${hapticIntensity}% Intensity (${hapticIntensity >= 75 ? '180 Hz Emergency Pulse' : hapticIntensity >= 40 ? '120 Hz Standard Alert' : '80 Hz Gentle Prompt'})`,
        deviceId: 'ESP32-S3-AEGIS-STRAP',
        acknowledged: true,
      });
    }, 500);
  };

  const handleSaveHapticIntensity = (value: number) => {
    setHapticIntensity(value);
    if (setPatient) {
      setPatient((prev) => ({
        ...prev,
        hapticIntensity: value,
      }));
    }
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const handleVocalTimeout = async () => {
    setCountdown(null);
    setIsProcessing(true);
    const loc = await fetchCurrentGpsLocation(true, 4000);
    const updated: WearableTelemetry = { 
      ...telemetry, 
      vocal_confirmation: 0 as const,
      gps_location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy || 8,
        timestamp: loc.timestamp,
        is_live: loc.is_live,
        is_cached: loc.is_cached,
        location_name: loc.location_name,
        location_url: loc.location_url,
      }
    };
    setTelemetry(updated);
    const res = await onExecuteTrigger('EMERGENCY_EVENT', updated);
    setLastResponse(res);
    setIsProcessing(false);
  };

  const handleVocalSafeConfirm = async () => {
    setCountdown(null);
    setIsProcessing(true);
    const loc = await fetchCurrentGpsLocation(true, 4000);
    const updated: WearableTelemetry = { 
      ...telemetry, 
      vocal_confirmation: 1 as const,
      gps_location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy || 8,
        timestamp: loc.timestamp,
        is_live: loc.is_live,
        is_cached: loc.is_cached,
        location_name: loc.location_name,
        location_url: loc.location_url,
      }
    };
    setTelemetry(updated);
    const res = await onExecuteTrigger('EMERGENCY_EVENT', updated);
    setLastResponse(res);
    setIsProcessing(false);
  };

  const handleRunEvaluation = async () => {
    setIsProcessing(true);
    const loc = await fetchCurrentGpsLocation(true, 4000);
    const updated: WearableTelemetry = {
      ...telemetry,
      gps_location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy || 8,
        timestamp: loc.timestamp,
        is_live: loc.is_live,
        is_cached: loc.is_cached,
        location_name: loc.location_name,
        location_url: loc.location_url,
      }
    };
    setTelemetry(updated);
    const res = await onExecuteTrigger('EMERGENCY_EVENT', updated);
    setLastResponse(res);
    setIsProcessing(false);
  };

  const isImpact = telemetry.impact_detected || telemetry.accel_g.magnitude > 2.5;
  const isPhysioStress = telemetry.heart_rate_bpm > 110 || telemetry.spo2_percent < 93;
  const isVocalTimeout = telemetry.vocal_confirmation === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('triage.title')}
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t('triage.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestHaptics}
              disabled={isTestingHaptics}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Send vibration pulse command to ESP32-S3 hardware"
            >
              <BellRing className={`h-4 w-4 ${isTestingHaptics ? 'animate-bounce' : ''}`} />
              <span>{isTestingHaptics ? 'Sending Signal...' : 'Test Wearable Haptics'}</span>
            </button>

            <button
              onClick={handleRunEvaluation}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>{isProcessing ? 'Evaluating Triage...' : 'Execute AI Triage Check'}</span>
            </button>
          </div>
        </div>

        {/* Simulator Preset Control Buttons */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Telemetry Hardware Simulator Presets (ESP32-S3):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleApplyPreset('NORMAL')}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all cursor-pointer text-left"
            >
              <span className="font-semibold text-slate-800 dark:text-slate-200">1. Normal Walk</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">0.99G • 72 BPM</span>
            </button>

            <button
              onClick={() => handleApplyPreset('HARD_FALL_CRITICAL')}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-900 dark:text-red-200 text-xs font-medium transition-all cursor-pointer text-left"
            >
              <span className="font-bold text-red-700 dark:text-red-300">2. High-G Hard Fall</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-mono">5.98G • 138 BPM</span>
            </button>

            <button
              onClick={() => handleApplyPreset('STUMBLE_SAFE')}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-medium transition-all cursor-pointer text-left"
            >
              <span className="font-semibold text-amber-800 dark:text-amber-300">3. Stumble (Safe)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono">2.70G • Safe Vocal</span>
            </button>

            <button
              onClick={() => handleApplyPreset('CARDIO_STRESS')}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-medium transition-all cursor-pointer text-left"
            >
              <span className="font-semibold text-indigo-800 dark:text-indigo-300">4. Cardio Stress</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 font-mono">145 BPM Spike</span>
            </button>
          </div>
        </div>

        {/* Wearable Haptic Motor Intensity Configuration Panel */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                <BellRing className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  ESP32-S3 Haptic Vibration Intensity Setting
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Configure hardware PWM motor signal saved to Patient Profile ({patient.id})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSavedFeedback && (
                <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 animate-fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Preference Saved
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border font-mono ${
                hapticIntensity >= 75
                  ? 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                  : hapticIntensity >= 40
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}>
                {hapticIntensity}% Intensity • {
                  hapticIntensity >= 75 ? 'HIGH EMERGENCY PULSE' : hapticIntensity >= 40 ? 'MEDIUM NOTIFICATION' : 'LOW GENTLE ALERT'
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">10%</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={hapticIntensity}
                onChange={(e) => handleSaveHapticIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Adjust ESP32-S3 haptic vibration intensity slider"
              />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">100%</span>
            </div>

            <div className="md:col-span-4 flex items-center justify-end gap-2">
              <button
                onClick={handleTestHaptics}
                disabled={isTestingHaptics}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <BellRing className={`h-3.5 w-3.5 text-indigo-400 ${isTestingHaptics ? 'animate-bounce' : ''}`} />
                <span>Test {hapticIntensity}% Pulse Signal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Haptic Confirmation Status Toast / Banner */}
      {hapticConfirmation && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl shadow-lg flex items-center justify-between animate-fade-in text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">ESP32-S3 HAPTIC VIBRATION CONFIRMED</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-bold">
                  SIGNAL ACK 200
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Pattern: <span className="text-emerald-300 font-semibold">{hapticConfirmation.pattern}</span> • Target: <span className="text-slate-200">{hapticConfirmation.deviceId}</span> • Time: {hapticConfirmation.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={() => setHapticConfirmation(null)}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 cursor-pointer font-sans"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sensor Feeds & 3 Pipeline Stages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stage 1: Kinematic Fall Detection */}
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-sm transition-all ${
          isImpact ? 'border-red-400 dark:border-red-600 ring-2 ring-red-400/20' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Kinematic Fall Detection</h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isImpact ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isImpact ? 'FALL IMPACT FLAGGED' : 'NORMAL KINEMATICS'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            3-Axis Accelerometer (MPU6050/ADXL345). Evaluates peak G-force vector and angular drop.
          </p>

          {/* Accelerometer Meters */}
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 mb-3 font-mono text-xs border border-slate-800">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
              <span className="text-slate-400">G-Force Magnitude:</span>
              <span className={`font-bold text-sm ${telemetry.accel_g.magnitude > 2.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                {telemetry.accel_g.magnitude.toFixed(2)} G
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-300">
              <div className="bg-slate-800 p-1.5 rounded">
                <span className="text-slate-500 block text-[9px]">ACCEL X</span>
                {telemetry.accel_g.x.toFixed(2)}
              </div>
              <div className="bg-slate-800 p-1.5 rounded">
                <span className="text-slate-500 block text-[9px]">ACCEL Y</span>
                {telemetry.accel_g.y.toFixed(2)}
              </div>
              <div className="bg-slate-800 p-1.5 rounded">
                <span className="text-slate-500 block text-[9px]">ACCEL Z</span>
                {telemetry.accel_g.z.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>ESP32-S3 Vector Threshold: &gt; 2.5 G impact trigger</span>
          </div>
        </div>

        {/* Stage 2: Physiological Validation */}
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-sm transition-all ${
          isPhysioStress ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Physiological Validation</h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isPhysioStress ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isPhysioStress ? 'STRESS MARKERS' : 'NORMAL PPG VITALS'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            MAX30102 PPG Optical Sensor. Analyzes post-impact heart rate spikes & SpO2 oxygen drops.
          </p>

          {/* Heart Rate & SpO2 Meter */}
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 mb-3 font-mono text-xs border border-slate-800">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-slate-800 p-2 rounded flex flex-col justify-between">
                <div className="flex items-center gap-1 text-red-400 text-[10px]">
                  <Heart className="h-3 w-3 fill-red-400" />
                  <span>HEART RATE</span>
                </div>
                <span className="text-lg font-bold text-slate-100 mt-1">{telemetry.heart_rate_bpm} <span className="text-xs text-slate-400 font-normal">BPM</span></span>
              </div>
              <div className="bg-slate-800 p-2 rounded flex flex-col justify-between">
                <div className="flex items-center gap-1 text-teal-400 text-[10px]">
                  <Activity className="h-3 w-3" />
                  <span>BLOOD SPO2</span>
                </div>
                <span className="text-lg font-bold text-slate-100 mt-1">{telemetry.spo2_percent}%</span>
              </div>
            </div>

            {/* Simulated Live Pulse Wave Sparkline */}
            <div className="flex items-end gap-1 h-8 pt-1">
              {waveData.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-400/80 rounded-t flex-1 transition-all duration-300"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>PPG Stress Flag: HR &gt; 110 BPM or SpO2 &lt; 93%</span>
          </div>
        </div>

        {/* Stage 3: Active Vocal Inquiry */}
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-sm transition-all ${
          isVocalTimeout ? 'border-red-500 dark:border-red-600 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Vocal Inquiry</h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isVocalTimeout ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isVocalTimeout ? 'NO VERBAL RESPONSE (0)' : 'CONFIRMED SAFE (1)'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            INMP441 MEMS Microphone. Prompts user verbally upon impact and monitors response within 30s.
          </p>

          {/* Active Countdown / Vocal Controls */}
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 mb-3 text-xs border border-slate-800">
            {countdown !== null ? (
              <div className="text-center py-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  ⚠️ ACTIVE VERBAL PROMPT IN PROGRESS
                </span>
                <span className="text-3xl font-mono font-extrabold text-red-400 block my-1">
                  {countdown}s
                </span>
                <p className="text-[11px] text-slate-300">"Are you okay? Speak to cancel emergency dispatch."</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleVocalSafeConfirm}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded text-xs cursor-pointer"
                  >
                    Say "I'm Safe" (1)
                  </button>
                  <button
                    onClick={handleVocalTimeout}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-2 rounded text-xs cursor-pointer"
                  >
                    Simulate Timeout (0)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    {telemetry.vocal_confirmation === 1 ? (
                      <Mic className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-400" />
                    )}
                    Vocal Response Flag:
                  </span>
                  <span className={`font-mono font-bold ${telemetry.vocal_confirmation === 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    vocal_confirmation = {telemetry.vocal_confirmation}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleVocalSafeConfirm}
                    className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold border cursor-pointer transition-all ${
                      telemetry.vocal_confirmation === 1
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    Set Safe (1)
                  </button>
                  <button
                    onClick={handleVocalTimeout}
                    className={`flex-1 py-1.5 px-2 rounded text-[11px] font-semibold border cursor-pointer transition-all ${
                      telemetry.vocal_confirmation === 0
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    Set Timeout (0)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <Radio className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>Escalation Rule: Impact + PPG Stress + Timeout = Dispatch</span>
          </div>
        </div>

      </div>

      {/* Dispatch Logic Decision Box & Response Payload Preview */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Triage Pipeline Dispatch Decision</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Automated evaluation outcome according to Aegis System Rules
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
              isImpact && isVocalTimeout
                ? 'bg-red-500 text-white animate-bounce'
                : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30'
            }`}>
              {isImpact && isVocalTimeout ? '🚨 CRITICAL_EMERGENCY_DISPATCH' : '✅ SAFE_FALSE_POSITIVE'}
            </span>
          </div>
        </div>

        {/* Live Map GPS & Dispatch Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Live Wearable GPS Coordinates:
            </h4>
            <div className="font-mono text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Latitude:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{telemetry.gps_location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Longitude:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{telemetry.gps_location.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800 dark:text-slate-200 text-xs font-sans font-medium">{telemetry.gps_location.location_name}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Target Broadcast Recipients:
            </h4>
            <div className="space-y-2">
              <div className={`p-2.5 rounded text-xs flex items-center justify-between border ${
                isImpact && isVocalTimeout ? 'bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
              }`}>
                <span className="font-bold">911 / EMS Dispatch Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">PRIORITY 1</span>
              </div>
              <div className={`p-2.5 rounded text-xs flex items-center justify-between border ${
                isImpact && isVocalTimeout ? 'bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
              }`}>
                <span className="font-bold">Primary Caregiver: {patient.emergencyContacts[0]?.name}</span>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-semibold">{patient.emergencyContacts[0]?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* JSON Schema 1 Output Payload Box */}
        {lastResponse && (
          <div className="mt-5 space-y-3">
            {/* Live GPS Emergency Location Dispatch Card */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="font-extrabold text-white text-xs">DISPATCHED EMERGENCY GPS LOCATION</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    lastResponse.dispatch_payload.gps_location.is_cached
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {lastResponse.dispatch_payload.gps_location.is_cached ? '⚠️ Last Known Location' : '🟢 Live GPS Active'}
                  </span>
                </div>
                {lastResponse.dispatch_payload.gps_location.location_url && (
                  <a
                    href={lastResponse.dispatch_payload.gps_location.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Location Link</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Latitude:</span>
                  <span className="text-emerald-400 font-bold">{lastResponse.dispatch_payload.gps_location.latitude.toFixed(6)}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Longitude:</span>
                  <span className="text-emerald-400 font-bold">{lastResponse.dispatch_payload.gps_location.longitude.toFixed(6)}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Accuracy:</span>
                  <span className="text-white">±{lastResponse.dispatch_payload.gps_location.accuracy || 8} meters</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Updated:</span>
                  <span className="text-white">
                    {new Date(lastResponse.dispatch_payload.gps_location.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  Schema 1 Output Payload (Aegis AI Core Engine JSON):
                </span>
                <span className="text-[10px] text-slate-500 font-mono">status_code: {lastResponse.status_code}</span>
              </div>
              <pre className="bg-slate-900 text-emerald-300 dark:bg-slate-950 p-4 rounded-lg font-mono text-xs border border-slate-800 overflow-x-auto max-h-60 scrollbar-thin">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
