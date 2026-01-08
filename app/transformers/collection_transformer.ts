import type Collection from '#models/collection'
import { BaseTransformer } from '@adonisjs/core/transformers'
import AssetTransformer from './asset_transformer.ts'
import ModuleTransformer from './module_transformer.ts'
import PostTransformer from './post_transformer.ts'
import TaxonomyTransformer from './taxonomy_transformer.ts'

export default class CollectionTransformer extends BaseTransformer<Collection> {
  get #postIds() {
    const lessons = this.resource.posts
    const modules = this.resource.children

    if (!lessons && !modules) return []

    const modulePostIds = modules.reduce<number[]>(
      (acc, module) => [...acc, ...(module.posts?.map((post) => post.id) || [])],
      []
    )
    const postIds = lessons?.map((post) => post.id) ?? []

    return [...modulePostIds, ...postIds]
  }

  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'parentId',
        'difficultyId',
        'paywallTypeId',
        'name',
        'slug',
        'description',
        'sortOrder',
        '$extras',
      ]),
      asset: AssetTransformer.transform(this.whenLoaded(this.resource.asset)),
      lessons: PostTransformer.transform(this.whenLoaded(this.resource.posts)),
    }
  }

  show() {
    return {
      ...this.toObject(),
      ...this.pick(this.resource, ['repositoryUrl', 'repositoryAccessLevel', 'youtubePlaylistUrl']),
      modules: ModuleTransformer.transform(this.resource.children),
      topics: TaxonomyTransformer.transform(this.resource.taxonomies),
      postIds: this.#postIds,
    }
  }
}
