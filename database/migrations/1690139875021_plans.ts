import { BaseSchema } from '@adonisjs/lucid/schema'
import Plans from '#enums/plans'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'plans'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('slug', 200).notNullable().unique()
      table.string('name', 100).notNullable()
      table.string('description').nullable()
      table.string('stripe_price_id').nullable()
      table.string('stripe_price_test_id').nullable()
      table.integer('price').notNullable().defaultTo(0)
      table.boolean('is_active').notNullable().defaultTo(true)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([{
        id: Plans.FREE,
        slug: 'free',
        name: 'Free Plan',
        description: "Free, limited, access to Adocasts content with ads.",
        price: 0,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL()
      }, {
        id: Plans.PLUS_MONTHLY,
        slug: 'plus-monthly',
        name: 'Plus Plan (Monthly)',
        description: "Gain access to all Adocasts content, ad free",
        stripe_price_id: 'price_1NwSjRFPw3xO2XBhWexLbwFM',
        stripe_price_test_id: 'price_1Nzon4FPw3xO2XBhZe5ETPF7',
        price: 8 * 100,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL()
      }, {
        id: Plans.PLUS_ANNUAL,
        slug: 'plus-annually',
        name: 'Plus Plan (Annually)',
        description: "Gain access to all Adocasts content, ad free",
        stripe_price_id: 'price_1LbNpsFPw3xO2XBha1ujKpLA',
        stripe_price_test_id: 'price_1NzooOFPw3xO2XBhDO2K7tfb',
        price: 80 * 100,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL()
      }, {
        id: Plans.FOREVER,
        slug: 'forever',
        name: 'Forever Plan',
        description: "Gain access to all Adocasts content, ad free, forever!",
        stripe_price_id: 'price_1M72t2FPw3xO2XBhPBIYkUuL',
        stripe_price_test_id: 'price_1M73ErFPw3xO2XBhi82Ouuml',
        price: 285 * 100,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL()
      }])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
