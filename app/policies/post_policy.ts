import LessonShowDto from '#dtos/lesson_show'
import PaywallTypes from '#enums/paywall_types'
import RepositoryAccessLevels from '#enums/repository_access_levels'
import States from '#enums/states'
import Post from '#models/post'
import User from '#models/user'
import BasePolicy from '#policies/base_policy'
import TimeService from '#services/time_service'
import { action } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { DateTime } from 'luxon'

export default class PostPolicy extends BasePolicy {
  @action({ allowGuest: true })
  view(user: User, post: Post | LessonShowDto): AuthorizerResponse {
    if (user && !user.isFreeTier) return true
    if (post.paywallTypeId === PaywallTypes.NONE) return true
    if (post.paywallTypeId === PaywallTypes.FULL) return false

    return !TimeService.getIsPaywalled(post)
  }

  @action({ allowGuest: true })
  viewFutureDated(user: User): AuthorizerResponse {
    if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user))
      return true
    return false
  }

  @action({ allowGuest: true })
  async viewRepository(user: User, post: Post | LessonShowDto) {
    if (!post.repositoryUrl) return false

    if (post.repositoryAccessLevel === RepositoryAccessLevels.PUBLIC) {
      return true
    }

    if (!user) return false

    return !user.isFreeTier
  }

  @action({ allowGuest: true })
  state(user: User, post: Post | LessonShowDto) {
    if (this.isAdmin(user) || this.isContributorLvl1(user) || this.isContributorLvl2(user))
      return true

    if (post instanceof LessonShowDto && post.author?.id === user?.id) {
      return true
    }

    if (post instanceof Post && post.authors.some((author) => author.id === user?.id)) {
      return true
    }

    return post.stateId === States.PUBLIC || post.stateId === States.UNLISTED
  }

  @action({ allowGuest: true })
  index(_user: User, post: Post | LessonShowDto) {
    const isPublic = post.stateId === States.PUBLIC

    if (!post.publishAt) {
      return isPublic
    }

    const publishAt =
      typeof post.publishAt === 'string' ? DateTime.fromISO(post.publishAt) : post.publishAt

    const isPastPublishAt = publishAt.diffNow().as('seconds')

    return isPublic && isPastPublishAt < 0
  }
}
