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
| new NotImplementedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotFoundException extends Exception {
  constructor(message: string = 'The requested resource was not found') {
    super(message, { status: HttpStatus.NOT_FOUND, code: 'E_NOT_FOUND' })
  }
}
