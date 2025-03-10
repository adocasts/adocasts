import factory from '@adonisjs/lucid/factories'
import Discussion from '#models/discussion'
import Taxonomy from '#models/taxonomy'
import UtilityService from '#services/utility_service'
import { UserFactory } from './user_factory.js'
import { CommentFactory } from './comment_factory.js'

export const DiscussionFactory = factory
  .define(Discussion, async ({ faker }) => {
    const taxonomies = (await Taxonomy.query().select('id')).map((taxonomy) => taxonomy.id)
    return {
      title: faker.lorem.words({ min: 4, max: 10 }),
      body: faker.lorem.paragraphs({ min: 1, max: 6 }),
      taxonomyId: UtilityService.getRandom(taxonomies),
    }
  })
  .relation('user', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .build()
