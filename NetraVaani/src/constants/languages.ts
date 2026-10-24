import { LanguageConfig, SupportedLanguageCode } from '../types';

export const SARVAM_MODELS = {
  STT_MODEL: 'saarika:v2.5',
  TRANSLATE_MODEL: 'mayura:v1',
  TTS_MODEL: 'bulbul:v3',
  TTS_SPEAKER: 'priya',
} as const;

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिंदी',
    welcomeText: 'नमस्ते। कृपया उस भाषा का नाम बोलें जिसे आप समझते हैं।',
    confirmationText: 'भाषा हिंदी सेट हो गई है। शुरू करने के लिए बोलें, मेरे सामने क्या है।',
    retryText: 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया अपनी भाषा का नाम फिर से बोलें।',
    keywords: ['hindi', 'हिन्दी', 'हिंदी', 'hindustani', 'hindi me', 'hindi mein'],
  },
  {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    welcomeText: 'Welcome. Please say the name of the language you understand.',
    confirmationText: 'Language set to English. Say "what is in front of me" to begin.',
    retryText: 'Sorry, I could not catch that. Please state your language clearly.',
    keywords: ['english', 'angrezi', 'angreji', 'inglish', 'british'],
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    welcomeText: 'வணக்கம். நீங்கள் புரிந்து கொள்ளும் மொழியின் பெயரைச் சொல்லுங்கள்.',
    confirmationText: 'மொழி தமிழில் அமைக்கப்பட்டுள்ளது. தொடங்க "என் முன்னே என்ன இருக்கிறது" என்று சொல்லுங்கள்.',
    retryText: 'மன்னிக்கவும், விளங்கவில்லை. உங்கள் மொழியின் பெயரை மீண்டும் சொல்லவும்.',
    keywords: ['tamil', 'தமிழ்', 'thamizh', 'tamizhagam', 'tamil nadu'],
  },
  {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    welcomeText: 'నమస్కారం. మీరు అర్థం చేసుకునే భాష పేరు చెప్పండి.',
    confirmationText: 'భాష తెలుగుగా సెట్ చేయబడింది. ప్రారంభించడానికి "నా ఎదురుగా ఏముంది" అని చెప్పండి.',
    retryText: 'క్షమించండి, అర్థం కాలేదు. దయచేసి మీ భాష పేరును మళ్లీ చెప్పండి.',
    keywords: ['telugu', 'తెలుగు', 'telgu', 'andhra', 'telangana'],
  },
  {
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    welcomeText: 'স্বাগতম। আপনি যে ভাষা বোঝেন তার নাম বলুন।',
    confirmationText: 'ভাষা বাংলায় সেট করা হয়েছে। শুরু করতে বলুন, "আমার সামনে কি আছে"।',
    retryText: 'দুঃখিত, বুঝতে পারিনি। অনুগ্রহ করে আপনার ভাষার নাম পুনরায় বলুন।',
    keywords: ['bengali', 'bangla', 'বাংলা', 'bongo', 'bangali'],
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    welcomeText: 'ನಮಸ್ಕಾರ. ನೀವು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಭಾಷೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.',
    confirmationText: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ. ಪ್ರಾರಂಭಿಸಲು "ನನ್ನ ಮುಂದೆ ಏನಿದೆ" ಎಂದು ಹೇಳಿ.',
    retryText: 'ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯ ಹೆಸರನ್ನು ಮತ್ತೆ ಹೇಳಿ.',
    keywords: ['kannada', 'ಕನ್ನಡ', 'kannadiga', 'karnatak'],
  },
  {
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    welcomeText: 'സ്വാഗതം. നിങ്ങൾ മനസ്സിലാക്കുന്ന ഭാഷയുടെ പേര് പറയുക.',
    confirmationText: 'ഭാഷ മലയാളമായി ക്രമീകരിച്ചു. ആരംഭിക്കാൻ "എന്റെ മുന്നിൽ എന്താണുള്ളത്" എന്ന് പറയുക.',
    retryText: 'ക്ഷമിക്കണം, മനസ്സിലായില്ല. ദയവായി നിങ്ങളുടെ ഭാഷയുടെ പേര് വീണ്ടും പറയുക.',
    keywords: ['malayalam', 'മലയാളം', 'mallu', 'kerala'],
  },
  {
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    welcomeText: 'नमस्कार. आपण समजणाऱ्या भाषेचे नाव बोला.',
    confirmationText: 'भाषा मराठी सेट केली आहे. सुरू करण्यासाठी "माझ्या समोर काय आहे" बोला.',
    retryText: 'माफ करा, समजले नाही. कृपया आपल्या भाषेचे नाव पुन्हा सांगा.',
    keywords: ['marathi', 'मराठी', 'maharashtra'],
  },
  {
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    welcomeText: 'નમસ્તે. કૃપા કરીને તમે સમજો છો તે ભાષાનું નામ બોલો.',
    confirmationText: 'ભાષા ગુજરાતી સેટ થઈ ગઈ છે. શરૂ કરવા માટે બોલો, "મારી સામે શું છે".',
    retryText: 'માફ કરશો, સમજાયું નહીં. કૃપા કરીને તમારી ભાષાનું નામ ફરીથી બોલો.',
    keywords: ['gujarati', 'ગુજરાતી', 'gujju', 'gujrat'],
  },
  {
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    welcomeText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਕਿਰਪਾ ਕਰਕੇ ਉਸ ਭਾਸ਼ਾ ਦਾ ਨਾਂ ਬੋਲੋ ਜੋ ਤੁਸੀਂ ਸਮਝਦੇ ਹੋ।',
    confirmationText: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਸੈੱਟ ਕੀਤੀ ਗਈ ਹੈ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਹੋ, "ਮੇਰੇ ਸਾਹਮਣੇ ਕੀ ਹੈ"।',
    retryText: 'ਮਾਫ਼ ਕਰਨਾ, ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਦਾ ਨਾਂ ਦੁਬਾਰਾ ਬੋਲੋ।',
    keywords: ['punjabi', 'ਪੰਜਾਬੀ', 'panjabi', 'punjab'],
  },
  {
    code: 'od-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    welcomeText: 'ନମସ୍କାର। ଦୟାକରି ଆପଣ ବୁଝୁଥିବା ଭାଷାର ନାମ କୁହନ୍ତୁ।',
    confirmationText: 'ଭାଷା ଓଡ଼ିଆରେ ସେଟ୍ ହୋଇଛି। ଆରମ୍ଭ କରିବାକୁ କୁହନ୍ତୁ, "ମୋ ସାମ୍ନାରେ କଣ ଅଛି"।',
    retryText: 'କ୍ଷମା କରିବେ, ବୁଝିପାରିଲି ନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ଭାଷାର ନାମ ପୁଣି କୁହନ୍ତୁ।',
    keywords: ['odia', 'oriya', 'ଓଡ଼ିଆ', 'odisha', 'orissa'],
  },
];

