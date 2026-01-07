enum TaxonomyTypes {
  CONTENT = 1,
  DISCUSSION = 2,
}

export const TaxonomyTypeDesc: Record<TaxonomyTypes, string> = {
  [TaxonomyTypes.CONTENT]: 'Content',
  [TaxonomyTypes.DISCUSSION]: 'Discussion',
}

export default TaxonomyTypes
