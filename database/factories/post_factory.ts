import Post from '#models/post'
import Factory from '@adonisjs/lucid/factories'
import States from '#enums/states'
import { UserFactory } from '#factories/user_factory'
import { DateTime } from 'luxon'
import { CommentFactory } from '#factories/comment_factory'
import PaywallTypes from '#enums/paywall_types'
import VideoTypes from '#enums/video_types'
import UtilityService from '#services/utility_service'
import { AssetFactory } from '#factories/asset_factory'
import string from '@adonisjs/core/helpers/string'

const youtubeUrls = [
  'https://www.youtube.com/watch?v=Npn-2qweD5k',
  'https://www.youtube.com/watch?v=q0I3bzYUE1A',
  'https://www.youtube.com/watch?v=zvK4-suEKnM',
  'https://www.youtube.com/watch?v=0AGHmWdnsVM',
  'https://www.youtube.com/watch?v=NdLzhFINrW4',
  'https://www.youtube.com/watch?v=KfkBAYgwAxA',
  'https://www.youtube.com/watch?v=7HyCMmjO9zQ',
  'https://www.youtube.com/watch?v=BPjvak_kB3U',
  'https://www.youtube.com/watch?v=OieU-z4orBk'
]

export const PostFactory = Factory
  .define(Post, ({ faker }) => ({
    title: string.titleCase(faker.lorem.words({ min: 3, max: 9 })),
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
  .state('video', (post, { faker }) => {
    post.videoTypeId = VideoTypes.YOUTUBE
    post.videoUrl = UtilityService.getRandom(youtubeUrls)
    post.videoSeconds = faker.number.int({ min: 90, max: 3600 })
  })
  .relation('authors', () => UserFactory)
  .relation('comments', () => CommentFactory)
  .relation('assets', () => AssetFactory)
  .build()
