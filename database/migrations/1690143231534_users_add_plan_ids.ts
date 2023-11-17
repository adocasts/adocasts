import { BaseSchema } from '@adonisjs/lucid/schema'
import Plans from '#enums/plans'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('plan_id').notNullable().defaultTo(Plans.FREE)
      table.dateTime('plan_period_start').nullable()
      table.dateTime('plan_period_end').nullable()
      table.string('stripe_customer_id', 255).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('plan_id')
      table.dropColumn('plan_period_start')
      table.dropColumn('plan_period_end')
      table.dropColumn('stripe_customer_id')
    })
  }
}
