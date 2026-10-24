import React from 'react';
import { Mic, MicOff, Shield, RotateCcw, Globe, VolumeX } from 'lucide-react';
import { AppState } from '../types';

interface GiantControlsProps {
  appState: AppState;
  isRecording: boolean;
  isSpeaking: boolean;
  walkingMode: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleWalkingMode: () => void;
  onRepeat: () => void;
  onChangeLanguage: () => void;
  onStopAudio: () => void;
  canRepeat: boolean;
}

export const GiantControls: React.FC<GiantControlsProps> = ({
  appState,
  isRecording,
  isSpeaking,
  walkingMode,
  onStartRecording,
  onStopRecording,
  onToggleWalkingMode,
  onRepeat,
  onChangeLanguage,
  onStopAudio,
  canRepeat,
}) => {
  const isBusy =
    appState === 'transcribing' ||
    appState === 'thinking' ||
    appState === 'translating';

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Giant Speak Button (Covers primary lower touch zone, min height > 110px) */}
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={isBusy}
        className={`w-full min-h-[105px] sm:min-h-[120px] rounded-3xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-4 transition-all transform active:scale-[0.98] select-none border-4 shadow-2xl relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-yellow-300 ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white border-white animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.8)]'
            : isBusy
            ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-wait'
            : 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.5)]'
        }`}
        aria-label={
          isRecording
            ? 'Release or tap to stop speaking and analyze'
            : 'Giant Speak Button: Tap to speak a command, or hold spacebar'
        }
      >
        {isRecording ? (
          <>
            <MicOff className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
            <div className="flex flex-col text-left">
              <span>LISTENING...</span>
              <span className="text-sm sm:text-base font-bold opacity-90">
                TAP WHEN FINISHED
              </span>
            </div>
          </>
        ) : isBusy ? (
          <>
            <div className="w-9 h-9 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <div className="flex flex-col text-left">
              <span>PROCESSING...</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-300">
                Analyzing camera & voice
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-black text-yellow-400 rounded-2xl">
              <Mic className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.8]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="tracking-wide">TAP TO SPEAK</span>
              <span className="text-xs sm:text-sm font-bold text-black/80">
                OR HOLD SPACEBAR ANYWHERE
              </span>
            </div>
          </>
        )}
      </button>

      {/* 2. Secondary Giant Action Buttons (Min height 80px) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Walking Mode Guardian Toggle (Min 80px) */}
        <button
          onClick={onToggleWalkingMode}
          className={`min-h-[82px] px-3 py-2 rounded-2xl font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 border-3 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
            walkingMode
              ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.7)]'
              : 'bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-yellow-400/70 hover:border-yellow-400'
          }`}
          aria-label={`Walking Guardian Mode is currently ${walkingMode ? 'ON' : 'OFF'}. Tap to toggle.`}
        >
          <Shield className="w-6 h-6 stroke-[2.5]" />
          <span className="tracking-wide text-center">
            {walkingMode ? 'WALKING: ON' : 'WALKING: OFF'}
          </span>
          <span className="text-[10px] opacity-80 font-bold">
            {walkingMode ? 'Active 6s hazard scan' : 'Continuous navigation'}
          </span>
        </button>

        {/* Change Language Button (Min 80px) */}
        <button
          onClick={onChangeLanguage}
          className="min-h-[82px] px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-3 border-yellow-400/70 hover:border-yellow-400 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="Change Language. Tap to switch or re-run voice language selection."
        >
          <Globe className="w-6 h-6 stroke-[2.5]" />
          <span className="tracking-wide">CHANGE LANG</span>
          <span className="text-[10px] opacity-80 font-bold">11 Indian Languages</span>
        </button>

        {/* Repeat Answer / Stop Audio Toggle Button (Min 80px) */}
        {isSpeaking ? (
          <button
            onClick={onStopAudio}
            className="col-span-2 sm:col-span-1 min-h-[82px] px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white border-3 border-white font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 animate-pulse focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Silence audio output immediately"
          >
            <VolumeX className="w-6 h-6 stroke-[2.5]" />
            <span className="tracking-wide">STOP AUDIO</span>
            <span className="text-[10px] opacity-90 font-bold">Mute current speech</span>
          </button>
        ) : (
          <button
            onClick={onRepeat}
            disabled={!canRepeat}
            className={`col-span-2 sm:col-span-1 min-h-[82px] px-3 py-2 rounded-2xl border-3 font-black text-sm sm:text-base flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
              canRepeat
                ? 'bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-yellow-400/70 hover:border-yellow-400'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800 cursor-not-allowed'
            }`}
            aria-label="Replay the last spoken answer"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            <span className="tracking-wide">REPEAT</span>
            <span className="text-[10px] opacity-80 font-bold">Replay last answer</span>
          </button>
        )}
      </div>
    </div>
  );
};
