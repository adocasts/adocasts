import ProgressBuilder from "#builders/progress_builder";
import Progress from "#models/progress";
import TurnstileService from "#services/turnstile_service";
import { HttpContext } from "@adonisjs/core/http";

export type ProgressContext = {
  isLoaded: boolean
  postIds: number[]
  collectionIds: number[]
  records: Progress[]
  commit: () => Promise<Progress[]>
  post: (id: number) => Progress | undefined
  collection: (id: number) => Progress | undefined
  addCollectionIds: (ids: number[]) => void
  addPostIds: (ids: number[]) => void
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    turnstile: TurnstileService
    timezone: string
    history: ProgressContext
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
  const state: ProgressContext = {
    isLoaded: false,
    postIds: [],
    collectionIds: [],
    records: [],

    addCollectionIds(ids: number[] = []) {
      console.log('addCollectionIds', { ids })
      this.collectionIds = [...this.collectionIds, ...ids]
    },

    addPostIds(ids: number[] = []) {
      this.postIds = [...this.postIds, ...ids]
    },

    post(id: number) {
      return this.records.find(record => record.postId === id)
    },

    collection(id: number) {
      return this.records.find(record => record.collectionId == id)
    },

    async commit() {
      if (this.isLoaded) return []

      let postRecords: Progress[] = []
      let collectionRecords: Progress[] = []
      
      if (ctx.auth.user) {
        postRecords = await ProgressBuilder.new(ctx.auth.user).for('postId', this.postIds)
        collectionRecords = await ProgressBuilder.new(ctx.auth.user).for('collectionId', this.collectionIds)
      }

      this.records = [...postRecords, ...collectionRecords]

      ctx.view.share({ 
        progressions: this.records,
        progression: {
          post: this.post.bind(this),
          collection: this.collection.bind(this)
        }
      })

      return this.records
    }
  }

  return state
}, true)
