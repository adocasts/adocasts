import edge from 'edge.js'
import { addCollection, edgeIconify } from 'edge-iconify'
import { icons as solarIcons } from '@iconify-json/solar'
import { DateTime } from 'luxon'
import TimeService from '#services/time_service'

addCollection(solarIcons)

edge.use(edgeIconify)

edge.global('DateTime', DateTime)
edge.global('TimeService', TimeService)
