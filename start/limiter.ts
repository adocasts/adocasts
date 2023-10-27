/*
|--------------------------------------------------------------------------
| Define HTTP rate limiters
|--------------------------------------------------------------------------
|
| The "Limiter.define" method callback receives an instance of the HTTP
| context you can use to customize the allowed requests and duration
| based upon the user of the request.
|
*/

import { Limiter } from '@adonisjs/limiter/build/services'
import SessionLogService from 'App/Services/SessionLogService'
import isbot from 'isbot'

export const { httpLimiters } = Limiter
  .define('global', ({ auth, request, response }) => {
    if (auth.user) return Limiter.noLimit()
    if (isbot(request.header('user-agent'))) return Limiter.noLimit()

    const sessionLogService = new SessionLogService(request, response)
    
    return Limiter
      .allowRequests(100)
      .every('1 min')
      .usingKey(sessionLogService.ipAddress)
  })
  .define('api', ({ auth, request, response }) => {
    if (auth.user) return Limiter.noLimit()

    const sessionLogService = new SessionLogService(request, response)

    return Limiter
      .allowRequests(150)
      .every('1 min')
      .usingKey(sessionLogService.ipAddress)
  })
