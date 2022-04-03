import { BaseModel, LucidModel, SnakeCaseNamingStrategy } from '@ioc:Adonis/Lucid/Orm'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class CamelCaseNamingStrategy extends SnakeCaseNamingStrategy {
  public serializedName(_model: typeof BaseModel, propertyName: string) {
    return string.camelCase(propertyName)
  }

  public relationPivotTable(_relation: 'manyToMany', model: LucidModel, relatedModel: LucidModel, _relationName: string): string {
      return string.snakeCase([relatedModel.name, string.pluralize(model.name)].sort().join('_'))
  }
}