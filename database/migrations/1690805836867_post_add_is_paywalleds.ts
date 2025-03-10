import { BaseSchema } from '@adonisjs/lucid/schema'
import PaywallTypes from '#enums/paywall_types'

export default class extends BaseSchema {
  protected tableName = 'posts'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('paywall_type_id').unsigned().notNullable().defaultTo(PaywallTypes.NONE)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('paywall_type_id')
    })
  }
}
