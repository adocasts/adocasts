import BaseModelDto, { StaticModelDto } from '#dtos/base_model_dto'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { LucidRow } from '@adonisjs/lucid/types/model'

declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder {
    dto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): Promise<Dto[]>
    selectDto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): this
    getCount(): Promise<BigInt>
    getSum(column: string): Promise<BigInt>
    pluck<T>(column: string): Promise<T[]>
  }
}

declare module '@adonisjs/lucid/types/model' {
  interface ModelQueryBuilderContract<Model extends LucidModel> {
    dto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): Promise<Dto[]>
    selectDto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): this
    getCount(): Promise<BigInt>
    getSum(column: string): Promise<BigInt>
    pluck<T>(column: string): Promise<T[]>
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

ModelQueryBuilder.macro('getCount', async function (this: ModelQueryBuilder) {
  return this.count('* as total')
    .first()
    .then((res: LucidRow) => res.$extras.total)
})

ModelQueryBuilder.macro('getSum', async function (this: ModelQueryBuilder, column: string) {
  return this.sum(column)
    .as('sum')
    .first()
    .then((res: LucidRow) => res.$extras.sum)
})

ModelQueryBuilder.macro('pluck', function (this: ModelQueryBuilder, column: string) {
  if (!['count', 'avg', 'sum'].includes(column)) {
    this.select(column)
  }

  return this.pojo().then((res: any) => {
    return res.map((row: any) => row[column])
  })
})
