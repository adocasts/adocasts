export default class ScheduleSeriesVM {
  declare id: number
  declare name: string
  declare difficulty: string
  declare status: string
  declare lessonsDone: number
  declare lessonsDonePercent: number
  declare lessonsInProgress: number
  declare lessonsInProgressPercent: number
  declare lessonsPlanned: number
  declare lessonsTotal: number
  declare modulesTotal: number

  constructor(record: any) {
    const doneKeys = ['lessons_count__done']

    const plannedKeys = [
      'lessons_count__not_started',
      'lessons_count__planning',
      'lessons_count__planned',
    ]

    const inProgressKeys = [
      'lessons_count__recording',
      'lessons_count__recorded',
      'lessons_count__edited',
    ]

    this.id = record.id
    this.name = record.name
    this.difficulty = record.difficulty.name
    this.status = record.status.name
    this.lessonsDone = this.#sumCounts(record, doneKeys)
    this.lessonsPlanned = this.#sumCounts(record, plannedKeys)
    this.lessonsInProgress = this.#sumCounts(record, inProgressKeys)
    this.lessonsTotal = Number.parseInt(record.meta.lessons_count)
    this.modulesTotal = Number.parseInt(record.meta.modules_count)

    this.lessonsDonePercent = this.#getLessonsDonePercent()
    this.lessonsInProgressPercent = this.#getLessonsInProgressPercent()
  }

  #sumCounts(record: any, keys: string[]) {
    return keys.reduce((sum, key) => sum + Number.parseInt(record.meta[key]), 0)
  }

  #getLessonsDonePercent() {
    if (!this.lessonsTotal) return 0
    return (this.lessonsDone / this.lessonsTotal) * 100
  }

  #getLessonsInProgressPercent() {
    if (!this.lessonsTotal) return 0
    return (this.lessonsInProgress / this.lessonsTotal) * 100
  }
}
