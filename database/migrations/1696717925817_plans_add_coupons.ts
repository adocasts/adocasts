import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('coupon_code').nullable()
      table.integer('coupon_discount_fixed').nullable()
      table.integer('coupon_discount_percent', 2).nullable()
      table.timestamp('coupon_start_at').nullable()
      table.timestamp('coupon_end_at').nullable()
      table.integer('coupon_duration_id').nullable()
      table.string('stripe_coupon_id').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('coupon_code')
      table.dropColumn('coupon_discount_fixed')
      table.dropColumn('coupon_discount_percent')
      table.dropColumn('coupon_start_at')
      table.dropColumn('coupon_end_at')
      table.dropColumn('coupon_duration_id')
      table.dropColumn('stripe_coupon_id')
    })
  }
}
