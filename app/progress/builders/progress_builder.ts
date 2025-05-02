import CollectionBuilder from '#collection/builders/collection_builder'
import BaseBuilder from '#core/builders/base_builder'
import PostBuilder from '#post/builders/post_builder'
import ProgressDto from '#progress/dtos/progress'
import Progress from '#progress/models/progress'
import User from '#user/models/user'
import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'

export default class ProgressBuilder extends BaseBuilder<typeof Progress, Progress> {
  buildingFor: 'postId' | 'collectionId' | undefined = undefined

  constructor(protected user: User | undefined = undefined) {
    super(Progress)
  }

  static new(user: User | undefined = undefined) {
    return new ProgressBuilder(user)
  }

  get() {
    this.query.where((query) =>
      query
        .where('is_completed', true)
        .orWhere((or) => or.whereNotNull('watch_percent').where('watch_percent', '>', 0))
        .orWhere((or) => or.whereNotNull('read_percent').where('read_percent', '>', 0))
    )
    return this
  }

  async posts<T>(chain: (builder: PostBuilder) => T) {
    const rows = await this.latest('postId')
    const postIds = rows.map((row) => row.postId!)
    const builder = PostBuilder.new().whereIn('id', postIds)
    builder.query
      .joinRaw('join unnest(?::int[]) WITH ORDINALITY t(id, ord) USING (id)', [
        `{${postIds.join(',')}}`,
      ])
      .orderBy('t.ord', 'desc')
    return chain(builder)
  }

  async collections<T>(chain: (builder: CollectionBuilder) => T) {
    const rows = await this.latest('collectionId')
    const collectionIds = rows.map((row) => row.collectionId!)
    const builder = CollectionBuilder.new().whereIn('id', collectionIds)
    builder.query
      .joinRaw('join unnest(?::int[]) WITH ORDINALITY t(id, ord) USING (id)', [
        `{${collectionIds.join(',')}}`,
      ])
      .orderBy('t.ord', 'desc')
    return chain(builder)
  }

  latest(column: 'postId' | 'collectionId' | 'taxonomyId') {
    this.query
      .select(db.knexRawQuery('MAX(updated_at) as updated_at'), column)
      .where('userId', this.user!.id)
      .whereNotNull(column)
      .groupBy(column)
      .orderBy('updated_at')
    return this
  }

  for(column: 'postId' | 'collectionId', ids: number[] | undefined = undefined) {
    this.buildingFor = column

    this.query
      .if(ids, (truthy) => truthy.whereIn(column, ids!))
      .where('userId', this.user!.id)
      .where((q) => q.where('isCompleted', true).orWhere('watchSeconds', '>', 0))
      .whereNotNull(column)
    return this
  }

  async toDtoMap(buildingFor: 'postId' | 'collectionId' | undefined = this.buildingFor) {
    if (!buildingFor) {
      throw new InvalidArgumentsException(
        'ProgressBuilder.toMap requires a `buildingFor` argument or `for` to be called first'
      )
    }

    const records = await this.dto(ProgressDto)
    const map = new Map<number, ProgressDto>()

    records.forEach((record) => {
      if (!record[buildingFor]) return

      map.set(record[buildingFor], record)
    })

    return map
  }
}
