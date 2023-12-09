import Status from "#enums/status"
import router from "@adonisjs/core/services/router"
import LessonRequestQueryBuilder from "./lesson_request_builder.js"
import States from "#enums/states"

export default class LessonRequestPaginatedQueryBuilder extends LessonRequestQueryBuilder {
  private perPage = 20
  private page: number = 1
  private baseUrl: string

  constructor(baseUrl: string = router.makeUrl('requests.lessons.index')) {
    super()
    this.baseUrl = baseUrl
  }

  public setPage(page: number | undefined) {
    this.page = page ?? 1
    return this
  }

  public whereStatus(statusId: Status) {
    this.query = this.query.where({ statusId })
    return this
  }

  public whereNotState(stateId: States) {
    this.query = this.query.whereNot({ stateId })
    return this
  }

  public wherePattern(pattern: string = '') {
    const words = pattern?.split(' ')

    this.query = this.query.where(query => {
      words.map(word => query.orWhereILike('name', `%${word}%`).orWhereILike('body', `%${word}%`))
    })

    return this
  }

  public async build() {
    const items = await this.query.paginate(this.page, this.perPage)

    items.baseUrl(this.baseUrl)

    return items
  }
}