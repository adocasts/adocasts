import HttpStatus from '#core/enums/http_statuses'
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
export default class ForbiddenException extends Exception {
  constructor(message: string = 'Request was forbidden.') {
    super(message, { status: HttpStatus.FORBIDDEN, code: 'E_FORBIDDEN' })
  }
}
