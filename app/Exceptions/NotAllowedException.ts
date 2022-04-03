import { Exception } from '@poppinss/utils';

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new NotAllowedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotAllowedException extends Exception {
  constructor(message: string) {
    super(message, 403, 'E_NOT_ALLOWED_EXCEPTION');
  }
}
