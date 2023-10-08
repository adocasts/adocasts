import View from '@ioc:Adonis/Core/View'
import PostTypes from 'App/Enums/PostTypes'
import Roles from 'App/Enums/Roles'
import States from 'App/Enums/States'
import Status from 'App/Enums/Status'
import Plans from 'App/Enums/Plans'
import Plan from 'App/Models/Plan'
import NotificationService from 'App/Services/NotificationService'
import PostService from 'App/Services/PostService'
import UtilityService from 'App/Services/UtilityService'
import { DateTime } from 'luxon'
import HtmlParser from 'App/Services/HtmlParser'
import VideoTypes from 'App/Enums/VideoTypes'
import Env from '@ioc:Adonis/Core/Env'
import StripeSubscriptionStatuses from 'App/Enums/StripeSubscriptionStatuses'
import PaywallTypes from 'App/Enums/PaywallTypes'
import CouponDurations from 'App/Enums/CouponDurations'

if (Env.get('NODE_ENV') === 'test') {
  View.global('csrfField', () => '')
}

View.global('DateTime', DateTime)
View.global('Roles', Roles)
View.global('PostTypes', PostTypes)
View.global('States', States)
View.global('Status', Status)
View.global('Plans', Plans)
View.global('Plan', Plan)
View.global('VideoTypes', VideoTypes)
View.global('PaywallTypes', PaywallTypes)
View.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)
View.global('CouponDurations', CouponDurations)

View.global('NotificationService', NotificationService)

View.global('stripHTML', UtilityService.stripHTML)
View.global('getSingularOrPlural', UtilityService.getSingularOrPlural)
View.global('secondsForDisplay', UtilityService.secondsForDisplay)
View.global('secondsToTimestring', UtilityService.secondsToTimestring)
View.global('getAbbrev', UtilityService.getAbbrev)
View.global('timeago', UtilityService.timeago)
View.global('routePost', PostService.getPostPath)
View.global('formatNumber', UtilityService.formatNumber)
View.global('formatCurrency', UtilityService.formatCurrency)
View.global('displaySocialUrl', UtilityService.displaySocialUrl)
View.global('getBodyPreview', HtmlParser.getPreview)
View.global('htmlParser', HtmlParser)
