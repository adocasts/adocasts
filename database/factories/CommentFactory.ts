import Comment from 'App/Models/Comment'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { UserFactory } from './UserFactory'
import { PostFactory } from './PostFactory'
import States from 'App/Enums/States'

export const CommentFactory = Factory
  .define(Comment, async ({ faker }) => ({
    body: faker.lorem.paragraph(),
    stateId: States.PUBLIC,
    identity: faker.string.uuid()  //await IdentityService.getIdentity(faker.internet.ip(), faker.internet.userAgent())
  }))
  .relation('user', () => UserFactory)
  .relation('post', () => PostFactory)
  .build()
