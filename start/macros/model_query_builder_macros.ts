import States from '#enums/states'
import { ModelQueryBuilder } from "@adonisjs/lucid/orm"

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilderContract {
    wherePublic(): this
    whereTrue(column: string): this
    whereFalse(column: string): this
    getCount(): Promise<BigInt>
  }

  interface ModelQueryBuilder {
    wherePublic(): this
    whereTrue(column: string): this
    whereFalse(column: string): this
    getCount(): Promise<BigInt>
  }
}

ModelQueryBuilder.macro('wherePublic', function (this: ModelQueryBuilder) {
  return this.where({ stateId: States.PUBLIC })
})

ModelQueryBuilder.macro('whereTrue', function (this: ModelQueryBuilder, column: string) {
  return this.where(column, true)
})

ModelQueryBuilder.macro('whereFalse', function (this: ModelQueryBuilder, column: string) {
  return this.where(column, false)
})

ModelQueryBuilder.macro('getCount', async function (this: ModelQueryBuilder) {
  return this.count('* as total').first().then((res: any) => res.$extras.total)
})