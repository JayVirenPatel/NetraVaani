import React from 'react';
import { X, Zap, Clock, Terminal, Sparkles, Check, AlertTriangle, Layers, Play } from 'lucide-react';
import { LanguageConfig, StepLatency, UserIntent } from '../types';
import { SARVAM_MODELS } from '../constants/languages';
import { DEMO_PRESET_FRAMES } from '../utils/camera';

interface JudgePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageConfig;
  lastTranscript: string;
  lastEnglishAnswer: string;
  lastTranslatedAnswer: string;
  lastIntent: UserIntent | null;
  lastLatency: StepLatency;
  detectedObjects: string[];
  urgentHazard?: boolean;
  onSelectPresetFrame: (dataUrl: string, name: string) => void;
  onExecuteQuickCommand: (commandText: string) => void;
}

export const JudgePanel: React.FC<JudgePanelProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  lastTranscript,
  lastEnglishAnswer,
  lastTranslatedAnswer,
  lastIntent,
  lastLatency,
  detectedObjects,
  urgentHazard,
  onSelectPresetFrame,
  onExecuteQuickCommand,
}) => {
  if (!isOpen) return null;

  const totalCalculatedLatency =
    (lastLatency.sttMs || 0) +
    (lastLatency.geminiMs || 0) +
    (lastLatency.translateMs || 0) +
    (lastLatency.ttsMs || 0);

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-14 sm:top-16 bg-black/95 text-zinc-100 z-50 overflow-y-auto border-t-4 border-yellow-400 p-4 sm:p-6 backdrop-blur-xl animate-in slide-in-from-bottom duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Hackathon Judge & Demo Telemetry Panel"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-400/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-400 text-black rounded-xl">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-yellow-300">
                Hackathon Judge &amp; Demo Telemetry
              </h2>
              <p className="text-xs text-zinc-400">
                Live inspection of Sarvam AI Indic Models + Gemini 2.5 Flash Vision Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border border-yellow-400/60 rounded-xl transition-all"
            aria-label="Close Judge Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Real-Time Latency Breakdown Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-extrabold text-yellow-400 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pipeline Latency Breakdown
            </span>
            <span className="text-xs font-mono font-bold text-yellow-300 bg-zinc-900 px-2 py-0.5 rounded border border-yellow-400/40">
              Total E2E:{' '}
              {totalCalculatedLatency > 0 ? `${totalCalculatedLatency} ms (${(totalCalculatedLatency / 1000).toFixed(2)}s)` : 'Standby'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Step 1: Sarvam STT */}
            <div className="bg-zinc-900/90 border border-yellow-400/40 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Step 1: STT</div>
                <div className="text-xs font-bold text-yellow-300 truncate">
                  Sarvam {SARVAM_MODELS.STT_MODEL}
                </div>
              </div>
              <div className="mt-2 text-xl font-mono font-black text-white">
                {lastLatency.sttMs !== undefined ? `${lastLatency.sttMs} ms` : '—'}
              </div>
            </div>

            {/* Step 2: Gemini Vision */}
            <div className="bg-zinc-900/90 border border-yellow-400/40 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Step 2: Vision AI</div>
                <div className="text-xs font-bold text-yellow-300 truncate">
                  Gemini 2.5 Flash
                </div>
              </div>
              <div className="mt-2 text-xl font-mono font-black text-white">
                {lastLatency.geminiMs !== undefined ? `${lastLatency.geminiMs} ms` : '—'}
              </div>
            </div>

            {/* Step 3: Sarvam Translate */}
            <div className="bg-zinc-900/90 border border-yellow-400/40 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Step 3: Translate</div>
                <div className="text-xs font-bold text-yellow-300 truncate">
                  Sarvam {SARVAM_MODELS.TRANSLATE_MODEL}
                </div>
              </div>
              <div className="mt-2 text-xl font-mono font-black text-white">
                {lastLatency.translateMs !== undefined ? `${lastLatency.translateMs} ms` : '—'}
              </div>
            </div>

            {/* Step 4: Sarvam TTS */}
            <div className="bg-zinc-900/90 border border-yellow-400/40 p-3 rounded-xl flex flex-col justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Step 4: TTS</div>
                <div className="text-xs font-bold text-yellow-300 truncate">
                  Sarvam {SARVAM_MODELS.TTS_MODEL} ({SARVAM_MODELS.TTS_SPEAKER})
                </div>
              </div>
              <div className="mt-2 text-xl font-mono font-black text-white">
                {lastLatency.ttsMs !== undefined ? `${lastLatency.ttsMs} ms` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Bilingual Text & Intent Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Input & Intent */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-yellow-400">
                User Spoken Input:
              </span>
              {lastIntent && (
                <span className="text-[11px] font-mono font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">
                  Intent: {lastIntent}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-zinc-100 bg-black/60 p-2.5 rounded-lg border border-zinc-800 min-h-[45px]">
              {lastTranscript || '(Awaiting user voice input...)'}
            </div>

            {/* Detected Objects in Scene */}
            {detectedObjects && detectedObjects.length > 0 && (
              <div className="mt-1">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1">
                  Detected Objects in Scene:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detectedObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-zinc-800 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-md font-mono"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Responses */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-yellow-400">
                Bilingual Pipeline Output:
              </span>
              <span className="text-[11px] font-bold text-zinc-400">
                Language: {currentLanguage.name} ({currentLanguage.code})
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  1. Gemini Scene Explanation (English):
                </span>
                <p className="text-xs text-zinc-200 bg-black/60 p-2 rounded border border-zinc-800">
                  {lastEnglishAnswer || '(None)'}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-yellow-300 block">
                  2. Sarvam Spoken Translation ({currentLanguage.nativeName}):
                </span>
                <p className="text-sm font-bold text-yellow-300 bg-black/60 p-2 rounded border border-yellow-400/40">
                  {lastTranslatedAnswer || '(None)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Preset Test Scenes for Demonstration */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs uppercase font-extrabold text-yellow-400 mb-2">
            <Layers className="w-3.5 h-3.5" /> Preset Test Scenes (For demoing when camera is flat or indoors)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {DEMO_PRESET_FRAMES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPresetFrame(preset.dataUrl, preset.name)}
                className="text-left bg-black hover:bg-zinc-800 border border-yellow-400/40 hover:border-yellow-400 p-2.5 rounded-lg transition-all group"
              >
                <div className="text-xs font-bold text-yellow-300 group-hover:text-yellow-200">
                  {preset.name}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Quick Command Triggers for Instant Testing */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs uppercase font-extrabold text-yellow-400 mb-2">
            <Play className="w-3.5 h-3.5" /> Quick Trigger Voice Commands (Simulate Speech)
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'What is in front of me?',
              'Help me walk and navigate safely',
              'Read this note and tell me denomination',
              'Read medicine box instructions',
              'Is there any chair or door ahead?',
              'Repeat last answer',
            ].map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  onExecuteQuickCommand(cmd);
                  onClose();
                }}
                className="bg-zinc-800 hover:bg-yellow-400 hover:text-black text-yellow-300 border border-yellow-400/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
