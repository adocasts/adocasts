import Factory from '@adonisjs/lucid/factories'
import Plans from '#enums/plans'
import Roles from '#enums/roles'
import User from '#models/user'
import { CommentFactory } from '#factories/comment_factory'
import { PostFactory } from '#factories/post_factory'
import { ProfileFactory } from '#factories/profile_factory'
import { CollectionFactory } from '#factories/collection_factory'

export const UserFactory = Factory
  .define(User, ({ faker }) => ({
    roleId: Roles.USER,
    planId: Plans.FREE,
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    avatarUrl: faker.image.url({ width: 300, height: 300 }),
  }))
  .state('admin', user => user.roleId = Roles.ADMIN)
  .state('plusMonthly', user => user.planId = Plans.PLUS_MONTHLY)
  .state('plusAnnually', user => user.planId = Plans.PLUS_ANNUAL)
  .state('plusForever', user => user.planId = Plans.FOREVER)
  .state('admin', user => user.roleId = Roles.ADMIN)
  .state('contributorLvl1', user => user.roleId = Roles.CONTRIBUTOR_LVL_1)
  .state('contributorLvl2', user => user.roleId = Roles.CONTRIBUTOR_LVL_2)
  .relation('comments', () => CommentFactory)
  .relation('posts', () => PostFactory)
  .relation('profile', () => ProfileFactory)
  .relation('collections', () => CollectionFactory)
  .build()