import UtilityService from "#services/utility_service"
import env from '#start/env'
import edge from "edge.js"
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as phicons } from '@iconify-json/ph'
import { icons as simpleicons } from '@iconify-json/simple-icons'
import { DateTime } from "luxon"

addCollection(phicons)
addCollection(simpleicons)

edge.use(edgeIconify)

edge.global('DateTime', DateTime)
edge.global('utils', UtilityService)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))