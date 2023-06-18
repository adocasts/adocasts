import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name', 75).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }
}
