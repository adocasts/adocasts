import stringHelpers from '@adonisjs/core/helpers/string'
import { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { StrictValues } from '@adonisjs/lucid/types/querybuilder'
import BaseModelDto, { StaticModelDto } from '../dtos/base_model_dto.js'

export default class BaseBuilder<Model extends LucidModel, Record extends LucidRow> {
  qthen:
    | (<TResult1 = Record[], TResult2 = never>(
        onfulfilled?: ((value: Record[]) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
      ) => Promise<TResult1 | TResult2>)
    | null = null

  exec: (() => Promise<Record[]>) | null = null

  #beforeQuery: Map<string, ((query: ModelQueryBuilderContract<Model, Record>) => void)[]> =
    new Map()

  query: ModelQueryBuilderContract<Model, Record>

  constructor(protected model: Model) {
    const query = model.query<Model, Record>()
    this.qthen = query.then.bind(query)
    this.exec = query.exec.bind(query)
    query.then = this.then.bind(this)
    query.exec = this.then.bind(this)
    this.query = query
  }

  if(condition: any, cb: (self: this) => this) {
    if (condition) {
      return cb(this)
    }
    return this
  }

  where(column: string, operator?: any, value?: any) {
    if (value !== undefined) {
      this.query.where(column, operator, value)
      return this
    }

    this.query.where(column, operator)
    return this
  }

  whereIn(column: string, values: StrictValues[]) {
    this.query.whereIn(column, values)
    return this
  }

  limit(limit: number) {
    this.query.limit(limit)
    return this
  }

  first() {
    return this.query.first()
  }

  firstOrFail() {
    return this.query.firstOrFail()
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
    return result?.$extras.total ?? 0
  }

  async sum(column: string) {
    const result = await this.query.sum(column, 'sum').first()
    return result?.$extras.sum ?? 0
  }

  select(...columns: any[]) {
    this.query.select(...columns)
    return this
  }

  beforeQuery(
    cb: (query: ModelQueryBuilderContract<Model, Record>) => void,
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

  then<TResult1 = Record[], TResult2 = never>(
    onfulfilled?: ((value: Record[]) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    // onfulfilled?: ((value: Record[]) => Record[] | PromiseLike<Record[]>) | null | undefined,
    // onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    this.#beforeQuery.values().forEach((cbs) => cbs.forEach((cb) => cb(this.query)))
    return this.exec!().then(onfulfilled, onrejected)
  }
}
