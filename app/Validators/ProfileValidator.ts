import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

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
    name: schema.string.optional([rules.trim(), rules.minLength(2), rules.maxLength(75)]),
    biography: schema.string.optional([rules.trim()]),
    location: schema.string.optional([rules.trim(), rules.maxLength(255)]),
    website: schema.string.optional([rules.trim(), rules.url(), rules.normalizeUrl(), rules.maxLength(255)]),
    company: schema.string.optional([rules.trim(), rules.maxLength(255)]),
    twitterUrl: schema.string.optional([rules.trim(), rules.url({ allowedHosts: ['twitter.com'] }), rules.normalizeUrl(), rules.maxLength(255)]),
    githubUrl: schema.string.optional([rules.trim(), rules.url({ allowedHosts: ['github.com'] }), rules.normalizeUrl(), rules.maxLength(255)]),
    youtubeUrl: schema.string.optional([rules.trim(), rules.url({ allowedHosts: ['youtube.com'] }), rules.normalizeUrl(), rules.maxLength(255)]),
    facebookUrl: schema.string.optional([rules.trim(), rules.url({ allowedHosts: ['facebook.com'] }), rules.normalizeUrl(), rules.maxLength(255)]),
    instagramUrl: schema.string.optional([rules.trim(), rules.url({ allowedHosts: ['instagram.com'] }), rules.normalizeUrl(), rules.maxLength(255)]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
