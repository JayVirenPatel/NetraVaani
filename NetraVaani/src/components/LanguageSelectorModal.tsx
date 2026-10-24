import React from 'react';
import { Globe, Mic, Check, Volume2, Sparkles, X } from 'lucide-react';
import { LanguageConfig, SupportedLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  isListeningVoice: boolean;
  onSelectLanguage: (lang: LanguageConfig) => void;
  onClose: () => void;
  currentLanguage: LanguageConfig;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  isListeningVoice,
  onSelectLanguage,
  onClose,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Voice Language Selection"
    >
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-3 border-b-2 border-yellow-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-400 text-black rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-yellow-300">
              Select Your Language / भाषा चुनें
            </h2>
            <p className="text-xs sm:text-sm text-yellow-100/90 font-medium">
              Say your language aloud or tap any option below
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-2 border-yellow-400/60 rounded-xl transition-all"
          aria-label="Close language selector"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Voice Listening Card */}
      <div className="max-w-4xl mx-auto w-full my-3">
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-4 border-3 transition-all ${
            isListeningVoice
              ? 'bg-yellow-400 text-black border-white animate-pulse shadow-[0_0_25px_rgba(250,204,21,0.8)]'
              : 'bg-zinc-900 text-yellow-300 border-yellow-400/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl ${isListeningVoice ? 'bg-black text-yellow-400' : 'bg-yellow-400 text-black'}`}>
              <Mic className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-wide">
                {isListeningVoice ? 'LISTENING FOR LANGUAGE NAME...' : 'VOICE DETECTION READY'}
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-90">
                Speak: "Hindi", "Tamil", "Telugu", "Bengali", "English", etc.
              </div>
            </div>
          </div>

          {isListeningVoice && (
            <div className="flex items-center gap-1 shrink-0 px-2">
              <span className="w-1.5 h-6 bg-current rounded-full animate-[bounce_0.5s_infinite_100ms]" />
              <span className="w-1.5 h-10 bg-current rounded-full animate-[bounce_0.5s_infinite_200ms]" />
              <span className="w-1.5 h-8 bg-current rounded-full animate-[bounce_0.5s_infinite_300ms]" />
              <span className="w-1.5 h-11 bg-current rounded-full animate-[bounce_0.5s_infinite_150ms]" />
            </div>
          )}
        </div>
      </div>

      {/* Giant 11 Indian Languages Grid */}
      <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto my-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang)}
                className={`min-h-[82px] sm:min-h-[92px] p-3 rounded-2xl text-left border-3 transition-all flex flex-col justify-between transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-300 ${
                  isSelected
                    ? 'bg-yellow-400 text-black border-yellow-200 font-black shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-yellow-400/60 hover:border-yellow-400 font-bold'
                }`}
                aria-label={`Select ${lang.name} (${lang.nativeName})`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold opacity-80">
                    {lang.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="text-xl sm:text-2xl font-black truncate">
                  {lang.nativeName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible Footer Notice */}
      <div className="max-w-4xl mx-auto w-full pt-3 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-400 font-semibold">
          All subsequent scene descriptions, text reading, and navigation will be spoken in this chosen language.
        </p>
      </div>
    </div>
  );
};
