import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TaxonomyValidator {
  constructor(protected ctx: HttpContextContract) {
    const body = ctx.request.body()

		if (body.assetIds && body.assetIds.length) {
			body.assetId = body.assetIds[0]
		}

		ctx.request.updateBody(body)
  }

  get slugUniqueConstraint() {
    return !this.ctx.params.id ? {} : {
      whereNot: { id: this.ctx.params.id }
    }
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
    rootParentId: schema.number.nullableAndOptional([rules.exists({ table: 'taxonomies', column: 'id' })]),
    parentId: schema.number.nullableAndOptional([rules.exists({ table: 'taxonomies', column: 'id' })]),
    name: schema.string({ trim: true }, [rules.maxLength(100)]),
    slug: schema.string.optional({}, [rules.maxLength(150), rules.unique({
      table: 'taxonomies',
      column: 'slug',
      ...this.slugUniqueConstraint
    })]),
    isFeatured: schema.boolean.optional(),
    assetId: schema.number.optional([rules.exists({ table: 'assets', column: 'id' })]),
    pageTitle: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    metaDescription: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    postIds: schema.array.optional().members(schema.number([rules.exists({ table: 'posts', column: 'id' })])),
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
  public messages = {}
}
