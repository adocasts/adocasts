import BaseModelDto, { StaticModelDto } from '#dtos/base_model_dto'
import is from '@adonisjs/core/helpers/is'
import stringHelpers from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { StrictValues } from '@adonisjs/lucid/types/querybuilder'

export default class BaseBuilder<Model extends LucidModel, Row extends LucidRow> {
  qthen:
    | (<TResult1 = Row[], TResult2 = never>(
        onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
      ) => Promise<TResult1 | TResult2>)
    | null = null

  exec: (() => Promise<Row[]>) | null = null

  #beforeQuery: Map<string, ((query: ModelQueryBuilderContract<Model, Row>) => void)[]> = new Map()

  query: ModelQueryBuilderContract<Model, Row>

  constructor(protected model: Model) {
    const query = model.query<Model, Row>()
    this.qthen = query.then.bind(query)
    this.exec = query.exec.bind(query)
    query.then = this.then.bind(this)
    query.exec = this.then.bind(this)
    this.query = query
  }

  if(condition: any, cbTrue: (self: this) => this, cbFalse?: (self: this) => this) {
    if (condition) {
      return cbTrue(this)
    } else if (cbFalse) {
      return cbFalse(this)
    }
    return this
  }

  where(obj: Record<string, any>): this
  where(column: string, value: any): this
  where(column: string, operator: string, value: any): this
  where(columnOrObj: Record<string, any> | string, operatorOrValue?: any, value?: any): this {
    if (is.object(columnOrObj)) {
      this.query.where(columnOrObj)
      return this
    }

    if (value !== undefined) {
      this.query.where(columnOrObj, operatorOrValue, value)
      return this
    }

    this.query.where(columnOrObj, operatorOrValue)
    return this
  }

  whereIn(column: string, values: StrictValues[]) {
    this.query.whereIn(column, values)
    return this
  }

  whereNull(column: string) {
    this.query.whereNull(column)
    return this
  }

  whereNotNull(column: string) {
    this.query.whereNotNull(column)
    return this
  }

  limit(limit: number) {
    this.query.limit(limit)
    return this
  }

  first() {
    return this.query.first()
  }

  firstOrFail(): Promise<Row>
  firstOrFail<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>): Promise<Dto>
  firstOrFail<Dto extends BaseModelDto>(dto?: StaticModelDto<Dto>): Promise<Row | Dto> {
    if (!dto) return this.query.firstOrFail()

    this.query.selectDto(dto)

    return this.query.firstOrFail().then((row) => dto.fromModel(row)!)
  }

  exclude(values: any[], column: string = 'id') {
    this.query.whereNotIn(column, values)
    return this
  }

  clearOrder() {
    this.query.clearOrder()
    return this
  }

  orderBy(column: string, direction: 'asc' | 'desc' = 'asc') {
    this.query.orderBy(column, direction)
    return this
  }

  async paginate(page: number, perPage?: number | undefined, url: string | undefined = undefined) {
    const result = await this.query.paginate(page, perPage)

    if (url) result.baseUrl(url)

    return result
  }

  async count(column: string = '*') {
    const result = await this.query.count(column, 'total').first()
    return Number(result?.$extras.total) ?? 0
  }

  async sum(column: string) {
    const result = await this.query.sum(column, 'sum').first()
    return Number(result?.$extras.sum) ?? 0
  }

  select(...columns: any[]) {
    this.query.select(...columns)
    return this
  }

  selectDto<Dto extends BaseModelDto>(dto: StaticModelDto<Dto>) {
    this.query.selectDto(dto)
    return this
  }

  beforeQuery(
    cb: (query: ModelQueryBuilderContract<Model, Row>) => void,
    name: string = stringHelpers.random(4)
  ) {
    this.#beforeQuery.set(name, [cb])
    return this
  }

  removeBeforeQuery(name: string) {
    this.#beforeQuery.delete(name)
    return this
  }

  async dto<T extends BaseModelDto>(dto: StaticModelDto<T>) {
    return this.query.dto(dto)
  }

  then<TResult1 = Row[], TResult2 = never>(
    onfulfilled?: ((value: Row[]) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    // onfulfilled?: ((value: Row[]) => Row[] | PromiseLike<Row[]>) | null | undefined,
    // onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    this.#beforeQuery.values().forEach((cbs) => cbs.forEach((cb) => cb(this.query)))
    return this.exec!().then(onfulfilled, onrejected)
  }
}
