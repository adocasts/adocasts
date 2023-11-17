import { BaseModel, SnakeCaseNamingStrategy } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'

export default class CamelCaseNamingStrategy extends SnakeCaseNamingStrategy {
  public serializedName(_model: typeof BaseModel, propertyName: string) {
    return string.camelCase(propertyName)
  }
}