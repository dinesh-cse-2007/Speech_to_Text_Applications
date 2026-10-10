export const LANGUAGES: { code: string; label: string; flag: string }[] = [
  { code: 'en-US', label: 'English (US)', flag: 'US' },
  { code: 'en-GB', label: 'English (UK)', flag: 'GB' },
  { code: 'es-ES', label: 'Spanish', flag: 'ES' },
  { code: 'fr-FR', label: 'French', flag: 'FR' },
  { code: 'de-DE', label: 'German', flag: 'DE' },
  { code: 'it-IT', label: 'Italian', flag: 'IT' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', flag: 'BR' },
  { code: 'nl-NL', label: 'Dutch', flag: 'NL' },
  { code: 'pl-PL', label: 'Polish', flag: 'PL' },
  { code: 'tr-TR', label: 'Turkish', flag: 'TR' },
  { code: 'ru-RU', label: 'Russian', flag: 'RU' },
  { code: 'ja-JP', label: 'Japanese', flag: 'JP' },
  { code: 'ko-KR', label: 'Korean', flag: 'KR' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)', flag: 'CN' },
  { code: 'hi-IN', label: 'Hindi', flag: 'IN' },
  { code: 'ar-SA', label: 'Arabic', flag: 'SA' },
];

export function getLanguageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
