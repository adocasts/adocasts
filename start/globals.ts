import View from '@ioc:Adonis/Core/View'
import PostTypes from 'App/Enums/PostTypes'
import Roles from 'App/Enums/Roles'
import States from 'App/Enums/States'
import Status from 'App/Enums/Status'
import PostService from 'App/Services/PostService'
import UtilityService from 'App/Services/UtilityService'
import { DateTime } from 'luxon'

View.global('DateTime', DateTime)
View.global('Roles', Roles)
View.global('PostTypes', PostTypes)
View.global('States', States)
View.global('Status', Status)

View.global('stripHTML', UtilityService.stripHTML)
View.global('getSingularOrPlural', UtilityService.getSingularOrPlural)
View.global('secondsForDisplay', UtilityService.secondsForDisplay)
View.global('getAbbrev', UtilityService.getAbbrev)
View.global('timeago', UtilityService.timeago)
View.global('routePost', PostService.getPostPath)
