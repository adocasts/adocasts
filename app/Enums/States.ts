enum State {
  DRAFT = 1,
  IN_REVIEW = 2,
  UNLISTED = 3,
  PRIVATE = 4,
  PUBLIC = 5,
  ARCHIVED = 6,
  DECLINED = 7
}

export const StateDesc = {
  1: 'Draft',
  2: 'In Review',
  3: 'Unlisted',
  4: 'Private',
  5: 'Public',
  6: 'Archived',
  7: 'Declined'
}

export default State;