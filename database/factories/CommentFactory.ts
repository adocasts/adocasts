import Comment from 'App/Models/Comment'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { UserFactory } from './UserFactory'
import { PostFactory } from './PostFactory'

export const CommentFactory = Factory
  .define(Comment, ({ faker }) => ({
    body: faker.lorem.paragraph()
  }))
  .relation('user', () => UserFactory)
  .relation('post', () => PostFactory)
  .build()
