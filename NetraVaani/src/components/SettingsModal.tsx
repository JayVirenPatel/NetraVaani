import React, { useState } from 'react';
import { X, Key, Volume2, Check, RefreshCw, Globe, HelpCircle } from 'lucide-react';
import { LanguageConfig, SupportedLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, SARVAM_MODELS } from '../constants/languages';
import { getStoredSarvamKey, saveStoredSarvamKey, synthesizeSpeech } from '../services/api';
import { playBase64Audio, speakWithBrowserTTS } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageConfig;
  onSelectLanguage: (lang: LanguageConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const [sarvamKey, setSarvamKey] = useState<string>(() => getStoredSarvamKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testingVoice, setTestingVoice] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    saveStoredSarvamKey(sarvamKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestVoice = async () => {
    setTestingVoice(true);
    setTestResult(null);
    try {
      const testPhrase = currentLanguage.confirmationText;
      const res = await synthesizeSpeech(testPhrase, currentLanguage.code);
      if (res && res.audioBase64) {
        await playBase64Audio(res.audioBase64);
        setTestResult(`Success! Spoke via Sarvam ${SARVAM_MODELS.TTS_MODEL} in ${res.latencyMs}ms`);
      } else {
        throw new Error('No audio returned');
      }
    } catch (err: any) {
      console.warn('Sarvam TTS test failed, falling back to browser voice:', err);
      await speakWithBrowserTTS(currentLanguage.confirmationText, currentLanguage.code);
      setTestResult('Notice: Used browser voice fallback');
    } finally {
      setTestingVoice(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Application Settings"
    >
      <div className="bg-zinc-950 border-3 border-yellow-400 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 text-zinc-100 shadow-2xl flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-yellow-300">NetraVaani Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-yellow-400 hover:text-yellow-300 rounded-lg hover:bg-zinc-800 transition-all"
            aria-label="Close Settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1. Sarvam API Key Configuration */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-extrabold text-yellow-400 flex items-center gap-1.5">
            <Key className="w-4 h-4" /> Sarvam AI API Key
          </label>
          <p className="text-xs text-zinc-400">
            Paste your Sarvam API subscription key. Saved securely in your browser's local storage.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={sarvamKey}
              onChange={(e) => setSarvamKey(e.target.value)}
              placeholder="sk_..."
              className="flex-1 bg-zinc-900 border-2 border-yellow-400/60 focus:border-yellow-400 text-yellow-300 px-3 py-2 rounded-xl text-sm font-mono focus:outline-none"
            />
            <button
              onClick={handleSaveKey}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-xl font-bold text-sm transition-all"
            >
              {savedSuccess ? 'Saved!' : 'Save'}
            </button>
          </div>
          <span className="text-[11px] text-zinc-500">
            Default system key is automatically active if left blank.
          </span>
        </div>

        {/* 2. Voice Test Button */}
        <div className="bg-zinc-900/90 border border-yellow-400/40 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-yellow-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Test Indic Voice Output
            </span>
            <span className="text-xs font-bold text-zinc-400">
              {currentLanguage.name} ({currentLanguage.nativeName})
            </span>
          </div>
          <p className="text-xs text-zinc-300">
            Verify Sarvam Bulbul:v2 neural voice synthesis in {currentLanguage.name}.
          </p>
          <button
            onClick={handleTestVoice}
            disabled={testingVoice}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            {testingVoice ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Playing Voice Sample...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Play Test Audio Sample</span>
              </>
            )}
          </button>
          {testResult && (
            <p className="text-xs font-semibold text-yellow-300 mt-1">{testResult}</p>
          )}
        </div>

        {/* 3. Manual Language Switcher (11 Indian Languages) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-extrabold text-yellow-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> Choose Primary Indian Language
          </label>
          <p className="text-xs text-zinc-400">
            You can also change language anytime by saying "Change language".
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang)}
                  className={`p-2.5 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-yellow-300 font-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-yellow-400/60 font-semibold'
                  }`}
                >
                  <span className="text-xs">{lang.name}</span>
                  <span className="text-sm font-bold">{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Done / Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border-2 border-yellow-400 font-black rounded-2xl text-base transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
