enum CaptionTypes {
  SRT = 'srt',
  VTT = 'vtt',
}

export const CaptionTypeDesc: Record<CaptionTypes, string> = {
  [CaptionTypes.SRT]: 'SRT',
  [CaptionTypes.VTT]: 'VTT',
}

export default CaptionTypes
