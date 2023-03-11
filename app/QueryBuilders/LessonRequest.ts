import LessonRequestSorts from "App/Enums/LessonRequestSorts"
import States from "App/Enums/States"
import LessonRequest from "App/Models/LessonRequest"

export default class LessonRequestQueryBuilder {
  private limit: number | null = null
  protected query = LessonRequest.query()

  constructor() {}

  public preloadRelations() {
    this.query = this.query
      .preload('user')
      .preload('votes', query => query.selectIds())
      .withCount('votes')
      .withCount('comments')
    return this
  }

  setLimit(limit: number) {
    this.limit = limit
    return this
  }

  setSort(column: LessonRequestSorts | undefined): LessonRequestQueryBuilder;
  setSort(column: string | undefined, direction: 'asc' | 'desc' | undefined = 'desc'): LessonRequestQueryBuilder {
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

  public whereState(stateId: string | States | undefined) {
    this.query = this.query.if(stateId, query => query.where({ stateId }))
    return this
  }

  public wherePattern(pattern: string | undefined) {
    if (!pattern) return this

    const words = pattern?.split(' ')

    this.query = this.query.where(query => {
      words.map(word => query.orWhereILike('name', `%${word}%`).orWhereILike('body', `%${word}%`))
    })

    return this
  }

  public async build() {
    return this.query.if(this.limit, query => query.limit(this.limit!))
  }
}