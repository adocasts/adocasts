import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CollectionValidator {
  constructor (protected ctx: HttpContextContract) {
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

  public schema = schema.create({
		name: schema.string({ trim: true }, [rules.maxLength(100)]),
		slug: schema.string.optional({}, [rules.maxLength(150), rules.unique({
			table: 'collections',
			column: 'slug',
			...this.slugUniqueConstraint
		})]),
		collectionTypeId: schema.number(),
		statusId: schema.number(),
		stateId: schema.number(),
		assetId: schema.number.optional([rules.exists({ table: 'assets', column: 'id' })]),
		pageTitle: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
		description: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
		metaDescription: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    youtubePlaylistUrl: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    repositoryUrl: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    isFeatured: schema.boolean.optional(),
		postIds: schema.array.optional().members(schema.number([rules.exists({ table: 'posts', column: 'id' })])),
		subcollectionCollectionIds: schema.array.optional().members(
			schema.number([rules.exists({ table: 'collections', column: 'id' })])
		),
    subcollectionCollectionNames: schema.array.optional().members(
      schema.string({ trim: true }, [rules.maxLength((100))])
    ),
		subcollectionPostIds: schema.array.optional().members(
			schema.array.optional().members(
				schema.number([rules.exists({ table: 'posts', column: 'id' })])
			)
		)
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
