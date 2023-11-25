import UtilityService from "#services/utility_service"
import env from '#start/env'
import edge from "edge.js"
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as phicons } from '@iconify-json/ph'
import { icons as simpleicons } from '@iconify-json/simple-icons'
import { DateTime } from "luxon"
import NotificationService from "#services/notification_service"
import Roles from "#enums/roles"
import PostTypes from "#enums/post_types"
import States from "#enums/states"
import Status from "#enums/status"
import Plans from "#enums/plans"
import Plan from "#models/plan"
import VideoTypes from "#enums/video_types"
import PaywallTypes from "#enums/paywall_types"
import StripeSubscriptionStatuses from "#enums/stripe_subscription_statuses"
import CouponDurations from "#enums/coupon_durations"
import string from '@adonisjs/core/helpers/string'

addCollection(phicons)
addCollection(simpleicons)

edge.use(edgeIconify)

edge.global('DateTime', DateTime)
edge.global('string', string)
edge.global('env', (key: string) => env.get(key))
edge.global('utils', UtilityService)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))

edge.global('Roles', Roles)
edge.global('PostTypes', PostTypes)
edge.global('States', States)
edge.global('Status', Status)
edge.global('Plans', Plans)
edge.global('Plan', Plan)
edge.global('VideoTypes', VideoTypes)
edge.global('PaywallTypes', PaywallTypes)
edge.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)
edge.global('CouponDurations', CouponDurations)

edge.global('NotificationService', NotificationService)