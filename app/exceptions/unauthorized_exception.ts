import HttpStatus from '#enums/http_statuses'
import { Exception } from '@adonisjs/core/exceptions'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new UnauthorizedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UnauthorizedException extends Exception {
  constructor(message: string = "You're not authorized to perform this action.") {
    super(message, { status: HttpStatus.UNAUTHORIZED, code: 'E_UNAUTHORIZED' })
  }
}
