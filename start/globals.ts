import UtilityService from "#services/utility_service"
import env from '#start/env'
import edge from "edge.js"
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as majesticons } from '@iconify-json/majesticons'

addCollection(majesticons)

edge.use(edgeIconify)

edge.global('utils', UtilityService)
edge.global('assetDomain', env.get('ASSET_DOMAIN', ''))