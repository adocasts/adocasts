import UtilityService from '#services/utility_service'
import env from '#start/env'
import edge from 'edge.js'
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as phicons } from '@iconify-json/ph'
import { icons as simpleicons } from '@iconify-json/simple-icons'
import { icons as svgspinners } from '@iconify-json/svg-spinners'
import { DateTime } from 'luxon'
import NotificationService from '#services/notification_service'
import Roles from '#enums/roles'
import PostTypes from '#enums/post_types'
import States from '#enums/states'
import Status from '#enums/status'
import Plans from '#enums/plans'
import Plan from '#models/plan'
import VideoTypes from '#enums/video_types'
import PaywallTypes from '#enums/paywall_types'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import CouponDurations from '#enums/coupon_durations'
import string from '@adonisjs/core/helpers/string'
import FormService from '#services/form_service'
import HtmlParser from '#services/html_parser'
import Tab from '../app/view_models/tab.js'
import CollectionService from '#services/collection_service'
import StripeService from '#services/stripe_service'
import app from '@adonisjs/core/services/app'
import Difficulties from '#enums/difficulties'
import PlanService from '#services/plan_service'

addCollection(phicons)
addCollection(simpleicons)
addCollection(svgspinners)

edge.use(edgeIconify)

// we're not registering csrf in test env, so we'll just stub it's method
if (app.inTest) {
  edge.global('csrfField', () => '')
}

edge.global('DateTime', DateTime)
edge.global('string', string)
edge.global('env', (key: string) => env.get(key))
edge.global('utils', UtilityService)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))
edge.global('form', FormService)
edge.global('parser', HtmlParser)
edge.global('tabber', Tab)
edge.global('collectionService', CollectionService)
edge.global('stripeDateTime', StripeService.toDateTime)

edge.global('Roles', Roles)
edge.global('PostTypes', PostTypes)
edge.global('States', States)
edge.global('Status', Status)
edge.global('Plans', Plans)
edge.global('Plan', Plan)
edge.global('PlanService', PlanService)
edge.global('VideoTypes', VideoTypes)
edge.global('PaywallTypes', PaywallTypes)
edge.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)
edge.global('CouponDurations', CouponDurations)
edge.global('Difficulties', Difficulties)

edge.global('NotificationService', NotificationService)
