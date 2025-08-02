/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import GetIpAddress from '#actions/general/get_ip_address'
import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

export const throttleComments = limiter.define('comments', (ctx) => {
  return limiter
    .allowRequests(3)
    .every('1 minute')
    .blockFor('15 minutes')
    .usingKey(`comments_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage("You're commenting too quickly. Please wait a bit before posting again")
    )
})

export const throttleCommentsBurst = limiter.define('commentsBurst', (ctx) => {
  return limiter
    .allowRequests(5)
    .every('5 minute')
    .blockFor('15 minutes')
    .usingKey(`comments_burst_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage("You're commenting too quickly. Please wait a bit before posting again")
    )
})

export const throttleDiscussions = limiter.define('discussions', (ctx) => {
  return limiter
    .allowRequests(2)
    .every('10 minutes')
    .blockFor('30 minutes')
    .usingKey(`discussions_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage(
        "You've reached the limit for starting new discussions. Try again in 30 minutes."
      )
    )
})

export const throttleDiscussionsBurst = limiter.define('discussionsBurst', (ctx) => {
  return limiter
    .allowRequests(5)
    .every('1 hour')
    .blockFor('30 minutes')
    .usingKey(`discussions_burst_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage(
        "You've reached the limit for starting new discussions. Try again in 30 minutes."
      )
    )
})

export const throttleImageUpload = limiter.define('imageUpload', (ctx) => {
  return limiter
    .allowRequests(10)
    .every('1 hour')
    .blockFor('1 hour')
    .usingKey(`image_uploads_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage('Too many image uploads. Please wait before uploading more.')
    )
})

export const throttleContactUs = limiter.define('contactUs', (ctx) => {
  if (ctx.auth.user?.id) {
    const isFreeTier = ctx.auth.user.isFreeTier
    return limiter
      .allowRequests(isFreeTier ? 3 : 6)
      .every('1 hour')
      .blockFor('2 hours')
      .usingKey(`contact_us_uid_${ctx.auth.user.id}`)
      .limitExceeded((error) =>
        error.setMessage("You've submitted too many messages. Please wait before sending another.")
      )
  }

  const ip = GetIpAddress.run(ctx.request)

  return limiter
    .allowRequests(3)
    .every('1 hour')
    .blockFor('2 hours')
    .usingKey(`contact_us_ip_${ip}`)
    .limitExceeded((error) =>
      error.setMessage("You've submitted too many messages. Please wait before sending another.")
    )
})

export const throttleSignUp = limiter.define('signUp', (ctx) => {
  const ip = GetIpAddress.run(ctx.request)
  return limiter
    .allowRequests(3)
    .every('1 hour')
    .blockFor('6 hours')
    .usingKey(`sign_up_ip_${ip}`)
    .limitExceeded((error) =>
      error.setMessage("You've created too many accounts. Please wait before creating another.")
    )
})

export const throttleVerifyEmail = limiter.define('verifyEmail', (ctx) => {
  return limiter
    .allowRequests(2)
    .every('1 hour')
    .blockFor('1 day')
    .usingKey(`verify_email_${ctx.auth.user!.id}`)
    .limitExceeded((error) =>
      error.setMessage(
        "You've recently requested an email verification link. Please check your email or try again later."
      )
    )
})
