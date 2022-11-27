import { Exception } from '@adonisjs/core/build/standalone'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new InvalidException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class InvalidException extends Exception {
  constructor(message: string) {
    super(message, 400, 'E_VALIDATION_FAILURE');
  }
}
