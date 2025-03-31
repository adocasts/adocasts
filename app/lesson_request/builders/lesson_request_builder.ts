import LessonRequestSorts from '#lesson_request/enums/lesson_request_sorts'
import States from '#core/enums/states'
import LessonRequest from '#lesson_request/models/lesson_request'

export default class LessonRequestBuilder {
  private limit: number | null = null
  protected query = LessonRequest.query()

  constructor() {}

  preloadRelations() {
    this.query = this.query
      .preload('user')
      .preload('votes', (query) => query.select('id'))
      .withCount('votes')
      .withCount('comments')
    return this
  }

  setLimit(limit: number) {
    this.limit = limit
    return this
  }

  setSort(column: LessonRequestSorts | undefined): LessonRequestBuilder
  setSort(
    column: string | undefined,
    direction: 'asc' | 'desc' | undefined = 'desc'
  ): LessonRequestBuilder {
    const sorts = Object.values(LessonRequestSorts) as string[]

    if (!column) return this

    if (typeof column === 'string' && sorts.includes(column)) {
      const [sort, dir] = column.split('_') as [string, 'asc' | 'desc']
      this.query = this.query.orderBy(sort, dir)
      return this
    }

    this.query = this.query.orderBy(column, direction)
    return this
  }

  whereState(stateId: string | States | undefined) {
    this.query = this.query.if(stateId, (query) => query.where({ stateId }))
    return this
  }

  whereNotState(stateId: States) {
    this.query = this.query.whereNot({ stateId })
    return this
  }

  wherePattern(pattern: string | undefined) {
    if (!pattern) return this

    const words = pattern?.split(' ')

    this.query = this.query.where((query) => {
      words.map((word) => query.orWhereILike('name', `%${word}%`).orWhereILike('body', `%${word}%`))
    })

    return this
  }

  async build() {
    return this.query.if(this.limit, (query) => query.limit(this.limit!))
  }
}
