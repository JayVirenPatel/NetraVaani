/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppState,
  LanguageConfig,
  StepLatency,
  UserIntent,
  DemoLog,
} from './types';
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  detectLanguageFromTranscript,
  NO_VOICE_PROMPTS,
} from './constants/languages';
import {
  getAudioContext,
  playChirpUp,
  playChirpDown,
  playHazardAlarm,
  stopAllAudio,
  playBase64Audio,
  speakWithBrowserTTS,
  triggerHaptic,
  VoiceRecorder,
} from './utils/audio';
import { initCamera, stopCamera, captureFrame, toggleTorch } from './utils/camera';
import {
  transcribeAudio,
  translateText,
  synthesizeSpeech,
  analyzeSceneVision,
} from './services/api';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { StatusOverlay } from './components/StatusOverlay';
import { GiantControls } from './components/GiantControls';
import { JudgePanel } from './components/JudgePanel';
import { SettingsModal } from './components/SettingsModal';
import { StartScreen } from './components/StartScreen';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';

export default function App() {
  // App state
  const [appState, setAppState] = useState<AppState>('unstarted');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(SUPPORTED_LANGUAGES[0]); // Hindi default
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState<boolean>(false);

  // Spoken / visual text state
  const [transcript, setTranscript] = useState<string>('');
  const [englishAnswer, setEnglishAnswer] = useState<string>('');
  const [translatedAnswer, setTranslatedAnswer] = useState<string>('');
  const [urgentHazard, setUrgentHazard] = useState<boolean>(false);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [lastIntent, setLastIntent] = useState<UserIntent | null>(null);

  // Latency & judge metrics
  const [lastLatency, setLastLatency] = useState<StepLatency>({});
  const [demoLogs, setDemoLogs] = useState<DemoLog[]>([]);

  // Walking mode
  const [walkingMode, setWalkingMode] = useState<boolean>(false);
  const previousWalkingStatusRef = useRef<string>('');
  const walkingIntervalRef = useRef<any>(null);

  // UI Drawer & Modal state
  const [isJudgePanelOpen, setIsJudgePanelOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [mockFrameDataUrl, setMockFrameDataUrl] = useState<string | null>(null);

  // Refs for audio recording & camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const languageRetryCountRef = useRef<number>(0);
  const spacebarPressedRef = useRef<boolean>(false);
  const appStateRef = useRef<AppState>(appState);
  appStateRef.current = appState;

  /**
   * Helper to speak an Indic phrase:
   * Uses Sarvam TTS (Bulbul:v2), falling back to browser SpeechSynthesis
   */
  const speakIndicPhrase = useCallback(
    async (text: string, langCode = currentLanguage.code): Promise<number> => {
      setAppState('speaking');
      let ttsLatency = 0;
      try {
        const res = await synthesizeSpeech(text, langCode);
        ttsLatency = res.latencyMs;
        if (res.audioBase64) {
          await playBase64Audio(res.audioBase64);
        } else {
          throw new Error('Empty audio');
        }
      } catch (err) {
        console.warn('Sarvam TTS failed, using browser speech synthesis:', err);
        await speakWithBrowserTTS(text, langCode);
      } finally {
        setAppState('ready');
      }
      return ttsLatency;
    },
    [currentLanguage.code]
  );

  /**
   * Start App: request camera & microphone, unlock audio context
   */
  const handleStartApp = async () => {
    try {
      // 1. Unlock browser AudioContext
      getAudioContext();

      // 2. Request rear camera
      try {
        const camStream = await initCamera(cameraFacingMode);
        setStream(camStream);
        setCameraError(null);
      } catch (camErr: any) {
        console.warn('Camera permission denied or unavailable:', camErr);
        setCameraError('Camera access was denied. You can select demo preset scenes in Judge Panel.');
      }

      // 3. Request microphone stream
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        voiceRecorderRef.current = new VoiceRecorder(micStream);
      } catch (micErr: any) {
        console.warn('Microphone permission denied:', micErr);
      }

      triggerHaptic(60);

      // 4. Start Voice Language Selection sequence
      startVoiceLanguageSelection();
    } catch (err: any) {
      console.error('Error starting app:', err);
      setAppState('error');
    }
  };

  /**
   * Voice Language Selection Flow:
   * Speaks welcome message in major languages, records user's voice for 4s,
   * matches against Indian languages via Sarvam STT (unknown).
   */
  const startVoiceLanguageSelection = async () => {
    setAppState('language_prompting');
    languageRetryCountRef.current = 0;

    // Multilingual welcome text: English then Hindi then Tamil
    const welcomeSpeech =
      'Welcome to NetraVaani. Please say the name of the language you understand. नमस्ते, कृपया अपनी भाषा का नाम बोलें।';

    setTranslatedAnswer(welcomeSpeech);
    setEnglishAnswer('Welcome to NetraVaani. Please say the name of the language you understand.');

    try {
      await speakIndicPhrase(welcomeSpeech, 'en-IN');
    } catch {
      // Fallback if interrupted
    }

    // Now listen for language
    listenForLanguageName();
  };

  const listenForLanguageName = async () => {
    if (!voiceRecorderRef.current) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorderRef.current = new VoiceRecorder(micStream);
      } catch {
        setAppState('ready');
        return;
      }
    }

    setAppState('language_listening');
    setTranscript('');
    setTranslatedAnswer('Listening for language name... (Say Hindi, Tamil, Telugu, English, Bengali, etc.)');

    try {
      // Record for 4.2 seconds
      await voiceRecorderRef.current.start(4.2);
      isRecordingRef.current = true;

      // Wait 4 seconds then auto-stop
      setTimeout(async () => {
        if (!isRecordingRef.current || !voiceRecorderRef.current) return;
        try {
          const result = await voiceRecorderRef.current.stop();
          isRecordingRef.current = false;
          setAppState('transcribing');

          // Send to Sarvam STT with language_code = "unknown"
          const sttRes = await transcribeAudio(result.base64, 'unknown');
          const recognizedText = sttRes.transcript.trim();
          setTranscript(recognizedText);

          // Detect language from transcript or hint
          const matchedLang = detectLanguageFromTranscript(recognizedText, sttRes.language_code);

          if (matchedLang) {
            // Success! Language detected
            setCurrentLanguage(matchedLang);
            setTranslatedAnswer(matchedLang.confirmationText);
            setEnglishAnswer(`Language set to ${matchedLang.name}. Say "what is in front of me" to begin.`);
            await speakIndicPhrase(matchedLang.confirmationText, matchedLang.code);
            setAppState('ready');
          } else {
            // Retry handling
            languageRetryCountRef.current += 1;
            if (languageRetryCountRef.current <= 2) {
              const retryMsg =
                'Sorry, I could not catch the language. Please clearly say: Hindi, English, Tamil, Telugu, or Bengali.';
              setTranslatedAnswer(retryMsg);
              await speakIndicPhrase(retryMsg, 'en-IN');
              listenForLanguageName();
            } else {
              // Default to Hindi and proceed
              const defaultLang = SUPPORTED_LANGUAGES[0]; // Hindi
              setCurrentLanguage(defaultLang);
              const fallbackMsg = `Setting language to Hindi. ${defaultLang.confirmationText}`;
              setTranslatedAnswer(fallbackMsg);
              await speakIndicPhrase(fallbackMsg, defaultLang.code);
              setAppState('ready');
            }
          }
        } catch (sttErr: any) {
          console.warn('Language STT failed:', sttErr);
          setAppState('ready');
        }
      }, 4200);
    } catch (recErr) {
      console.warn('Language recording error:', recErr);
      setAppState('ready');
    }
  };

  /**
   * Capture Frame: grabs current camera frame or mock scene frame
   */
  const getCameraSnapshot = (): string => {
    if (mockFrameDataUrl) {
      return mockFrameDataUrl;
    }
    if (videoRef.current) {
      const snap = captureFrame(videoRef.current);
      if (snap) return snap;
    }
    // Fallback blank dark frame with text if video is not available
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 768, 512);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live Camera Feed Standby', 384, 256);
    }
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  /**
   * Process a User Command (from voice or quick simulation)
   */
  const executeCommand = async (commandTranscript: string, audioBase64?: string, initialSttLatency = 0) => {
    stopAllAudio();
    const cleanLower = commandTranscript.toLowerCase().trim();
    const latencies: StepLatency = { sttMs: initialSttLatency };

    // Intent Fast-paths:
    // 1. "Stop"
    if (
      cleanLower.includes('stop') ||
      cleanLower.includes('quiet') ||
      cleanLower.includes('chup') ||
      cleanLower.includes('ruko') ||
      cleanLower.includes('band')
    ) {
      stopAllAudio();
      setAppState('ready');
      setTranslatedAnswer('Audio stopped.');
      setEnglishAnswer('Audio stopped.');
      return;
    }

    // 2. "Repeat"
    if (
      cleanLower.includes('repeat') ||
      cleanLower.includes('dohrao') ||
      cleanLower.includes('fir se') ||
      cleanLower.includes('malli') ||
      cleanLower.includes('marupadi')
    ) {
      if (translatedAnswer) {
        await speakIndicPhrase(translatedAnswer, currentLanguage.code);
      }
      return;
    }

    // 3. "Change Language"
    if (
      cleanLower.includes('change language') ||
      cleanLower.includes('switch language') ||
      cleanLower.includes('bhasha') ||
      cleanLower.includes('mozhi')
    ) {
      startVoiceLanguageSelection();
      return;
    }

    // 4. "Start walking mode" / "Stop walking mode"
    if (cleanLower.includes('start walking') || cleanLower.includes('walking mode on')) {
      setWalkingMode(true);
      const msg = 'Walking Guardian Mode started. I will scan for hazards every 6 seconds.';
      setEnglishAnswer(msg);
      setTranslatedAnswer(msg);
      await speakIndicPhrase(msg, currentLanguage.code);
      return;
    }
    if (cleanLower.includes('stop walking') || cleanLower.includes('walking mode off')) {
      setWalkingMode(false);
      const msg = 'Walking Guardian Mode stopped.';
      setEnglishAnswer(msg);
      setTranslatedAnswer(msg);
      await speakIndicPhrase(msg, currentLanguage.code);
      return;
    }

    // Multimodal Vision Query: Gemini 2.5 Flash
    setAppState('thinking');
    const imageSnapshot = getCameraSnapshot();

    try {
      const geminiRes = await analyzeSceneVision(
        imageSnapshot,
        commandTranscript,
        'command',
        previousWalkingStatusRef.current
      );

      latencies.geminiMs = geminiRes.latencyMs;
      setLastIntent(geminiRes.intent);
      setUrgentHazard(geminiRes.urgentHazard);
      setDetectedObjects(geminiRes.detectedObjects || []);
      setEnglishAnswer(geminiRes.answer_english);

      // Translate with Sarvam Mayura if target language is not English
      setAppState('translating');
      let targetText = geminiRes.answer_english;

      if (currentLanguage.code !== 'en-IN') {
        const transRes = await translateText(
          geminiRes.answer_english,
          currentLanguage.code,
          'en-IN'
        );
        latencies.translateMs = transRes.latencyMs;
        targetText = transRes.translated_text;
      } else {
        latencies.translateMs = 0;
      }

      setTranslatedAnswer(targetText);

      // Urgent hazard acoustic warning
      if (geminiRes.urgentHazard) {
        await playHazardAlarm();
      }

      // Spoken output via Sarvam Bulbul TTS
      const ttsMs = await speakIndicPhrase(targetText, currentLanguage.code);
      latencies.ttsMs = ttsMs;

      // Total latency & demo logs
      const totalMs =
        (latencies.sttMs || 0) +
        (latencies.geminiMs || 0) +
        (latencies.translateMs || 0) +
        (latencies.ttsMs || 0);
      latencies.totalMs = totalMs;
      setLastLatency(latencies);

      const logItem: DemoLog = {
        timestamp: new Date().toLocaleTimeString(),
        transcript: commandTranscript,
        intent: geminiRes.intent,
        englishAnswer: geminiRes.answer_english,
        translatedAnswer: targetText,
        languageCode: currentLanguage.code,
        urgentHazard: geminiRes.urgentHazard,
        detectedObjects: geminiRes.detectedObjects,
        latency: latencies,
      };
      setDemoLogs((prev) => [logItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Vision reasoning error:', err);
      const friendlyErr = 'I could not see clearly. Please steady the camera and try again.';
      setTranslatedAnswer(friendlyErr);
      await speakIndicPhrase(friendlyErr, currentLanguage.code);
      setAppState('ready');
    }
  };

  /**
   * Start User Voice Command Recording
   */
  const handleStartRecording = async () => {
    if (isRecordingRef.current) return;
    stopAllAudio();

    if (!voiceRecorderRef.current) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorderRef.current = new VoiceRecorder(micStream);
      } catch (err) {
        console.warn('Microphone not granted:', err);
        return;
      }
    }

    setAppState('recording');
    isRecordingRef.current = true;
    setTranscript('');

    try {
      await voiceRecorderRef.current.start(6); // 6s max
    } catch (err) {
      console.error('Failed to start recording:', err);
      setAppState('ready');
      isRecordingRef.current = false;
    }
  };

  /**
   * Stop User Voice Command Recording & Process
   */
  const handleStopRecording = async () => {
    if (!isRecordingRef.current || !voiceRecorderRef.current) return;

    try {
      const result = await voiceRecorderRef.current.stop();
      isRecordingRef.current = false;
      setAppState('transcribing');

      // Sarvam STT with current selected language
      const sttRes = await transcribeAudio(result.base64, currentLanguage.code);
      const userText = sttRes.transcript.trim();

      if (!userText) {
        const noVoiceMsg = NO_VOICE_PROMPTS[currentLanguage.code] || NO_VOICE_PROMPTS['hi-IN'];
        setTranslatedAnswer(noVoiceMsg);
        await speakIndicPhrase(noVoiceMsg, currentLanguage.code);
        setAppState('ready');
        return;
      }

      setTranscript(userText);
      await executeCommand(userText, result.base64, sttRes.latencyMs);
    } catch (err: any) {
      console.warn('Audio processing notice:', err);
      const friendlyRetry = NO_VOICE_PROMPTS[currentLanguage.code] || NO_VOICE_PROMPTS['hi-IN'];
      setTranslatedAnswer(friendlyRetry);
      await speakIndicPhrase(friendlyRetry, currentLanguage.code);
      setAppState('ready');
    }
  };

  /**
   * Toggle camera flashlight/torch
   */
  const handleToggleTorch = async () => {
    const nextTorch = await toggleTorch(!isTorchOn);
    setIsTorchOn(nextTorch);
  };

  /**
   * Keyboard shortcuts for fast, accessible desktop demo:
   * Space: hold to record
   * W: toggle walking mode
   * R: repeat last answer
   * S / Escape: stop audio
   * L: open language selector
   * J: toggle judge panel
   * T: toggle camera light/torch
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !spacebarPressedRef.current && appStateRef.current === 'ready') {
        e.preventDefault();
        spacebarPressedRef.current = true;
        handleStartRecording();
        return;
      }

      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setWalkingMode((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (translatedAnswer) speakIndicPhrase(translatedAnswer, currentLanguage.code);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'Escape') {
        e.preventDefault();
        stopAllAudio();
        setTranslatedAnswer('Audio stopped.');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLanguageSelectorOpen((prev) => !prev);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setIsJudgePanelOpen((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTorch();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spacebarPressedRef.current) {
        e.preventDefault();
        spacebarPressedRef.current = false;
        if (isRecordingRef.current) {
          handleStopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [translatedAnswer, currentLanguage]);

  /**
   * Walking Guardian Mode Routine:
   * Every 6 seconds, capture frame and evaluate hazards with Gemini
   */
  useEffect(() => {
    if (walkingMode && appState === 'ready') {
      walkingIntervalRef.current = setInterval(async () => {
        // Skip if currently recording or speaking or not ready
        if (isRecordingRef.current || appStateRef.current !== 'ready') {
          return;
        }

        try {
          const snapshot = getCameraSnapshot();
          const geminiRes = await analyzeSceneVision(
            snapshot,
            'Scan walking path for hazards and changes',
            'walking',
            previousWalkingStatusRef.current
          );

          previousWalkingStatusRef.current = geminiRes.answer_english;

          // Only speak if there is an urgent hazard or major change
          if (geminiRes.urgentHazard) {
            setUrgentHazard(true);
            setEnglishAnswer(geminiRes.answer_english);
            await playHazardAlarm();

            let spokenText = geminiRes.answer_english;
            if (currentLanguage.code !== 'en-IN') {
              const tr = await translateText(geminiRes.answer_english, currentLanguage.code);
              spokenText = tr.translated_text;
            }
            setTranslatedAnswer(spokenText);
            await speakIndicPhrase(spokenText, currentLanguage.code);
          }
        } catch (e) {
          console.warn('Walking mode tick error:', e);
        }
      }, 6000);
    } else {
      if (walkingIntervalRef.current) {
        clearInterval(walkingIntervalRef.current);
        walkingIntervalRef.current = null;
      }
    }

    return () => {
      if (walkingIntervalRef.current) {
        clearInterval(walkingIntervalRef.current);
      }
    };
  }, [walkingMode, appState, currentLanguage]);

  /**
   * Camera flip toggle
   */
  const handleToggleFacingMode = async () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    try {
      const newStream = await initCamera(nextMode);
      setStream(newStream);
    } catch (err) {
      console.warn('Could not switch camera:', err);
    }
  };

  /**
   * Manual language selection
   */
  const handleSelectLanguage = async (lang: LanguageConfig) => {
    setCurrentLanguage(lang);
    setIsSettingsOpen(false);
    setIsLanguageSelectorOpen(false);
    setAppState('ready');
    setTranslatedAnswer(lang.confirmationText);
    await speakIndicPhrase(lang.confirmationText, lang.code);
  };

  // Full-screen start screen if unstarted
  if (appState === 'unstarted') {
    return <StartScreen onStart={handleStartApp} isLoading={false} />;
  }

  return (
    <div className="relative min-h-screen bg-black text-yellow-300 flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* 1. Accessible High-Contrast Header */}
      <Header
        currentLanguage={currentLanguage}
        walkingMode={walkingMode}
        isSpeaking={appState === 'speaking'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleJudgePanel={() => setIsJudgePanelOpen(!isJudgePanelOpen)}
        isJudgePanelOpen={isJudgePanelOpen}
        onChangeLanguage={() => setIsLanguageSelectorOpen(true)}
      />

      {/* 2. Main Viewport: Live Camera Feed with Reticle & Status Overlay */}
      <main className="relative flex-1 flex flex-col justify-between min-h-[360px] sm:min-h-[460px]">
        {/* Full Viewport Camera Stream */}
        <div className="absolute inset-0 z-0">
          <CameraView
            stream={stream}
            cameraFacingMode={cameraFacingMode}
            onToggleFacingMode={handleToggleFacingMode}
            mockFrameDataUrl={mockFrameDataUrl}
            onClearMockFrame={() => setMockFrameDataUrl(null)}
            isWalkingMode={walkingMode}
            cameraError={cameraError}
            videoRef={videoRef}
            isTorchOn={isTorchOn}
            onToggleTorch={handleToggleTorch}
          />
        </div>

        {/* Live Status and Giant Captions Overlay (Translucent Bottom Layer) */}
        <div className="relative z-10 p-3 sm:p-5 mt-auto max-w-4xl mx-auto w-full flex flex-col gap-3">
          <StatusOverlay
            appState={appState}
            transcript={transcript}
            translatedAnswer={translatedAnswer}
            englishAnswer={englishAnswer}
            languageCode={currentLanguage.code}
            urgentHazard={urgentHazard}
          />

          {/* 3. Giant Accessible Touch Targets (Min 80px & 110px) */}
          <GiantControls
            appState={appState}
            isRecording={appState === 'recording'}
            isSpeaking={appState === 'speaking'}
            walkingMode={walkingMode}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onToggleWalkingMode={() => setWalkingMode(!walkingMode)}
            onRepeat={() => {
              if (translatedAnswer) speakIndicPhrase(translatedAnswer, currentLanguage.code);
            }}
            onChangeLanguage={() => setIsLanguageSelectorOpen(true)}
            onStopAudio={stopAllAudio}
            canRepeat={Boolean(translatedAnswer)}
          />
        </div>
      </main>

      {/* 4. Hackathon Judge & Demo Telemetry Panel Drawer */}
      <JudgePanel
        isOpen={isJudgePanelOpen}
        onClose={() => setIsJudgePanelOpen(false)}
        currentLanguage={currentLanguage}
        lastTranscript={transcript}
        lastEnglishAnswer={englishAnswer}
        lastTranslatedAnswer={translatedAnswer}
        lastIntent={lastIntent}
        lastLatency={lastLatency}
        detectedObjects={detectedObjects}
        urgentHazard={urgentHazard}
        onSelectPresetFrame={(dataUrl, name) => {
          setMockFrameDataUrl(dataUrl);
          setEnglishAnswer(`Preset scene loaded: ${name}`);
          setTranslatedAnswer(`Preset scene loaded: ${name}`);
        }}
        onExecuteQuickCommand={(cmd) => executeCommand(cmd)}
      />

      {/* 5. Settings Modal (API Key, Voice Test, Manual Language) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 6. Dedicated Voice & Tactile Language Selection Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageSelectorOpen || appState === 'language_prompting' || appState === 'language_listening'}
        isListeningVoice={appState === 'language_listening'}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => {
          setIsLanguageSelectorOpen(false);
          setAppState('ready');
        }}
      />
    </div>
  );
}
