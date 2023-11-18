import States from "#enums/states"
import { ModelQueryBuilder } from "@adonisjs/lucid/orm"

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    wherePublic(): this
  }
}

ModelQueryBuilder.macro('wherePublic', function (this: ModelQueryBuilder) {
  return this.where({ stateId: States.PUBLIC })
})