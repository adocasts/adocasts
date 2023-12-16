import UtilityService from "#services/utility_service"
import env from '#start/env'
import edge from "edge.js"
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as phicons } from '@iconify-json/ph'
import { icons as simpleicons } from '@iconify-json/simple-icons'
import { icons as svgspinners } from '@iconify-json/svg-spinners'
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
import FormService from "#services/form_service"
import HtmlParser from "#services/html_parser"
import Tab from "../app/view_models/tab.js"

addCollection(phicons)
addCollection(simpleicons)
addCollection(svgspinners)

edge.use(edgeIconify)

edge.global('DateTime', DateTime)
edge.global('string', string)
edge.global('env', (key: string) => env.get(key))
edge.global('utils', UtilityService)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))
edge.global('form', FormService)
edge.global('parser', HtmlParser)
edge.global('tabber', Tab)

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