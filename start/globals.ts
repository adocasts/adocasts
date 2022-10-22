import AssetService from 'App/Services/AssetService'
import { DateTime } from 'luxon'
import States, { StateDesc } from 'App/Enums/States'
import { StatusDesc } from 'App/Enums/Status'
import CollectionType, { CollectionTypeDesc } from 'App/Enums/CollectionTypes'
import PostType, { PostTypeDesc } from 'App/Enums/PostType'
import Roles from 'App/Enums/Roles'
import View from '@ioc:Adonis/Core/View'
import Database from '@ioc:Adonis/Lucid/Database'
import { string } from '@ioc:Adonis/Core/Helpers'
import Status from 'App/Enums/Status'
import Post from 'App/Models/Post'
import Route from '@ioc:Adonis/Core/Route'
import Comment from 'App/Models/Comment'
import NotificationService from 'App/Services/NotificationService'
import Env from '@ioc:Adonis/Core/Env'
import AffiliateService from 'App/Services/AffiliateService'
import Themes from 'App/Enums/Themes'
import * as timeago from 'timeago.js'
import IdentityService from 'App/Services/IdentityService'
import AssetTypes from 'App/Enums/AssetTypes'

if (Env.get('NODE_ENV') === 'test') {
  View.global('csrfField', () => '')
}

View.global('appUrl', (path) => {
  return Env.get('APP_DOMAIN') + path
})

View.global('affiliateService', AffiliateService)

View.global('routePost', (post: Post, params: { [x: string]: any }, options: { [x: string]: any }) => {
  switch(post.postTypeId) {
    case PostType.LESSON:
      return Route.makeUrl('lessons.show', params, options)
    case PostType.BLOG:
      return Route.makeUrl('posts.show', params, options)
    case PostType.NEWS:
      return Route.makeUrl('news.show', params, options)
    case PostType.LIVESTREAM:
      return Route.makeUrl('livestreams.show', params, options)
    case PostType.LINK:
      return post.redirectUrl
  }
})

View.global('img', AssetService.getAssetUrl)

View.global('getSingularOrPlural', (str: string, count: string|number|any[] ) => {
  let isPlural = false

  if (Array.isArray(count)) {
    isPlural = count.length == 0 || count.length > 1
  } else {
    isPlural = count == 0 || count != 1
  }

  return isPlural ? string.pluralize(str) : str
})

View.global('stripHtml', (string: string, replacement: string = '') => string.replace(/<[^>]*>?/gm, replacement))

View.global('Db', (table: string) => {
  return Database.from(table)
})

View.global('getCommentGoUrl', (comment: Comment) => {
  return NotificationService.getGoPath(comment)
})

View.global('getAbbrev', (text: string) => {
  if (typeof text != 'string' || !text) {
    return '';
  }
  const acronym = text
    .match(/\b([A-Z])/g)
    ?.reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next): next[0] || ''), '')
    .toUpperCase()
  return acronym;
})

View.global('secondsForDisplay', (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const days = Math.floor(totalSeconds / (3600 * 24));

  let maxDisplay = days
  let maxDisplayKey = 'day'

  if (!days) {
    maxDisplay = hours
    maxDisplayKey = 'hour'
  }

  if (!hours) {
    maxDisplay = minutes
    maxDisplayKey = 'minute'
  }

  if (!minutes) {
    maxDisplay = seconds
    maxDisplayKey = 'second'
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    maxDisplay,
    maxDisplayKey
  }
})

View.global('timeago', (date: string | DateTime | null) => {
  if (typeof date === 'string') {
    date = DateTime.fromISO(date)
  }
  return date ? timeago.format(date.toJSDate()) : ''
})

View.global('ipLocate', async (ip) => {
  return IdentityService.getLocation(ip)
})

View.global('GA_PROPERTY', Env.get('GA_PROPERTY'))

View.global('DateTime', DateTime)
View.global('AssetTypes', AssetTypes)
View.global('StateEnum', States)
View.global('StateEnumDesc', StateDesc)
View.global('StatusEnum', Status)
View.global('StatusEnumDesc', StatusDesc)
View.global('CollectionTypeEnum', CollectionType)
View.global('CollectionTypeEnumDesc', CollectionTypeDesc)
View.global('PostTypeEnum', PostType)
View.global('PostTypeEnumDesc', PostTypeDesc)
View.global('Roles', Roles)
View.global('Themes', Themes)