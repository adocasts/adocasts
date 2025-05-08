import ProgressDto from '#dtos/progress'
import Progress from '#models/progress'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export interface ProgressType {
  ids: Set<number>
  records: Map<number, ProgressDto>
  get(id: number): ProgressDto | undefined
  add(ids: number | number[]): void
}

export interface ProgressContext {
  isCommitted: boolean
  post: ProgressType
  collection: ProgressType
  commit(): Promise<void>
}

class ProgressTypeState implements ProgressType {
  ids = new Set<number>()
  records = new Map<number, ProgressDto>()

  get(id: number) {
    return this.records.get(id)
  }

  add(ids: number | number[]) {
    if (Array.isArray(ids)) {
      ids.forEach((id) => this.ids.add(id))
      return
    }

    this.ids.add(ids)
  }
}

class ProgressState implements ProgressContext {
  isCommitted: boolean = false
  post = new ProgressTypeState()
  collection = new ProgressTypeState()

  get user() {
    return this.ctx.auth.user
  }

  constructor(protected ctx: HttpContext) {}

  async commit() {
    if (this.isCommitted) return

    if (this.user) {
      await this.#fillPostProgress()
      await this.#fillCollectionPostProgress()
    }

    this.ctx.view.share({
      progress: {
        post: this.post,
        collection: this.collection,
      },
    })

    this.isCommitted = true
  }

  async #fillPostProgress() {
    const records = await Progress.build(this.user)
      .for('postId', [...this.post.ids])
      .dto(ProgressDto)

    this.addToPostProgress(records)
  }

  async #fillCollectionPostProgress() {
    const results = new Map<number, ProgressDto>()

    for (const collectionId of this.collection.ids) {
      const postIds: number[] = await db
        .knexQuery()
        .from('collection_posts')
        .where('root_collection_id', collectionId)
        .pluck('post_id')

      const records = await Progress.build(this.user).for('postId', postIds).dto(ProgressDto)
      const completed = records.filter((record) => record.isCompleted)
      const progress = new ProgressDto()

      this.addToPostProgress(records)

      progress.collectionId = collectionId
      progress.watchSeconds = records.reduce((sum, row) => (sum += row.watchSeconds), 0)
      progress.watchPercent = Math.floor((completed.length / postIds.length) * 100)
      progress.isCompleted = progress.watchPercent === 100
      progress.completedLessons = completed.length

      results.set(collectionId, progress)
    }

    this.collection.records = results
  }

  addToPostProgress(records: ProgressDto[]) {
    for (const record of records) {
      if (!record.postId || this.post.records.has(record.postId)) {
        continue
      }

      this.post.records.set(record.postId, record)
    }
  }
}

export function createProgress(ctx: HttpContext) {
  return new ProgressState(ctx)
}
