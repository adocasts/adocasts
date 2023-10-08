import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Roles from 'App/Enums/Roles'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import UtilityService from 'App/Services/UtilityService'
import { CollectionFactory } from 'Database/factories/CollectionFactory'
import { TaxonomyFactory } from 'Database/factories/TaxonomyFactory'
import { UserFactory } from 'Database/factories/UserFactory'

export default class StarterSeedSeeder extends BaseSeeder {
  public async run() {
    await this.seedRoles()
    await this.seedUsersAndContent()
  }

  public async seedRoles() {
    return Role.createMany([
      {
        id: Roles.USER,
        name: 'User',
        description: 'Authenticated User'
      },
      {
        id: Roles.ADMIN,
        name: 'Admin',
        description: 'Super User'
      },
      {
        id: Roles.CONTRIBUTOR_LVL_1,
        name: 'Contributor LVL 1',
        description: 'Can contribute content'
      },
      {
        id: Roles.CONTRIBUTOR_LVL_2,
        name: 'Contributor LVL 2',
        description: 'Can contribute content, series, and taxonomies'
      }
    ])
  }

  public async seedTaxonomies(admin: User) {
    const ownerId = admin.id
    const rootTaxonomyNames = ['AdonisJS', 'AWS Amplify', 'Nuxt', 'JavaScript', 'VueJS', 'HTMX']
    const adonisChildrenNames = ['Bouncer', 'Router', 'HttpContext', 'Ace CLI', 'Validator', 'Lucid', 'Tips', 'Edge', 'Authorization']
    const [adonis, ...others] = await Promise.all(rootTaxonomyNames.map(name => TaxonomyFactory.merge({ name, ownerId }).create()))
    const adonisChildren = await Promise.all(adonisChildrenNames
      .map(name => TaxonomyFactory.merge({ name, parentId: adonis.id, rootParentId: adonis.id, ownerId }).create()))

    return [adonis.id, ...others.map(t => t.id), ...adonisChildren.map(t => t.id)]
  }

  public async seedUsersAndContent() {
    const password = 'Password!01' // we'll set our own password so we can login as user
    const baseUser = UserFactory.with('profile').merge({ password })
    const admin = await baseUser.apply('admin').apply('plusForever').create()
    const contributorLvl1 = await baseUser.apply('contributorLvl1').apply('plusForever').create()
    const contributorLvl2 = await baseUser.apply('contributorLvl2').apply('plusForever').create()
    const freeUsers = await baseUser.createMany(10)
    const plusMonthlyUsers = await baseUser.apply('plusMonthly').createMany(10)
    const plusAnnualUsers = await baseUser.apply('plusAnnually').createMany(10)
    const foreverUsers = await baseUser.apply('plusForever').createMany(10)
    const userIds = [
      ...freeUsers.map(u => u.id), 
      ...plusMonthlyUsers.map(u => u.id),
      ...plusAnnualUsers.map(u => u.id),
      ...foreverUsers.map(u => u.id)
    ]
    const taxonomyIds = await this.seedTaxonomies(admin)
    
    // creates the following all tied to admin
    //    mock "Lets Learn" series
    //    with 5 sub-collections
    //    containing 25 lessons each
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    await CollectionFactory
      .merge({ ownerId: admin.id, name: "Let's Learn AdonisJS 5" })
      .with('asset', 1, f => f.apply('icon'))
      .with('children', 5, f => f
        .merge({ ownerId: admin.id })
        .with('posts', 25, f => f
          .pivotAttributes({ root_collection_id: f.parent.parentId })
          .with('assets', 1, f => f.apply('thumbnail').pivotAttributes({ sort_order: 0 }))
          .with('comments', 6, f => f.merge({ userId: UtilityService.getRandom(userIds) }))
          .factory.after('create', async (_, row) => {
            await row.related('authors').attach([admin.id])
            await row.related('taxonomies').attach([UtilityService.getRandom(taxonomyIds)])
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
    await CollectionFactory
      .merge({ ownerId: admin.id })
      .with('asset', 1, f => f.apply('icon'))
      .with('children', 4, f => f
        .merge({ ownerId: admin.id })
        .with('posts', 5, f => f
          .pivotAttributes({ root_collection_id: f.parent.parentId })
          .with('assets', 1, f => f.apply('thumbnail').pivotAttributes({ sort_order: 0 }))
          .with('comments', 6, f => f.merge({ userId: UtilityService.getRandom(userIds) }))
          .factory.after('create', async (_, row) => {
            await row.related('authors').attach([admin.id])
            await row.related('taxonomies').attach([UtilityService.getRandom(taxonomyIds)])
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
    await CollectionFactory
      .merge({ ownerId: contributorLvl2.id })
      .with('asset', 1, f => f.apply('icon'))
      .with('children', 4, f => f
        .merge({ ownerId: contributorLvl2.id })
        .with('posts', 5, f => f
          .pivotAttributes({ root_collection_id: f.parent.parentId })
          .with('assets', 1, f => f.apply('thumbnail').pivotAttributes({ sort_order: 0 }))
          .with('comments', 6, f => f.merge({ userId: UtilityService.getRandom(userIds) }))
          .factory.after('create', async (_, row) => {
            await row.related('authors').attach([contributorLvl2.id])
            await row.related('taxonomies').attach([UtilityService.getRandom(taxonomyIds)])
          })
        )
      )
      .createMany(3)

    // creates the following
    //    3 mock series tied to admin (contributorLvl1 doesn't have access to create collections/taxonomies)
    //    with 4 sub-collections
    //    containing 5 lessons each, authored by contributorLvl2
    //    which are tied to random taxonomies
    //    each lesson also gets 6 comments from random users
    await CollectionFactory
      .merge({ ownerId: admin.id })
      .with('asset', 1, f => f.apply('icon'))
      .with('posts', 10, f => f
        .pivotAttributes({ root_collection_id: f.parent.id })
        .with('assets', 1, f => f.apply('thumbnail').pivotAttributes({ sort_order: 0 }))
        .with('comments', 6, f => f.merge({ userId: UtilityService.getRandom(userIds) }))
        .factory.after('create', async (_, row) => {
          await row.related('authors').attach([contributorLvl1.id])
          await row.related('taxonomies').attach([UtilityService.getRandom(taxonomyIds)])
        })
      )
      .createMany(3)
  }
}