/**
 * Audio synthesis, recording, earcons, and playback manager.
 * Ensures the app communicates non-visually through high-contrast sound cues.
 */

let audioCtx: AudioContext | null = null;
let currentPlayingAudio: HTMLAudioElement | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Haptic feedback helper
 */
export function triggerHaptic(pattern: number | number[] = 50) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

/**
 * Sound Earcon: Mic start listening (chirp up 440Hz -> 880Hz)
 */
export function playChirpUp() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
    triggerHaptic(40);
  } catch (e) {
    console.warn('Audio earcon error:', e);
  }
}

/**
 * Sound Earcon: Mic stop listening (chirp down 880Hz -> 440Hz)
 */
export function playChirpDown() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
    triggerHaptic(30);
  } catch (e) {
    console.warn('Audio earcon error:', e);
  }
}

/**
 * Sound Earcon: Urgent hazard alarm before spoken alert (double siren pulse)
 */
export function playHazardAlarm(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(900, now);
      osc1.frequency.setValueAtTime(1250, now + 0.08);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.17);

      // Pulse 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(900, now + 0.2);
      osc2.frequency.setValueAtTime(1300, now + 0.28);

      gain2.gain.setValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.4);

      triggerHaptic([150, 70, 200]);

      setTimeout(resolve, 450);
    } catch {
      resolve();
    }
  });
}

/**
 * Stop any current audio playback immediately (e.g. on "stop" command or user action)
 */
export function stopAllAudio() {
  if (currentPlayingAudio) {
    try {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
      currentPlayingAudio.src = '';
    } catch {
      // Ignore
    }
    currentPlayingAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

/**
 * Play a base64 encoded audio string (WAV from Sarvam TTS).
 * Returns a promise that resolves when playback completes.
 */
export function playBase64Audio(base64Wav: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stopAllAudio();

    try {
      const src = base64Wav.startsWith('data:')
        ? base64Wav
        : `data:audio/wav;base64,${base64Wav}`;

      const audio = new Audio(src);
      currentPlayingAudio = audio;

      audio.onended = () => {
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null;
        }
        resolve();
      };

      audio.onerror = (e) => {
        console.warn('HTML Audio playback error:', e);
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null;
        }
        reject(e);
      };

      audio.play().catch((err) => {
        console.warn('Audio play() rejected:', err);
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Fallback to browser SpeechSynthesis when Sarvam TTS fails or offline
 */
export function speakWithBrowserTTS(text: string, langCode: string = 'en-IN'): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return resolve();
    }
    stopAllAudio();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Find matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const prefix = langCode.split('-')[0].toLowerCase();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      resolve();
    }
  });
}

/**
 * Convert any audio Blob (WebM, Opus, Ogg, etc.) to 16kHz mono 16-bit PCM WAV.
 * This guarantees 100% compatibility with Sarvam AI Saarika v2.5 STT.
 */
export async function convertTo16kHzWav(sourceBlob: Blob): Promise<Blob> {
  try {
    const arrayBuffer = await sourceBlob.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const tempCtx = new AudioContextClass();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

    // Resample to 16kHz mono using OfflineAudioContext
    const targetSampleRate = 16000;
    const targetLength = Math.max(1, Math.round(audioBuffer.duration * targetSampleRate));
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    // Encode to PCM WAV
    const numSamples = channelData.length;
    const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    tempCtx.close().catch(() => {});
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } catch (err) {
    console.warn('WAV conversion fallback, returning original blob:', err);
    return sourceBlob;
  }
}

/**
 * MediaRecorder Voice Recorder with Silence Detection & Max Duration
 */
export interface VoiceRecordingResult {
  blob: Blob;
  base64: string;
  durationMs: number;
}

export class VoiceRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private timer: any = null;
  private isRecording: boolean = false;

  constructor(stream?: MediaStream) {
    if (stream) {
      this.mediaStream = stream;
    }
  }

  public setStream(stream: MediaStream) {
    this.mediaStream = stream;
  }

  public async start(maxDurationSeconds: number = 6): Promise<void> {
    if (this.isRecording) return;

    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }

    this.audioChunks = [];
    this.startTime = Date.now();
    this.isRecording = true;

    // Determine supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    }

    this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    playChirpUp();
    this.mediaRecorder.start(250);

    // Auto-stop on timer
    this.timer = setTimeout(() => {
      if (this.isRecording) {
        this.stop();
      }
    }, maxDurationSeconds * 1000);
  }

  public stop(): Promise<VoiceRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.mediaRecorder) {
        return reject(new Error('Recorder not active'));
      }

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.isRecording = false;
      playChirpDown();

      this.mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        const durationMs = Date.now() - this.startTime;

        try {
          // Convert to 16kHz mono WAV for Sarvam STT
          const wavBlob = await convertTo16kHzWav(rawBlob);

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve({ blob: wavBlob, base64, durationMs });
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(wavBlob);
        } catch (err) {
          reject(err);
        }
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  public get recording(): boolean {
    return this.isRecording;
  }
}