export function getLanguageByCode(code: SupportedLanguageCode): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
}

export function detectLanguageFromTranscript(transcript: string, detectedCodeHint?: string): LanguageConfig | null {
  const clean = transcript.toLowerCase().trim();

  // 1. Direct keyword match
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const kw of lang.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        return lang;
      }
    }
  }

  // 2. Check detected code hint from Sarvam STT
  if (detectedCodeHint) {
    const hintMatch = SUPPORTED_LANGUAGES.find(
      (l) => l.code.toLowerCase() === detectedCodeHint.toLowerCase() ||
             l.code.split('-')[0].toLowerCase() === detectedCodeHint.toLowerCase()
    );
    if (hintMatch) {
      return hintMatch;
    }
  }

  return null;
}

export const NO_VOICE_PROMPTS: Record<SupportedLanguageCode, string> = {
  'hi-IN': 'आवाज़ सुनाई नहीं दी। कृपया बटन दबाकर फिर से बोलें।',
  'en-IN': "I didn't hear clearly. Please tap the button and speak.",
  'ta-IN': 'குரல் கேட்கவில்லை. தயவுசெய்து மீண்டும் பேசவும்.',
  'te-IN': 'వాయిస్ వినబడలేదు. దయచేసి మళ్లీ మాట్లాడండి.',
  'bn-IN': 'কথা শোনা যায়নি। অনুগ্রহ করে আবার বলুন।',
  'kn-IN': 'ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.',
  'ml-IN': 'ശബ്ദം കേട്ടില്ല. ദയവായി വീണ്ടും സംസാരിക്കുക.',
  'mr-IN': 'आवाज ऐकू आला नाही. कृपया पुन्हा बोला.',
  'gu-IN': 'અવાજ સંભળાયો નથી. કૃપા કરીને ફરીથી બોલો.',
  'pa-IN': 'ਆਵਾਜ਼ ਨਹੀਂ ਸੁਣੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।',
  'od-IN': 'ସ୍ୱର ଶୁଭିଲା ନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।',
};
