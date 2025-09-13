import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discussions'

  async up() {
    this.schema.raw('CREATE INDEX idx_discussions_created_at ON discussions (created_at DESC)')
  }

  async down() {
    this.schema.raw('DROP INDEX idx_discussions_created_at')
  }
}
