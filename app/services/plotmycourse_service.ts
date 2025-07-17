import env from '#start/env'
import axios, { Axios } from 'axios'
import { DateTime } from 'luxon'

class PlotMyCourseService {
  declare private api: Axios

  constructor() {
    this.api = axios.create({
      baseURL: env.get('PLOTMYCOURSE_API_URL'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.get('PLOTMYCOURSE_API_KEY')}`,
      },
    })
  }

  async getPosts(range: { start: DateTime; end: DateTime } | null) {
    if (!range) return []

    const { data } = await this.api.post('/lessons/search', {
      perPage: 100,
      publishAt: {
        after: range.start.toISO(),
        before: range.end.toISO(),
      },
    })

    return data.data
  }

  async getSeries() {
    const { data } = await this.api.post('/courses/search', {
      perPage: 100,
      statusId: [2, 3, 4, 6, 7, 44],
    })

    return data.data
  }
}

const plotMyCourseService = new PlotMyCourseService()
export default plotMyCourseService
