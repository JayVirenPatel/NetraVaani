import React from 'react';
import { Mic, BrainCircuit, Languages, Volume2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { AppState, SupportedLanguageCode } from '../types';

interface StatusOverlayProps {
  appState: AppState;
  transcript: string;
  translatedAnswer: string;
  englishAnswer: string;
  languageCode: SupportedLanguageCode;
  urgentHazard?: boolean;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  appState,
  transcript,
  translatedAnswer,
  englishAnswer,
  languageCode,
  urgentHazard,
}) => {
  const getStatusDetails = () => {
    switch (appState) {
      case 'language_listening':
      case 'recording':
        return {
          icon: <Mic className="w-8 h-8 text-black animate-pulse" />,
          label: 'Listening to your voice...',
          subLabel: 'Speak naturally in your Indian language',
          bgColor: 'bg-yellow-400 text-black',
        };
      case 'transcribing':
        return {
          icon: <Languages className="w-8 h-8 text-yellow-300 animate-spin" />,
          label: 'Transcribing Speech (Sarvam Saarika)...',
          subLabel: 'Processing Indian acoustic models',
          bgColor: 'bg-zinc-900 text-yellow-300 border-2 border-yellow-400',
        };
      case 'thinking':
        return {
          icon: <BrainCircuit className="w-8 h-8 text-yellow-300 animate-pulse" />,
          label: 'Analyzing Scene (Gemini Vision)...',
          subLabel: 'Detecting path, obstacles, text & hazards',
          bgColor: 'bg-zinc-900 text-yellow-300 border-2 border-yellow-400',
        };
      case 'translating':
        return {
          icon: <Languages className="w-8 h-8 text-yellow-300 animate-bounce" />,
          label: 'Translating (Sarvam Mayura)...',
          subLabel: 'Generating native script & dialect',
          bgColor: 'bg-zinc-900 text-yellow-300 border-2 border-yellow-400',
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-8 h-8 text-black animate-bounce" />,
          label: 'Speaking (Sarvam Bulbul)...',
          subLabel: 'High fidelity Indic neural voice',
          bgColor: 'bg-yellow-400 text-black',
        };
      case 'language_prompting':
        return {
          icon: <Languages className="w-8 h-8 text-black animate-pulse" />,
          label: 'Choose Language...',
          subLabel: 'Say your language (Hindi, Tamil, Telugu, English, etc.)',
          bgColor: 'bg-yellow-400 text-black',
        };
      case 'error':
        return {
          icon: <AlertOctagon className="w-8 h-8 text-red-400" />,
          label: 'Notice / Error',
          subLabel: 'Retrying or tap speak to continue',
          bgColor: 'bg-red-950 text-red-200 border-2 border-red-500',
        };
      case 'ready':
      default:
        return {
          icon: <CheckCircle2 className="w-7 h-7 text-yellow-400" />,
          label: 'NetraVaani Ready',
          subLabel: 'Tap big button or tap anywhere to speak',
          bgColor: 'bg-zinc-950 text-yellow-300 border border-yellow-400/40',
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div
      className="w-full flex flex-col gap-2.5 transition-all"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* 1. Urgent Hazard Banner */}
      {urgentHazard && (
        <div className="bg-red-600 text-white border-4 border-yellow-300 p-3 sm:p-4 rounded-2xl flex items-center gap-3 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.8)]">
          <AlertOctagon className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 text-yellow-300 stroke-[3]" />
          <div>
            <div className="text-base sm:text-lg font-black tracking-wider uppercase">
              ⚠️ URGENT HAZARD DETECTED
            </div>
            <div className="text-xs sm:text-sm font-bold text-yellow-100">
              Immediate safety warning spoken below. Caution ahead.
            </div>
          </div>
        </div>
      )}

      {/* 2. Primary Status Card */}
      <div
        className={`px-4 py-3 sm:py-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xl transition-all ${status.bgColor}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">{status.icon}</div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black tracking-wide truncate">
              {status.label}
            </h2>
            <p className="text-xs font-semibold opacity-90 truncate">
              {status.subLabel}
            </p>
          </div>
        </div>

        {/* Dynamic Waveform Visualizer when recording or speaking */}
        {(appState === 'recording' || appState === 'speaking' || appState === 'language_listening') && (
          <div className="flex items-center gap-1 shrink-0 px-2" aria-hidden="true">
            <span className="w-1.5 h-6 bg-current rounded-full animate-[bounce_0.6s_infinite_100ms]" />
            <span className="w-1.5 h-9 bg-current rounded-full animate-[bounce_0.6s_infinite_200ms]" />
            <span className="w-1.5 h-7 bg-current rounded-full animate-[bounce_0.6s_infinite_300ms]" />
            <span className="w-1.5 h-10 bg-current rounded-full animate-[bounce_0.6s_infinite_150ms]" />
            <span className="w-1.5 h-5 bg-current rounded-full animate-[bounce_0.6s_infinite_250ms]" />
          </div>
        )}
      </div>

      {/* 3. Spoken Caption Display (Giant Font for Low-Vision Accessibility) */}
      {(translatedAnswer || transcript) && (
        <div className="bg-black/95 border-2 border-yellow-400 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col gap-2">
          {/* User Voice Input Transcript */}
          {transcript && (
            <div className="flex items-start gap-2 border-b border-zinc-800 pb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-yellow-400/80 bg-zinc-900 px-2 py-0.5 rounded shrink-0">
                You Asked:
              </span>
              <p className="text-sm sm:text-base font-semibold text-zinc-200 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Spoken Answer in Target Language (GIANT Accessible Font) */}
          {translatedAnswer && (
            <div>
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-yellow-400 mb-1">
                Spoken Answer ({languageCode}):
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-300 leading-snug tracking-wide">
                {translatedAnswer}
              </p>
            </div>
          )}

          {/* English Reference for Judges & Bilingual Demo */}
          {englishAnswer && languageCode !== 'en-IN' && (
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-zinc-400 mr-2">
                English Translation:
              </span>
              <span className="text-xs sm:text-sm font-medium text-zinc-300">
                {englishAnswer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
