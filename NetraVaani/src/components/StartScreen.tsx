import React from 'react';
import { Eye, Mic, Camera, Volume2, Shield } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading }) => {
  return (
    <button
      onClick={onStart}
      disabled={isLoading}
      className="fixed inset-0 w-full h-full bg-black text-yellow-300 flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer focus:outline-none focus:ring-8 focus:ring-yellow-400 z-50 text-left sm:text-center"
      aria-label="Tap anywhere on the entire screen to start NetraVaani and enable camera, microphone, and voice output."
    >
      {/* Top Branding */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-extrabold shadow-[0_0_20px_rgba(250,204,21,0.6)]">
            <Eye className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-yellow-300 tracking-wider">
              NetraVaani
            </h1>
            <p className="text-xs sm:text-sm text-yellow-100/80 font-medium">
              Voice-First AI Vision for the Visually Impaired
            </p>
          </div>
        </div>
      </div>

      {/* Giant Center Touch Target */}
      <div className="my-auto flex flex-col items-center justify-center gap-6 max-w-md">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-yellow-400 text-black flex items-center justify-center border-4 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,0.7)] animate-pulse">
          <Eye className="w-16 h-16 sm:w-20 sm:h-20 stroke-[2.5]" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-yellow-300 tracking-wide text-center uppercase">
            {isLoading ? 'Starting Up...' : 'Tap Anywhere to Start'}
          </h2>
          <p className="text-base sm:text-xl font-bold text-yellow-100 text-center leading-relaxed">
            Touch anywhere on the screen to enable camera, microphone, and Indian voice assistant.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm font-extrabold text-black">
          <span className="bg-yellow-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
            <Camera className="w-4 h-4" /> Rear Camera
          </span>
          <span className="bg-yellow-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
            <Mic className="w-4 h-4" /> Sarvam AI Voice
          </span>
          <span className="bg-yellow-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
            <Volume2 className="w-4 h-4" /> 11 Languages
          </span>
          <span className="bg-yellow-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
            <Shield className="w-4 h-4" /> Walking Guardian
          </span>
        </div>
      </div>

      {/* Bottom Accessible Hint */}
      <div className="w-full text-center">
        <div className="inline-block bg-zinc-900 border-2 border-yellow-400/80 text-yellow-300 font-bold px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-lg">
          No sight required • Voice guided • High contrast tactile design
        </div>
      </div>
    </button>
  );
};
