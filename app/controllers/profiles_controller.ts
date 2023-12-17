import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { chain } from 'mathjs'
import ProfileActivityService from '#services/profile_activity_service';

export default class ProfilesController {
  
  @inject()
  async show({ view, response, params, session, auth }: HttpContext, activityService: ProfileActivityService) {
    const username = params.username.replace(/^@/, '')
    const user = await User.query()
      .whereILike('username', username)
      .preload('profile')
      .firstOrFail()

    if (!user.isEnabledProfile && auth.user?.id !== user.id) {
      session.flash('warning', 'The requested profile is currently set to private.')
      return response.redirect('/')
    }

    const completedLessonsCount = parseInt((await user.related('completedPosts').query().count('*', 'total').first())?.$extras.total ?? 0)
    const commentCount = parseInt((await user.related('comments').query().count('*', 'total').first())?.$extras.total ?? 0)
    const secondsWatchedSum = parseInt((await user.related('watchedPosts').query().sum('watch_seconds', 'sum').first())?.$extras.sum ?? 0)
    const hoursWatchedSum = chain(secondsWatchedSum).divide(3600).done()
    
    const activity = await activityService.get(user)

    return view.render('pages/profiles/show', { user, activity, completedLessonsCount, commentCount, hoursWatchedSum })
  }
  
  async update({}: HttpContext) {}
  
}