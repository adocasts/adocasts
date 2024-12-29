enum CaptionLanguages {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  PORTUGUESE = 'pt',
}

export const CaptionLanguageDesc: Record<CaptionLanguages, string> = {
  [CaptionLanguages.ENGLISH]: 'English',
  [CaptionLanguages.SPANISH]: 'Spanish',
  [CaptionLanguages.FRENCH]: 'French',
  [CaptionLanguages.GERMAN]: 'German',
  [CaptionLanguages.PORTUGUESE]: 'Portuguese',
}

export default CaptionLanguages
