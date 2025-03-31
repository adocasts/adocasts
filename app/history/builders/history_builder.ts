import CollectionBuilder from '#collection/builders/collection_builder'
import Collection from '#collection/models/collection'
import BaseBuilder from '#core/builders/base_builder'
import HistoryTypes from '#history/enums/history_types'
import History from '#history/models/history'
import PostBuilder from '#post/builders/post_builder'
import Post from '#post/models/post'
import User from '#user/models/user'
import db from '@adonisjs/lucid/services/db'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class HistoryBuilder extends BaseBuilder<typeof History, History> {
  constructor(protected user: User | undefined = undefined) {
    super(History)
  }

  static new(user: User | undefined = undefined) {
    return new HistoryBuilder(user)
  }

  views() {
    this.query.where('historyTypeId', HistoryTypes.VIEW)
    return this
  }

  async posts(
    chain: (
      builder: PostBuilder
    ) => PostBuilder | Promise<Post[]> | Promise<ModelPaginatorContract<Post>>
  ) {
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

  async collections(
    chain: (
      builder: CollectionBuilder
    ) => CollectionBuilder | Promise<Collection[]> | Promise<ModelPaginatorContract<Collection>>
  ) {
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

  latest(column: 'postId' | 'collectionId' | 'taxonomyId', ids: number[] | undefined = undefined) {
    this.query
      .select(db.knexRawQuery('MAX(updated_at) as updated_at'), column)
      .if(ids, (truthy) => truthy.whereIn(column, ids!))
      .where('userId', this.user!.id)
      .whereNotNull(column)
      .groupBy(column)
      .orderBy('updated_at')
    return this
  }

  for(column: 'postId' | 'collectionId' | 'taxonomyId', ids: number[] | undefined = undefined) {
    this.query
      .select(db.knexRawQuery(`MAX(updated_at) as max_updated_at`), '*')
      .if(ids, (truthy) => truthy.whereIn(column, ids!))
      .where('userId', this.user!.id)
      .whereNotNull(column)
      .groupBy(column)
      .orderBy('max_updated_at')
    return this
  }
}
