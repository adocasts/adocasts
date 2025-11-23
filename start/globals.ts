import GetSeries from '#actions/collections/get_series'
import GetUnreadNotificationCount from '#actions/notifications/get_unread_notification_count'
import CommentTypes, { CommentTypeIdColumn } from '#enums/comment_types'
import Difficulties from '#enums/difficulties'
import LessonPanels from '#enums/lesson_panels'
import PaywallTypes from '#enums/paywall_types'
import Plans from '#enums/plans'
import RepositoryAccessLevels from '#enums/repository_access_levels'
import Sorts from '#enums/sorts'
import Status from '#enums/status'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import VideoTypes from '#enums/video_types'
import Note from '#models/note'
import CurrencyService from '#services/currency_service'
import FormService from '#services/form_service'
import HlsService from '#services/hls_service'
import NumberService from '#services/number_service'
import Pagination from '#services/pagination_service'
import parserService from '#services/parser_service'
import plan from '#services/plan_service'
import TimeService from '#services/time_service'
import { SimplePaginatorDtoMetaContract } from '@adocasts.com/dto/types'
import { cuid } from '@adonisjs/core/helpers'
import is from '@adonisjs/core/helpers/is'
import stringHelpers from '@adonisjs/core/helpers/string'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { icons as solarIcons } from '@iconify-json/solar'
import { icons as svgSpinners } from '@iconify-json/svg-spinners'
import { addCollection, edgeIconify } from 'edge-iconify'
import edge from 'edge.js'
import { image as gravatar } from 'gravatar-gen'
import _ from 'lodash'
import { DateTime } from 'luxon'
import env from './env.js'

addCollection(solarIcons)
addCollection(simpleIcons)
addCollection(svgSpinners)

edge.use(edgeIconify)

// actions
edge.global('GetUnreadNotificationCount', GetUnreadNotificationCount)
edge.global('GetSeries', GetSeries)

// enums
edge.global('Sorts', Sorts)
edge.global('Status', Status)
edge.global('Plans', Plans)
edge.global('PaywallTypes', PaywallTypes)
edge.global('RepositoryAccessLevels', RepositoryAccessLevels)
edge.global('Difficulties', Difficulties)
edge.global('CommentTypes', CommentTypes)
edge.global('CommentTypeIdColumn', CommentTypeIdColumn)
edge.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)
edge.global('VideoTypes', VideoTypes)
edge.global('LessonPanels', LessonPanels)

// models
edge.global('Note', Note)

// utilities
edge.global('_', _)
edge.global('env', (key: string) => env.get(key))
edge.global('string', stringHelpers)
edge.global('DateTime', DateTime)
edge.global('TimeService', TimeService)
edge.global('is', is)
edge.global('parser', parserService)
edge.global('currency', CurrencyService)
edge.global('form', FormService)
edge.global('gravatar', gravatar)
edge.global('hls', HlsService)
edge.global('PlanService', plan)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))
edge.global('pagination', (meta: SimplePaginatorDtoMetaContract) => new Pagination(meta))
edge.global('number', NumberService)
edge.global('cuid', cuid)
edge.global('img', (filename: string, options?: { width?: number; format?: string }) => {
  const url = new URL(`${env.get('ASSET_DOMAIN')}${filename}`)

  if (options?.width) {
    url.searchParams.set('w', options.width.toString())
  }

  if (options?.format) {
    url.searchParams.set('f', options.format)
  }

  return url.toString()
})
