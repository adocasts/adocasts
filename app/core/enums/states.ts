enum States {
  DRAFT = 1,
  IN_REVIEW = 2,
  UNLISTED = 3,
  PRIVATE = 4,
  PUBLIC = 5,
  ARCHIVED = 6,
  DECLINED = 7,
  IN_PROGRESS = 8,
}

export const StateDesc: Record<States, string> = {
  [States.DRAFT]: 'Draft',
  [States.IN_REVIEW]: 'In Review',
  [States.UNLISTED]: 'Unlisted',
  [States.PRIVATE]: 'Private',
  [States.PUBLIC]: 'Public',
  [States.ARCHIVED]: 'Archived',
  [States.DECLINED]: 'Declined',
  [States.IN_PROGRESS]: 'In Progress',
}

export default States
