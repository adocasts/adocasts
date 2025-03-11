import { BaseModelDto as AdoBaseModelDto } from '@adocasts.com/dto/base'
import { StaticDto } from '@adocasts.com/dto/types'
import { Exception } from '@adonisjs/core/exceptions'
import { LucidModel, LucidRow } from '@adonisjs/lucid/types/model'

export type StaticBaseModelDto<Model, Dto extends BaseModelDto> = {
  new (model: Model): Dto
}

export default class BaseModelDto extends AdoBaseModelDto {
  constructor(_row?: LucidRow) {
    super()
  }

  static model: LucidModel | null

  static fromModel<SourceObject, Dto extends AdoBaseModelDto>(
    this: StaticDto<SourceObject, Dto>,
    row?: SourceObject
  ) {
    if (!row) return null
    return new this(row)
  }

  static getSelectable() {
    if (!this.model) {
      throw new Exception(`Model not set for ${this.name}`)
    }

    const model = this.model
    const properties = this.describeModel(this)
    return properties.filter((property) => model.$hasColumn(property))
  }

  private static describeModel(cls: any) {
    const instance = new cls({})
    return Object.getOwnPropertyNames(instance)
  }
}
