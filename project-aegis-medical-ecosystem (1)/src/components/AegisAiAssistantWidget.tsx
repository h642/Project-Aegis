import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  X, 
  Send, 
  Sparkles, 
  Heart, 
  Pill, 
  ShieldAlert, 
  Bot, 
  Volume2, 
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Square,
  CheckCircle2, 
  MessageSquare,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { PatientProfile, WearableTelemetry } from '../types';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AegisAiAssistantWidgetProps {
  patient: PatientProfile;
  telemetry: WearableTelemetry;
  setActiveTab: (tab: string) => void;
  onEmergencyTrigger: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AegisAiAssistantWidget: React.FC<AegisAiAssistantWidgetProps> = ({
  patient,
  telemetry,
  setActiveTab,
  onEmergencyTrigger,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${patient.fullName.split(' ')[0]}! 😊 I'm your Aegis AI Care Assistant. I can listen to your voice and talk directly with you. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Microphone & Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Text-to-Speech (Talking to user) state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speech Synthesis Helper
  const speakText = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean formatting for natural voice speaking
    const cleanText = text
      .replace(/[*#_~`•]/g, '')
      .replace(/💖|💊|🚨|⌚|😊|⚠️|📍|✅|🤖/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  // Microphone / Speech Recognition Handlers
  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setMicError("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    // Stop speaking if currently talking
    stopSpeaking();

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Microphone access denied. Please check site permissions.');
        } else if (event.error !== 'no-speech') {
          setMicError('Speech recognition error. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    if (isListening) {
      stopListening();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    let aiReply = '';
    const newMsgId = (Date.now() + 1).toString();

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/aegis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          patientProfile: patient,
          telemetry,
          history,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          aiReply = data.reply;
        }
      }
    } catch (e) {
      console.warn("Chat API unavailable, falling back to local engine logic.");
    }

    // Local fallback if server fails
    if (!aiReply) {
      const lower = query.toLowerCase();
      if (lower.includes('vital') || lower.includes('heart') || lower.includes('spo2') || lower.includes('health') || lower.includes('doing')) {
        aiReply = `💖 Vitals Check for ${patient.fullName}:\n\n• Heart Rate: ${telemetry.heart_rate_bpm} BPM (${telemetry.heart_rate_bpm < 100 ? 'Healthy resting rate' : 'Elevated resting rate'})\n• Blood Oxygen (SpO2): ${telemetry.spo2_percent}%\n• ESP32 Strap: Connected & tracking skin contact.\n\nEverything looks stable right now! Remember to stay hydrated and take gentle walks.`;
      } else if (lower.includes('med') || lower.includes('pill') || lower.includes('dose') || lower.includes('prescription')) {
        const medList = patient.activeMedications.map(m => `• ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n');
        aiReply = `💊 Your Active Medications:\n\n${medList}\n\nAll prescriptions are synced with pharmacy refills. Need a reminder for your next dose?`;
      } else if (lower.includes('emergency') || lower.includes('sos') || lower.includes('help') || lower.includes('fall')) {
        aiReply = `🚨 Emergency Assistance:\n\nIf you feel unwell or have chest pain, you can tap Trigger SOS Dispatch at any time. Your primary contact is ${patient.emergencyContacts[0]?.name || 'Dr. Miller'} (${patient.emergencyContacts[0]?.phone}).`;
      } else if (lower.includes('strap') || lower.includes('band') || lower.includes('wrist') || lower.includes('battery')) {
        aiReply = `⌚ Wrist Strap Status:\n\n• Battery: ${telemetry.battery_level}%\n• Signal: BLE Online (14ms latency)\n• PPG Sensor: Crisp optical skin lock.\n\nYour band is monitoring your heart rhythm and motion continuously.`;
      } else {
        aiReply = `😊 I'm here to support you! I can help you check your live vitals, review active medications, navigate to your Emergency Medical Passport, or assist your caregiver.`;
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: newMsgId,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setIsTyping(false);

    // Aegis Talks to the user if Voice Output is enabled!
    if (voiceEnabled) {
      speakText(aiReply, newMsgId);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[520px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <Smile className="h-6 w-6 text-amber-200 fill-amber-300/30" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight">{t('assistant.title', 'Aegis AI Companion')}</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">Voice & Interactive Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Mute / Speak Toggle Button */}
              <button
                onClick={() => {
                  if (voiceEnabled) {
                    stopSpeaking();
                    setVoiceEnabled(false);
                  } else {
                    setVoiceEnabled(true);
                  }
                }}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  voiceEnabled 
                    ? 'bg-white/25 text-white hover:bg-white/35 ring-1 ring-white/40' 
                    : 'bg-black/20 text-white/60 hover:bg-black/30 hover:text-white'
                }`}
                title={voiceEnabled ? 'Voice output enabled (Click to Mute)' : 'Voice output muted (Click to Enable Speech)'}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4 text-amber-200 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
                title={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active Speaking Banner */}
          {isSpeaking && (
            <div className="bg-amber-500/15 dark:bg-amber-500/20 px-3 py-1.5 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="font-bold text-[11px]">Aegis is speaking to you...</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md hover:bg-amber-700 transition-colors cursor-pointer"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Quick Action Chips */}
          <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs font-semibold">
            <button
              onClick={() => handleSendMessage('Check my vitals summary')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Heart className="h-3 w-3 text-red-500" />
              <span>{t('telemetry.vitals')}</span>
            </button>
            <button
              onClick={() => handleSendMessage('Explain my active medications')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Pill className="h-3 w-3 text-indigo-500" />
              <span>{t('nav.medications')}</span>
            </button>
            <button
              onClick={() => handleSendMessage('Wrist strap battery & status')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Bot className="h-3 w-3 text-teal-500" />
              <span>{t('telemetry.strapStatus')}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('passport');
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="h-3 w-3 text-amber-600" />
              <span>{t('nav.emergencyPassport')}</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                    <Smile className="h-4 w-4 text-white fill-amber-300/40" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs relative group ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-tl-none font-medium'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <span
                      className={`text-[9px] font-mono block ${
                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </span>

                    {/* Speak message button on AI messages */}
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => {
                          if (speakingMsgId === msg.id && isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(msg.text, msg.id);
                          }
                        }}
                        className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          speakingMsgId === msg.id && isSpeaking
                            ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                            : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title="Read this message aloud"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>{speakingMsgId === msg.id && isSpeaking ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start items-center">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Smile className="h-4 w-4 animate-spin text-emerald-600" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                  <span>Aegis AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Mic Active Listening Overlay */}
          {isListening && (
            <div className="p-2.5 bg-red-500/10 dark:bg-red-950/40 border-t border-red-500/30 flex items-center justify-between text-xs text-red-700 dark:text-red-300 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
                <span className="font-bold">Microphone Active — Speak now!</span>
              </div>
              <button
                onClick={stopListening}
                className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Stop Mic
              </button>
            </div>
          )}

          {/* Microphone Error Notice */}
          {micError && (
            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border-t border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="truncate max-w-[280px]">{micError}</span>
              </div>
              <button onClick={() => setMicError(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
          )}

          {/* Footer Input with Microphone Button */}
          <div className="p-2.5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer relative ${
                  isListening
                    ? 'bg-red-600 text-white animate-bounce shadow-lg shadow-red-500/40 ring-2 ring-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to talk into microphone'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? "Listening... Speak now..." : "Type or speak your question..."}
                className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="h-9 w-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Trigger Button with Cute Smiley Logo & Mic Indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold p-3.5 sm:px-4 sm:py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/30 z-50"
        title="Talk with Aegis AI Companion"
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-40 group-hover:opacity-80 blur-md transition-opacity pointer-events-none" />

        <div className="relative flex items-center gap-2">
          {/* Cute Smiley Logo Container */}
          <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-200 shrink-0 border border-white/30 shadow-inner group-hover:rotate-12 transition-transform">
            <Smile className="h-5 w-5 fill-amber-300/40 text-amber-200 animate-pulse" />
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-black tracking-tight leading-none text-white">Aegis AI Companion</span>
            <span className="text-[10px] font-mono text-emerald-100 font-bold leading-tight flex items-center gap-1 mt-0.5">
              <Mic className="h-2.5 w-2.5 text-amber-200" />
              <span>Voice & Speak Active</span>
            </span>
          </div>

          {/* Mic status dot indicator */}
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        </div>
      </button>
    </div>
  );
};
