import HistoryBuilder from "#builders/history_builder";
import History from "#models/history";
import TurnstileService from "#services/turnstile_service";
import { HttpContext } from "@adonisjs/core/http";

export type HistoryContext = {
  isLoaded: boolean
  postIds: number[]
  collectionIds: number[]
  records: History[]
  commit: () => Promise<History[]>
  addCollectionIds: (ids: number[]) => void
  addPostIds: (ids: number[]) => void
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    turnstile: TurnstileService
    timezone: string
    history: HistoryContext
  }
}

HttpContext.getter('turnstile', function (this: HttpContext) {
  return new TurnstileService(this)
}, true)

HttpContext.getter('timezone', function (this: HttpContext) {
  const { timezone } = this.request.cookiesList()
  return timezone
})

HttpContext.getter('history', function (this: HttpContext) {
  const ctx = this
  const state: HistoryContext = {
    isLoaded: false,
    postIds: [],
    collectionIds: [],
    records: [],

    addCollectionIds(ids: number[]) {
      console.log('addCollectionIds', { ids })
      this.collectionIds = [...this.collectionIds, ...ids]
    },

    addPostIds(ids: number[]) {
      this.postIds = [...this.postIds, ...ids]
    },

    async commit() {
      if (!ctx.auth.user || this.isLoaded) return []
      
      const postRecords = await HistoryBuilder.new(ctx.auth.user)
        .progressions()
        .for('postId', this.postIds)

      const collectionRecords = await HistoryBuilder.new(ctx.auth.user)
        .progressions()
        .for('collectionId', this.collectionIds)
      
      console.log({
        postIds: this.postIds,
        collectionIds: this.collectionIds,
      })

      this.records = [...postRecords, ...collectionRecords]

      ctx.view.share({ 
        progressions: this.records,
        progression: {
          post: (id: number) => {
            return this.records.find(record => record.postId === id)
          },

          collection: (id: number) => {
            return this.records.find(record => record.collectionId == id)
          }
        }
      })

      return this.records
    }
  }

  return state
}, true)
