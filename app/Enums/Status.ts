enum Status {
  IN_PROGRESS = 1,
  COMPLETE = 2,
  OUTDATED = 3,
  ARCHIVED = 4
}

export const StatusDesc = {
  1: 'In Progress',
  2: 'Completed',
  3: 'Outdated',
  4: 'Archived',
}

export default Status;