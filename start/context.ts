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

    /**
     * add array of collection ids to consider for progression loading
     * @param ids
     */
    addCollectionIds(ids: number[] = []) {
      ids = ids.filter(Boolean)
      this.collectionIds = [...this.collectionIds, ...ids]
    },

    /**
     * add array of post ids to consider for progression loading
     * @param ids
     */
    addPostIds(ids: number[] = []) {
      ids = ids.filter(Boolean)
      this.postIds = [...this.postIds, ...ids]
    },

    /**
     * attempt to find progression record for provided post id
     * @param id
     */
    post(id: number) {
      return this.records.find(record => record.postId === id)
    },

    /**
     * attempt to find collection record for provided collection id
     * @param id
     */
    collection(id: number) {
      return this.records.find(record => record.collectionId == id)
    },

    /**
     * commit current ids and attempt to load progressions for authenticated user
     */
    async commit() {
      if (this.isLoaded) return []

      let postRecords: Progress[] = []
      let collectionRecords: Progress[] = []
      
      if (ctx.auth.user) {
        const uniquePostIds = [...new Set(this.postIds)]
        const uniqueCollectionIds = [...new Set(this.collectionIds)]

        postRecords = await ProgressBuilder.new(ctx.auth.user).for('postId', uniquePostIds)
        collectionRecords = await ProgressBuilder.new(ctx.auth.user).for('collectionId', uniqueCollectionIds)
      }

      this.records = [
        ...postRecords, 
        ...collectionRecords.filter(record => !postRecords.some(r => r.id === record.id))
      ]

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
