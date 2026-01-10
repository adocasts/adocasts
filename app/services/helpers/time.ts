import PaywallTypes from '#enums/paywall_types'
import States from '#enums/states'
import type Post from '#models/post'
import { DateTime } from 'luxon'

const timeHelpers = {
  secondsToTimestring(totalSeconds: number | string, verbose: boolean = false) {
    if (!totalSeconds) return '0s'

    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)

    totalSeconds %= 60

    const seconds = Math.floor(totalSeconds)

    if (hours) {
      return verbose ? `${hours} hours ${minutes} minutes` : `${hours}h ${minutes}m`
    }

    if (minutes) {
      return verbose ? `${minutes} minutes ${seconds} seconds` : `${minutes}m ${seconds}s`
    }

    return verbose ? `${seconds} seconds` : `${seconds}s`
  },

  secondsToTime(totalSeconds: number | string) {
    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)

    totalSeconds %= 60

    const seconds = Math.floor(totalSeconds)
    const short = `${(minutes + '').padStart(2, '0')}:${(seconds + '').padStart(2, '0')}`

    if (!hours) {
      return short
    }

    return `${(hours + '').padStart(2, '0')}:${short}`
  },

  fromStripe(seconds: number | undefined) {
    if (!seconds) return
    return DateTime.fromSeconds(seconds, { zone: 'UTC' })
  },

  getIsPaywalled(post: Post) {
    if (post.paywallTypeId === PaywallTypes.NONE) return false
    if (post.paywallTypeId === PaywallTypes.FULL) return true
    if (!post.publishAt) return false

    const publishAt =
      typeof post.publishAt === 'string' ? DateTime.fromISO(post.publishAt) : post.publishAt
    const { days } = publishAt.plus({ days: 14 }).diffNow('days')

    return days > 0
  },

  getIsPublished(post: Post) {
    const isPublicOrUnlisted = post.stateId === States.PUBLIC || post.stateId === States.UNLISTED

    if (!post.publishAt) {
      return isPublicOrUnlisted
    }

    const publishAt =
      typeof post.publishAt === 'string' ? DateTime.fromISO(post.publishAt) : post.publishAt

    const isPastPublishAt = publishAt.diffNow().as('seconds')

    return isPublicOrUnlisted && isPastPublishAt < 0
  },

  /**
   * returns date in relative human readable time ago string
   * @param date
   */
  timeago(date: string | DateTime | null) {
    if (typeof date === 'string') {
      date = DateTime.fromISO(date)
    }

    return date ? date.toRelative() : ''
  },

  paywallTimeAgo(post: Post) {
    if (!post.publishAt) return
    const publishAt =
      typeof post.publishAt === 'string' ? DateTime.fromISO(post.publishAt) : post.publishAt
    return this.timeago(publishAt.plus({ days: 14 }))
  },

  dtmHumanShort(iso: string) {
    const dtm = DateTime.fromISO(iso)
    const suffix = this.getDaySuffix(dtm.day)

    if (dtm.year === DateTime.now().year) {
      return dtm.toFormat(`MMM d'${suffix}'`)
    }

    return dtm.toFormat(`MMM d'${suffix}', yy`)
  },

  getDaySuffix(day: number) {
    if (day > 3 && day < 21) {
      return 'th'
    }

    const suffixes = ['st', 'nd', 'rd']
    return suffixes[(day % 10) - 1] || 'th'
  },
}

export default timeHelpers
