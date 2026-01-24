import BaseAction from '#actions/base_action'
import FrameworkVersionDto from '#dtos/framework_version'
import FrameworkVersion from '#models/framework_version'

type FrameworkVersionTypes = 'collections' | 'posts'

export default class GetFrameworkVersionsFilter extends BaseAction {
  async handle(type: FrameworkVersionTypes) {
    switch (type) {
      case 'collections':
        return this.#get('collections')
      case 'posts':
        return this.#get('posts')
      default:
        throw new Error(`${this.constructor.name} does not implement ${type}`)
    }
  }

  async #get(collectionType: 'collections' | 'posts') {
    let query = FrameworkVersion.query().where('isActive', true)

    switch (collectionType) {
      case 'collections':
        query.withCount('collections', (q) => q.whereNull('parentId').as('count'))
        break
      case 'posts':
        query.withCount('posts', (q) => q.apply((scope) => scope.published()).as('count'))
        break
    }

    const frameworkVersions = await query
      .orderBy([
        { column: 'sort', order: 'asc' },
        { column: 'framework', order: 'asc' },
        { column: 'version', order: 'asc' },
      ])
      .dto(FrameworkVersionDto)

    return frameworkVersions.filter((fv) => Number(fv.meta.count || '0') > 0)
  }
}
