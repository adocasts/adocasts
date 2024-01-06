import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Roles from '#enums/roles'
import Role from '#models/role'
import User from '#models/user'
import UtilityService from '#services/utility_service'
import app from '@adonisjs/core/services/app'
import { CollectionFactory } from '#factories/collection_factory'
import { TaxonomyFactory } from '#factories/taxonomy_factory'
import { UserFactory } from '#factories/user_factory'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class StarterSeedSeeder extends BaseSeeder {
  async run() {
    const trx = await db.transaction()

    try {
      await this.seedRoles(trx)

      if (!app.inTest && !app.inProduction) {
        await this.seedUsersAndContent(trx)
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      console.log({ error })
    }
  }

  async seedRoles(trx: TransactionClientContract) {
    return Role.createMany(
      [
        {
          id: Roles.USER,
          name: 'User',
          description: 'Authenticated User',
        },
        {
          id: Roles.ADMIN,
          name: 'Admin',
          description: 'Super User',
        },
        {
          id: Roles.CONTRIBUTOR_LVL_1,
          name: 'Contributor LVL 1',
          description: 'Can contribute content',
        },
        {
          id: Roles.CONTRIBUTOR_LVL_2,
          name: 'Contributor LVL 2',
          description: 'Can contribute content, series, and taxonomies',
        },
      ],
      {
        client: trx,
      }
    )
  }

  async seedTaxonomies(trx: TransactionClientContract, admin: User) {
    const ownerId = admin.id
    const rootTaxonomyNames = ['AdonisJS', 'AWS Amplify', 'Nuxt', 'JavaScript', 'VueJS', 'HTMX']
    const adonisChildrenNames = [
      'Bouncer',
      'Router',
      'HttpContext',
      'Ace CLI',
      'Validator',
      'Lucid',
      'Tips',
      'Edge',
      'Authorization',
    ]
    const taxBase = TaxonomyFactory.client(trx).with('asset', 1, (f) => f.apply('icon'))
    const [adonis, ...others] = await Promise.all(
      rootTaxonomyNames.map((name) => taxBase.merge({ name, ownerId }).create())
    )
    const adonisChildren = await Promise.all(
      adonisChildrenNames.map((name) =>
        taxBase.merge({ name, parentId: adonis.id, rootParentId: adonis.id, ownerId }).create()
      )
    )

    return [adonis.id, ...others.map((t) => t.id), ...adonisChildren.map((t) => t.id)]
  }

  async seedUsersAndContent(trx: TransactionClientContract) {
    const password = 'Password!01' // we'll set our own password so we can login as user
    const baseUser = UserFactory.client(trx).with('profile').merge({ password })
    const admin = await baseUser.apply('admin').apply('plusForever').create()
    const contributorLvl1 = await baseUser.apply('contributorLvl1').apply('plusForever').create()
    const contributorLvl2 = await baseUser.apply('contributorLvl2').apply('plusForever').create()
    const freeUsers = await baseUser.createMany(50)
    const plusMonthlyUsers = await baseUser.apply('plusMonthly').createMany(50)
    const plusAnnualUsers = await baseUser.apply('plusAnnually').createMany(50)
    const foreverUsers = await baseUser.apply('plusForever').createMany(50)
    const userIds = [
      ...freeUsers.map((u) => u.id),
      ...plusMonthlyUsers.map((u) => u.id),
      ...plusAnnualUsers.map((u) => u.id),
      ...foreverUsers.map((u) => u.id),
    ]
    const taxonomyIds = await this.seedTaxonomies(trx, admin)

    // creates the following all tied to admin
    //    mock "Lets Learn" series
    //    with 5 sub-collections
    //    containing 5 lessons each
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    let rootSortOrder = 0
    let moduleSortOrder = 0
    await CollectionFactory.client(trx)
      .merge({ ownerId: admin.id, name: "Let's Learn AdonisJS 5" })
      .with('asset', 1, (f) => f.apply('icon'))
      .with('children', 5, (f) =>
        f
          .merge({ ownerId: admin.id })
          .tap((row) => (row.sortOrder = moduleSortOrder++))
          .with('posts', 5, (posts) =>
            posts
              .apply('video')
              .pivotAttributes(
                [...new Array(5)].map((_, i) => ({
                  root_collection_id: f.parent.parentId,
                  sort_order: i,
                  root_sort_order: rootSortOrder++,
                }))
              )
              .with('assets', 1, (assets) =>
                assets.apply('thumbnail').pivotAttributes({ sort_order: 0 })
              )
              .with('comments', 6, (comments) =>
                comments.tap((row) => (row.userId = UtilityService.getRandom(userIds)))
              )
              .factory.after('create', async (_, row) => {
                await row.related('authors').sync([admin.id])
                await row.related('taxonomies').sync([UtilityService.getRandom(taxonomyIds)])
              })
          )
      )
      .create()

    // creates the following all tied to admin
    //    5 mock series
    //    with 4 sub-collections
    //    containing 5 lessons each
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    rootSortOrder = 0
    moduleSortOrder = 0
    await CollectionFactory.client(trx)
      .merge({ ownerId: admin.id })
      .with('asset', 1, (f) => f.apply('icon'))
      .with('children', 4, (f) =>
        f
          .merge({ ownerId: admin.id })
          .tap((row) => (row.sortOrder = moduleSortOrder++))
          .with('posts', 5, (posts) =>
            posts
              .apply('video')
              .pivotAttributes(
                [...new Array(5)].map((_, i) => ({
                  root_collection_id: f.parent.parentId,
                  sort_order: i,
                  root_sort_order: rootSortOrder++,
                }))
              )
              .with('assets', 1, (assets) =>
                assets.apply('thumbnail').pivotAttributes({ sort_order: 0 })
              )
              .with('comments', 6, (comments) =>
                comments.tap((row) => (row.userId = UtilityService.getRandom(userIds)))
              )
              .factory.after('create', async (_, row) => {
                await row.related('authors').sync([admin.id])
                await row.related('taxonomies').sync([UtilityService.getRandom(taxonomyIds)])
              })
          )
      )
      .createMany(5)

    // creates the following all tied to contributorLvl2
    //    3 mock series
    //    with 4 sub-collections
    //    containing 5 lessons each
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    rootSortOrder = 0
    moduleSortOrder = 0
    await CollectionFactory.client(trx)
      .merge({ ownerId: contributorLvl2.id })
      .with('asset', 1, (f) => f.apply('icon'))
      .with('children', 4, (f) =>
        f
          .merge({ ownerId: contributorLvl2.id })
          .tap((row) => (row.sortOrder = moduleSortOrder++))
          .with('posts', 5, (posts) =>
            posts
              .apply('video')
              .pivotAttributes(
                [...new Array(5)].map((_, i) => ({
                  root_collection_id: f.parent.parentId,
                  sort_order: i,
                  root_sort_order: rootSortOrder++,
                }))
              )
              .with('assets', 1, (assets) =>
                assets.apply('thumbnail').pivotAttributes({ sort_order: 0 })
              )
              .with('comments', 6, (comments) =>
                comments.tap((row) => (row.userId = UtilityService.getRandom(userIds)))
              )
              .factory.after('create', async (_, row) => {
                await row.related('authors').sync([contributorLvl2.id])
                await row.related('taxonomies').sync([UtilityService.getRandom(taxonomyIds)])
              })
          )
      )
      .createMany(3)

    // creates the following
    //    3 mock series tied to admin (contributorLvl1 doesn't have access to create collections/taxonomies)
    //    containing 10 lessons each, authored by contributorLvl2
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    rootSortOrder = 0
    await CollectionFactory.client(trx)
      .merge({ ownerId: admin.id })
      .with('asset', 1, (f) => f.apply('icon'))
      .with('posts', 10, (f) =>
        f
          .apply('video')
          .pivotAttributes(
            [...new Array(10)].map((_, i) => ({
              root_collection_id: f.parent.id,
              sort_order: i,
              root_sort_order: rootSortOrder++,
            }))
          )
          .with('assets', 1, (assets) =>
            assets.apply('thumbnail').pivotAttributes({ sort_order: 0 })
          )
          .with('comments', 6, (comments) =>
            comments.tap((row) => (row.userId = UtilityService.getRandom(userIds)))
          )
          .factory.after('create', async (_, row) => {
            await row.related('authors').sync([contributorLvl1.id])
            await row.related('taxonomies').sync([UtilityService.getRandom(taxonomyIds)])
          })
      )
      .createMany(3)
  }
}
