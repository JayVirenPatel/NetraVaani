import { SupportedLanguageCode, UserIntent } from '../types';
import { SARVAM_MODELS } from '../constants/languages';

const LOCAL_STORAGE_SARVAM_KEY = 'netravaani_sarvam_api_key';

export function getStoredSarvamKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_SARVAM_KEY) || '';
  }
  return '';
}

export function saveStoredSarvamKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_SARVAM_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SARVAM_KEY);
    }
  }
}

function getAuthHeaders(): HeadersInit {
  const customKey = getStoredSarvamKey();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (customKey) {
    headers['x-sarvam-key'] = customKey;
  }
  return headers;
}

export interface STTResponse {
  transcript: string;
  language_code: string;
  latencyMs: number;
}

export async function transcribeAudio(
  audioBase64: string,
  languageCode: string = 'unknown'
): Promise<STTResponse> {
  const res = await fetch('/api/sarvam/stt', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      audioBase64,
      language_code: languageCode,
      model: SARVAM_MODELS.STT_MODEL,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Speech-to-text failed (${res.status})`);
  }

  return res.json();
}

export interface TranslateResponse {
  translated_text: string;
  latencyMs: number;
}

export async function translateText(
  input: string,
  targetLanguageCode: SupportedLanguageCode,
  sourceLanguageCode: string = 'en-IN'
): Promise<TranslateResponse> {
  if (targetLanguageCode === 'en-IN' || sourceLanguageCode === targetLanguageCode) {
    return { translated_text: input, latencyMs: 0 };
  }

  const res = await fetch('/api/sarvam/translate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      input,
      source_language_code: sourceLanguageCode,
      target_language_code: targetLanguageCode,
      model: SARVAM_MODELS.TRANSLATE_MODEL,
      mode: 'formal',
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Translation failed (${res.status})`);
  }

  return res.json();
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  latencyMs: number;
}

export async function synthesizeSpeech(
  text: string,
  targetLanguageCode: SupportedLanguageCode
): Promise<TTSResponse> {
  const res = await fetch('/api/sarvam/tts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      text,
      target_language_code: targetLanguageCode,
      speaker: SARVAM_MODELS.TTS_SPEAKER,
      model: SARVAM_MODELS.TTS_MODEL,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Text-to-speech failed (${res.status})`);
  }

  return res.json();
}

export interface VisionAnalysisResponse {
  intent: UserIntent;
  urgentHazard: boolean;
  answer_english: string;
  detectedObjects: string[];
  modelUsed: string;
  latencyMs: number;
}

export async function analyzeSceneVision(
  imageBase64: string,
  transcript: string = '',
  mode: 'command' | 'walking' = 'command',
  previousStatus: string = ''
): Promise<VisionAnalysisResponse> {
  const res = await fetch('/api/gemini/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64,
      transcript,
      mode,
      previousStatus,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Vision analysis failed (${res.status})`);
  }

  return res.json();
}
