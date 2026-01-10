import { PostFactory } from '#database/factories/post_factory'
import { UserFactory } from '#database/factories/user_factory'
import States from '#enums/states'
import Comment from '#models/comment'
import Factory from '@adonisjs/lucid/factories'

export const CommentFactory = Factory.define(Comment, async ({ faker }) => ({
  body: faker.lorem.paragraph(),
  stateId: States.PUBLIC,
  identity: faker.string.uuid(), //await IdentityService.getIdentity(faker.internet.ip(), faker.internet.userAgent())
}))
  .relation('user', () => UserFactory)
  .relation('post', () => PostFactory)
  .build()
