import Difficulties from '#core/enums/difficulties'
import Sorts from '#core/enums/sorts'
import FormService from '#core/services/form_service'
import parser_service from '#core/services/parser_service'
import TimeService from '#core/services/time_service'
import StripeSubscriptionStatuses from '#plan/enums/stripe_subscription_statuses'
import is from '@adonisjs/core/helpers/is'
import stringHelpers from '@adonisjs/core/helpers/string'
import { icons as simpleIcons } from '@iconify-json/simple-icons'
import { icons as solarIcons } from '@iconify-json/solar'
import { icons as svgSpinners } from '@iconify-json/svg-spinners'
import { addCollection, edgeIconify } from 'edge-iconify'
import edge from 'edge.js'
import { DateTime } from 'luxon'

addCollection(solarIcons)
addCollection(simpleIcons)
addCollection(svgSpinners)

edge.use(edgeIconify)

// enums
edge.global('Sorts', Sorts)
edge.global('Difficulties', Difficulties)
edge.global('StripeSubscriptionStatuses', StripeSubscriptionStatuses)

// utilities
edge.global('string', stringHelpers)
edge.global('DateTime', DateTime)
edge.global('TimeService', TimeService)
edge.global('is', is)
edge.global('parser', parser_service)
edge.global('form', FormService)
