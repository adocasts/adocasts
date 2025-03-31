import edge from 'edge.js'
import { addCollection, edgeIconify } from 'edge-iconify'
import { icons as solarIcons } from '@iconify-json/solar'
import { DateTime } from 'luxon'
import TimeService from '#core/services/time_service'
import is from '@adonisjs/core/helpers/is'

addCollection(solarIcons)

edge.use(edgeIconify)

edge.global('DateTime', DateTime)
edge.global('TimeService', TimeService)
edge.global('is', is)
