export type SupportedLanguageCode =
  | 'hi-IN'
  | 'en-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'ml-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'pa-IN'
  | 'od-IN';

export interface LanguageConfig {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  welcomeText: string;
  confirmationText: string;
  retryText: string;
  keywords: string[];
}

export type AppState =
  | 'unstarted'
  | 'language_prompting'
  | 'language_listening'
  | 'ready'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'translating'
  | 'speaking'
  | 'error';

export type UserIntent =
  | 'scene_description'
  | 'navigation'
  | 'read_text'
  | 'find_object'
  | 'change_language'
  | 'repeat'
  | 'stop'
  | 'walking_update'
  | 'general';

export interface StepLatency {
  sttMs?: number;
  geminiMs?: number;
  translateMs?: number;
  ttsMs?: number;
  totalMs?: number;
}

export interface DemoLog {
  timestamp: string;
  transcript: string;
  intent: UserIntent;
  englishAnswer: string;
  translatedAnswer: string;
  languageCode: SupportedLanguageCode;
  urgentHazard?: boolean;
  detectedObjects?: string[];
  latency: StepLatency;
}
