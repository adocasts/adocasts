import Comment from '#models/comment'
import Factory from '@adonisjs/lucid/factories'
import { UserFactory } from '#factories/user_factory'
import { PostFactory } from '#factories/post_factory'
import States from '#enums/states'

export const CommentFactory = Factory.define(Comment, async ({ faker }) => ({
  body: faker.lorem.paragraph(),
  stateId: States.PUBLIC,
  identity: faker.string.uuid(), //await IdentityService.getIdentity(faker.internet.ip(), faker.internet.userAgent())
}))
  .relation('user', () => UserFactory)
  .relation('post', () => PostFactory)
  .build()
