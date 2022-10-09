import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from './BaseValidator'

export default class CollectionValidator extends BaseValidator {
  constructor (protected ctx: HttpContextContract) {
  	super()
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
		outdatedVersionId: schema.number.nullable([rules.exists({ table: 'collections', column: 'id' })]),
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
		),
    taxonomyIds: schema.array.optional().members(schema.number([rules.exists({ table: 'taxonomies', column: 'id' })]))
  })
}
