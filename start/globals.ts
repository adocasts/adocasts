import CommentTypes, { CommentTypeIdColumn } from '#enums/comment_types'
import Difficulties from '#enums/difficulties'
import Sorts from '#enums/sorts'
import Status from '#enums/status'
import FormService from '#services/form_service'
import parser_service from '#services/parser_service'
import TimeService from '#services/time_service'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import is from '@adonisjs/core/helpers/is'
import stringHelpers from '@adonisjs/core/helpers/string'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { icons as solarIcons } from '@iconify-json/solar'
import { icons as svgSpinners } from '@iconify-json/svg-spinners'
import { addCollection, edgeIconify } from 'edge-iconify'
import { image as gravatar } from 'gravatar-gen'
import { DateTime } from 'luxon'
import edge from 'edge.js'
import _ from 'lodash'
import GetUnreadNotificationCount from '#actions/notifications/get_unread_notification_count'

addCollection(solarIcons)
addCollection(simpleIcons)
addCollection(svgSpinners)

edge.use(edgeIconify)

// actions
edge.global('GetUnreadNotificationCount', GetUnreadNotificationCount)

// enums
edge.global('Sorts', Sorts)
edge.global('Status', Status)
edge.global('Difficulties', Difficulties)
edge.global('CommentTypes', CommentTypes)
edge.global('CommentTypeIdColumn', CommentTypeIdColumn)
edge.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)

// utilities
edge.global('_', _)
edge.global('string', stringHelpers)
edge.global('DateTime', DateTime)
edge.global('TimeService', TimeService)
edge.global('is', is)
edge.global('parser', parser_service)
edge.global('form', FormService)
edge.global('gravatar', gravatar)
