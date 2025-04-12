import { BaseModelDto as AdoBaseModelDto } from '@adocasts.com/dto/base'
import { StaticDto } from '@adocasts.com/dto/types'
import { Exception } from '@adonisjs/core/exceptions'
import type { LucidModel } from '@adonisjs/lucid/types/model'

function StaticImplements<T>() {
  return (_t: T) => {}
}

export type StaticModelDto<T extends BaseModelDto> = {
  new (record: any): T

  model(): LucidModel | null

  selectExtras: string[]

  fromModel<SourceObject, Dto extends AdoBaseModelDto>(
    this: StaticDto<SourceObject, Dto>,
    row?: SourceObject
  ): Dto | null

  getSelectable(): string[]
}

@StaticImplements<StaticModelDto<any>>()
export default class BaseModelDto extends AdoBaseModelDto {
  static selectExtras: string[] = []

  static model(): LucidModel | null {
    return null
  }

  static fromModel<SourceObject, Dto extends AdoBaseModelDto>(
    this: StaticDto<SourceObject, Dto>,
    row?: SourceObject
  ) {
    if (!row) return null
    return new this(row)
  }

  static getSelectable() {
    const model = this.model()
    const properties = new Set(this.selectExtras)

    if (!model && this.selectExtras.length) {
      return this.selectExtras
    }

    if (!model) {
      throw new Exception(`Model not set for ${this.name}`)
    }

    this.describeModel(this).forEach(properties.add, properties)
    return [...properties].filter((property) => model.$hasColumn(property))
  }

  private static describeModel(cls: any) {
    const instance = new cls({})
    return Object.getOwnPropertyNames(instance)
  }
}
