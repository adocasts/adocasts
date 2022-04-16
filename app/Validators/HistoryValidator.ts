import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from './BaseValidator'

export default class HistoryValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    postId: schema.number.optional([rules.requiredIfNotExistsAll(['collectionId', 'taxonomyId'])]),
    collectionId: schema.number.optional([rules.requiredIfNotExistsAll(['postId', 'taxonomyId'])]),
    taxonomyId: schema.number.optional([rules.requiredIfNotExistsAll(['collectionId', 'postId'])]),
    route: schema.string({ trim: true }),
    readPercent: schema.number.optional([rules.unsigned()]),
    watchPercent: schema.number.optional([rules.unsigned()]),
    watchSeconds: schema.number.optional([rules.unsigned()]),
    isCompleted: schema.boolean.optional()
  })
}
