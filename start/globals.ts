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

View.global('appUrl', (path) => {
  return 'http://localhost:3333' + path
})

View.global('routePost', (post: Post, params: { [x: string]: any }, options: { [x: string]: any }) => {
  switch(post.postTypeId) {
    case PostType.LESSON:
      return Route.makeUrl('lessons.show', params, options)
    case PostType.BLOG:
      return Route.makeUrl('posts.show', params, options)
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

View.global('GA_PROPERTY', Env.get('GA_PROPERTY'))

View.global('DateTime', DateTime)
View.global('StateEnum', States)
View.global('StateEnumDesc', StateDesc)
View.global('StatusEnum', Status)
View.global('StatusEnumDesc', StatusDesc)
View.global('CollectionTypeEnum', CollectionType)
View.global('CollectionTypeEnumDesc', CollectionTypeDesc)
View.global('PostTypeEnum', PostType)
View.global('PostTypeEnumDesc', PostTypeDesc)
View.global('Roles', Roles)
