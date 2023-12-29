import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { chain } from 'mathjs'
import ProfileActivityService from '#services/profile_activity_service';
import { profileUpdateValidator } from '#validators/profile_validator';
import storage from '#services/storage_service';
import Tab from '../view_models/tab.js';
import router from '@adonisjs/core/services/router';
import Discussion from '#models/discussion';
import ActivityVM from '../view_models/activity.js';
import DiscussionService from '#services/discussion_service';

export default class ProfilesController {
  
  @inject()
  async show({ view, request, response, params, session, auth, up }: HttpContext, activityService: ProfileActivityService, discussionService: DiscussionService) {
    const username = params.username.replace(/^@/, '')
    const user = await User.query()
      .whereILike('username', username)
      .preload('profile')
      .firstOrFail()

    if (!user.isEnabledProfile && auth.user?.id !== user.id) {
      session.flash('warning', 'The requested profile is currently set to private.')
      return response.redirect('/')
    }

    const keys = {
      FEED: 'feed',
      ACTIVITY: 'activity'
    }
    let tab = params.tab || keys.FEED
    let tabs = Object.values(keys).map(key => Tab.profile(user.handle, key))

    const completedLessonsCount = parseInt((await user.related('completedPosts').query().count('*', 'total').first())?.$extras.total ?? 0)
    const commentCount = parseInt((await user.related('comments').query().count('*', 'total').first())?.$extras.total ?? 0)
    const secondsWatchedSum = parseInt((await user.related('watchedPosts').query().sum('watch_seconds', 'sum').first())?.$extras.sum ?? 0)
    const hoursWatchedSum = chain(secondsWatchedSum).divide(3600).done()
    
    let feed: Discussion[] = []
    let activity: ActivityVM[] = []

    if (tab === keys.FEED) {
      feed = await discussionService.getUserPaginated(user.id, request.qs())
    }

    if (tab === keys.ACTIVITY || (!feed.length && !params.tab)) {
      activity = await activityService.get(user)
      tab = keys.ACTIVITY
    }

    const tabIndex = tabs.findIndex(_tab => _tab.key === tab)

    up.setLocation(router.makeUrl('profiles.show', { username: user.handle, tab }))

    return view.render('pages/profiles/show', { 
      user, 
      tab,
      tabs,
      tabIndex,
      feed,
      activity, 
      completedLessonsCount, 
      commentCount, 
      hoursWatchedSum 
    })
  }
  
  async update({ request, response, auth, session, up }: HttpContext) {
    const { avatar, ...data } = await request.validateUsing(profileUpdateValidator)

    if (avatar) {
      const avatarUrl = auth.user!.avatarUrl
      const location = `${auth.user!.id}/profile/`
      const filename = `avatar_${new Date().getTime()}.${avatar.extname}`
      
      // upload and set new avatar
      await storage.storeFromTmp(location, filename, avatar)
      await auth.user!.merge({ avatarUrl: location + filename }).save()

      // remove old if we were hosting it (wouldn't start with https if we were)
      if (avatarUrl && !avatarUrl.startsWith('https') && avatarUrl !== (location + filename)) {
        console.log({ avatarUrl, newUrl: location + filename })
        await storage.destroy(avatarUrl)
      }

      // tell unpoly to update the header so their avatar updates
      up.setTarget('[up-main], [up-header]')
    }
    
    await auth.user!.related('profile').query().update(data)

    session.flash('success', 'Your profile has been successfully updated')
    
    return response.redirect().back()
  }
  
}