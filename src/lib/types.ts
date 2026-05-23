export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}

export interface AppSettings {
  backendType: "colab" | "groq";
  colabUrl: string;
  groqApiKey: string;
  defaultLanguage: string;
  defaultTask: "transcribe" | "translate";
}

export const DEFAULT_SETTINGS: AppSettings = {
  backendType: "colab",
  colabUrl: "",
  groqApiKey: "",
  defaultLanguage: "auto",
  defaultTask: "transcribe",
};

export const SUPPORTED_LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
  { code: "sv", label: "Swedish" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "no", label: "Norwegian" },
  { code: "uk", label: "Ukrainian" },
  { code: "cs", label: "Czech" },
  { code: "ro", label: "Romanian" },
  { code: "hu", label: "Hungarian" },
  { code: "el", label: "Greek" },
  { code: "he", label: "Hebrew" },
  { code: "fa", label: "Persian" },
];

export const SUPPORTED_FORMATS = [
  ".mp3",
  ".mp4",
  ".wav",
  ".m4a",
  ".ogg",
  ".webm",
  ".flac",
  ".aac",
  ".wma",
  ".mpeg",
  ".mpga",
  ".oga",
  ".opus",
];

export const MAX_FILE_SIZE_MB = 500;
