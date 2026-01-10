import Discussion from '#models/discussion'
import Taxonomy from '#models/taxonomy'
import listHelpers from '#services/helpers/list'
import factory from '@adonisjs/lucid/factories'
import { CommentFactory } from './comment_factory.js'
import { UserFactory } from './user_factory.js'

export const DiscussionFactory = factory
  .define(Discussion, async ({ faker }) => {
    const taxonomies = (await Taxonomy.query().select('id')).map((taxonomy) => taxonomy.id)
    return {
      title: faker.lorem.words({ min: 4, max: 10 }),
      body: faker.lorem.paragraphs({ min: 1, max: 6 }),
      taxonomyId: listHelpers.getRandom(taxonomies),
    }
  })
  .relation('user', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .build()
