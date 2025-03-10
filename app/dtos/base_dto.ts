import { BaseModelDto as AdoBaseModelDto } from '@adocasts.com/dto/base'
import { StaticDto } from '@adocasts.com/dto/types'
import { LucidModel } from '@adonisjs/lucid/types/model'

export default class BaseModelDto extends AdoBaseModelDto {
  static model: () => LucidModel

  static fromModel<SourceObject, Dto extends AdoBaseModelDto>(
    this: StaticDto<SourceObject, Dto>,
    row?: SourceObject
  ) {
    if (!row) return null
    return new this(row)
  }

  static getSelectable() {
    const model = this.model()
    const properties = this.describeModel(this)
    return properties.filter((property) => model.$hasColumn(property))
  }

  private static describeModel(cls: any) {
    const instance = new cls({})
    return Object.getOwnPropertyNames(instance)
  }
}
