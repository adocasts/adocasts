import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import PaywallTypes from 'App/Enums/PaywallTypes'

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
