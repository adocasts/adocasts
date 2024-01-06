import { BaseModel, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'
import { LucidModel } from '@adonisjs/lucid/types/model'

export default class CamelCaseNamingStrategy extends SnakeCaseNamingStrategy {
  serializedName(_model: typeof BaseModel, propertyName: string) {
    return string.camelCase(propertyName)
  }

  /**
   * Pivot table name for many to many relationship
   */
  relationPivotTable(_: 'manyToMany', model: LucidModel, relatedModel: LucidModel): string {
    return string.snakeCase([relatedModel.name, string.pluralize(model.name)].sort().join('_'))
  }
}

