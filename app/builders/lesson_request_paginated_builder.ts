import Status from '#enums/status'
import router from '@adonisjs/core/services/router'
import LessonRequestBuilder from './lesson_request_builder.js'
import States from '#enums/states'

export default class LessonRequestPaginatedBuilder extends LessonRequestBuilder {
  private perPage = 20
  private page: number = 1
  private baseUrl: string

  constructor(baseUrl: string = router.makeUrl('requests.lessons.index')) {
    super()
    this.baseUrl = baseUrl
  }

  setPage(page: number | undefined) {
    this.page = page ?? 1
    return this
  }

  whereStatus(statusId: Status) {
    this.query = this.query.where({ statusId })
    return this
  }

  whereNotState(stateId: States) {
    this.query = this.query.whereNot({ stateId })
    return this
  }

  wherePattern(pattern: string = '') {
    const words = pattern?.split(' ')

    this.query = this.query.where((query) => {
      words.map((word) => query.orWhereILike('name', `%${word}%`).orWhereILike('body', `%${word}%`))
    })

    return this
  }

  async build() {
    const items = await this.query.paginate(this.page, this.perPage)

    items.baseUrl(this.baseUrl)

    return items
  }
}
