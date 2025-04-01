import { LucidRow } from '@adonisjs/lucid/types/model'
import BaseModelDto, { StaticModelDto } from '#core/dtos/base_model_dto'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    dto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): Promise<Dto[]>
    selectDto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): this
  }
}

declare module '@adonisjs/lucid/types/model' {
  interface ModelQueryBuilderContract<Model extends LucidModel> {
    dto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): Promise<Dto[]>
    selectDto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): this
  }
}

ModelQueryBuilder.macro('dto', async function <
  Dto extends BaseModelDto,
  Row extends LucidRow,
>(this: ModelQueryBuilder, dto: StaticModelDto<Dto>) {
  const records = (await this.select(dto.getSelectable()).exec()) as Row[]
  return records.map((record) => new dto(record)) as Dto[]
})

ModelQueryBuilder.macro('selectDto', function <
  Dto extends BaseModelDto,
>(this: ModelQueryBuilder, dto: StaticModelDto<Dto>) {
  return this.select(dto.getSelectable())
})
