import React from 'react';
import { Eye, ShieldAlert, Sliders, BarChart3, Volume2, Globe } from 'lucide-react';
import { LanguageConfig } from '../types';

interface HeaderProps {
  currentLanguage: LanguageConfig;
  walkingMode: boolean;
  isSpeaking: boolean;
  onOpenSettings: () => void;
  onToggleJudgePanel: () => void;
  isJudgePanelOpen: boolean;
  onChangeLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  walkingMode,
  isSpeaking,
  onOpenSettings,
  onToggleJudgePanel,
  isJudgePanelOpen,
  onChangeLanguage,
}) => {
  return (
    <header className="bg-black/95 border-b-2 border-yellow-400 px-3 py-2 sm:px-5 sm:py-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* App Title & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-extrabold shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <Eye className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-yellow-300 font-sans">
                NetraVaani
              </h1>
              <span className="text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/60 px-1.5 py-0.5 rounded font-mono font-bold hidden sm:inline-block">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-yellow-100/80 font-medium">
              Your voice. Your language. Your eyes.
            </p>
          </div>
        </div>

        {/* Live Badges & Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Language Badge (Clickable to change) */}
          <button
            onClick={onChangeLanguage}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border-2 border-yellow-400/80 text-yellow-300 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label={`Current language is ${currentLanguage.name}. Tap to change.`}
          >
            <Globe className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="truncate max-w-[85px] sm:max-w-none">
              {currentLanguage.name} ({currentLanguage.nativeName})
            </span>
          </button>

          {/* Walking Mode Indicator */}
          {walkingMode && (
            <div
              className="flex items-center gap-1 bg-amber-500/20 border-2 border-amber-400 text-amber-300 px-2 py-1 rounded-lg text-xs font-bold animate-pulse"
              role="status"
              aria-label="Walking guardian mode is currently active"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WALKING GUARD</span>
            </div>
          )}

          {/* Speaking Audio Pulse Indicator */}
          {isSpeaking && (
            <div
              className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-black animate-pulse"
              role="status"
              aria-label="Currently speaking audio output"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">VOICE ON</span>
            </div>
          )}

          {/* Judge/Demo Panel Button */}
          <button
            onClick={onToggleJudgePanel}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold border-2 transition-all ${
              isJudgePanelOpen
                ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                : 'bg-zinc-900 text-yellow-300 border-yellow-400/60 hover:border-yellow-400'
            }`}
            aria-label="Toggle Demo and Hackathon Judge metrics panel"
            aria-expanded={isJudgePanelOpen}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Judge Metrics</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-yellow-400/70 hover:border-yellow-400 text-yellow-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Open settings and API configuration"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
