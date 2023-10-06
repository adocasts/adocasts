import Post from 'App/Models/Post'
import Factory from '@ioc:Adonis/Lucid/Factory'
import States from 'App/Enums/States'
import { UserFactory } from './UserFactory'
import { DateTime } from 'luxon'
import { CommentFactory } from './CommentFactory'
import PaywallTypes from 'App/Enums/PaywallTypes'

export const PostFactory = Factory
  .define(Post, ({ faker }) => ({
    title: faker.word.words(5),
    description: faker.lorem.sentences(2),
    body: faker.lorem.paragraphs(5),
    stateId: States.PUBLIC,
    publishAt: DateTime.fromJSDate(faker.date.past()),
  }))
  .state('futureDated', (post, { faker }) => {
    post.publishAt = DateTime.fromJSDate(faker.date.future())
  })
  .state('draft', (post) => post.stateId = States.DRAFT)
  .state('unlisted', (post) => post.stateId = States.UNLISTED)
  .state('private', (post) => post.stateId = States.PRIVATE)
  .state('paywalled', (post) => post.paywallTypeId = PaywallTypes.FULL)
  .state('timedPaywall', (post) => post.paywallTypeId = PaywallTypes.DELAYED_RELEASE)
  .relation('authors', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .build()
