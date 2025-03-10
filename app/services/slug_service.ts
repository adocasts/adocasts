import HttpStatus from '#enums/http_statuses'
import { Exception } from '@adonisjs/core/exceptions'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'
import { LucidModel } from '@adonisjs/lucid/types/model'

/**
 * Slug service
 * Source: Class abstraction of adonisjs/lucid-slugify package
 * Purpose: written before it was migrated for v6
 */

//#region Types

export type SlugifyConfig = {
  strategy: keyof StrategiesList | SlugifyStrategyContract
  fields: string[]
  maxLength?: number
  completeWords?: boolean
  allowUpdates?: boolean
  separator?: string
  transformer?: (value: any) => string
} & Record<string, any>

/**
 * The interface every strategy must adhere to
 */
export interface SlugifyStrategyContract {
  /**
   * Make slug for a given field and value
   */
  makeSlug(model: LucidModel, field: string, value: string): string

  /**
   * Make the slug created by the "makeSlug" method unique.
   */
  makeSlugUnique(model: LucidModel, field: string, value: string): Promise<string> | string
}

/**
 * We do not define these in the user land code. Because renaming the
 * key inside the following interface doesn't translate that change
 * to runtime.
 *
 * In other words the strategies names are fixed and we use this interface
 * to allow other packages to add custom strategies
 */
export interface StrategiesList {
  simple: SlugifyStrategyContract
  dbIncrement: SlugifyStrategyContract
  shortId: SlugifyStrategyContract
}

//#endregion

//#region SimpleStrategy

class SimpleStrategy {
  protected maxLengthBuffer = 0
  declare separator

  constructor(private config: SlugifyConfig) {
    this.separator = config.separator || '-'
  }

  /**
   * Makes the slug out the value string
   */
  makeSlug(_: LucidModel, __: string, value: string) {
    let baseSlug = string.slug(value, { replacement: this.separator, lower: true, strict: true })

    /**
     * Limit to defined characters
     */
    if (this.config.maxLength) {
      baseSlug = string.truncate(baseSlug, this.config.maxLength - this.maxLengthBuffer, {
        completeWords: this.config.completeWords,
        suffix: '',
      })
    }

    return baseSlug
  }

  /**
   * Returns the slug as it is
   */
  async makeSlugUnique(_: LucidModel, __: string, slug: string) {
    return slug
  }
}

//#endregion

export default class SlugService<Model extends LucidModel> extends SimpleStrategy {
  private counterName = 'lucid_slugify_counter'

  constructor(config: SlugifyConfig) {
    super(config)
  }

  /**
   * Makes the slug by inspecting multiple similar rows in JavaScript
   */
  private makeSlugFromMultipleRows(
    slug: string,
    field: Extract<keyof InstanceType<Model>, string>,
    rows: InstanceType<Model>[]
  ) {
    /**
     * No matching rows found and hence no counter is required
     */
    if (!rows.length) {
      return slug
    }

    /**
     * Find the rows that already has a counter
     */
    const slugs = rows.reduce<number[]>((result, row) => {
      const value = row[field] as string
      const tokens = value.toLowerCase().split(`${slug}${this.separator}`)
      if (tokens.length === 2) {
        const counter = Number(tokens[1])
        if (!Number.isNaN(counter)) {
          result = result.concat(counter)
        }
      }
      return result
    }, [])

    /**
     * If no rows with counter found, use "1" as the counter
     */
    if (!slugs.length) {
      return `${slug}${this.separator}1`
    }

    /**
     * Find the max counter and plus 1 to it
     */
    return `${slug}${this.separator}${Math.max(...slugs) + 1}`
  }

  /**
   * Makes the slug unique by using the runtime slug counter field
   */
  private makeSlugFromCounter(slug: string, rows: InstanceType<Model>[]) {
    /**
     * No matching rows found. Consider the slug as it is
     */
    if (!rows.length) {
      return slug
    }

    /**
     * First row has the counter and hence consider it
     */
    let counter = rows[0].$extras[this.counterName]
    if (counter) {
      return `${slug}${this.separator}${counter + 1}`
    }

    /**
     * Second row has the counter and hence consider it
     */
    if (rows[1]) {
      counter = rows[1].$extras[this.counterName]
      return `${slug}${this.separator}${counter + 1}`
    }

    return `${slug}${this.separator}1`
  }

  /**
   * Returns the slug for sqlite
   */
  private async getSlugForSqlite(
    model: Model,
    field: Extract<keyof InstanceType<Model>, string>,
    columnName: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(field)
      // raw where clause should using the column name
      .whereRaw('lower(??) = ?', [columnName, slug])
      .orWhereRaw('lower(??) like ?', [columnName, `${slug}${this.separator}%`])

    return this.makeSlugFromMultipleRows(slug, field, rows)
  }

  /**
   * Returns the slug for MYSQL < 8.0
   */
  private async getSlugForOldMysql(
    model: Model,
    field: Extract<keyof InstanceType<Model>, string>,
    columnName: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(field)
      .where(field, slug)
      // raw where clause should using the column name
      .orWhereRaw(`?? REGEXP ?`, [columnName, `^${slug}(${this.separator}[0-9]*)?$`])

    return this.makeSlugFromMultipleRows(slug, field, rows)
  }

  /**
   * Returns the slug for MYSQL >= 8.0
   */
  private async getSlugForMysql(
    model: Model,
    _: Extract<keyof InstanceType<Model>, string>,
    columnName: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(
        db.raw(`CAST(REGEXP_SUBSTR(${columnName}, '[0-9]+$') AS UNSIGNED) as ${this.counterName}`)
      )
      .whereRaw(`?? REGEXP ?`, [columnName, `^${slug}(${this.separator}[0-9]*)?$`])
      .orderBy(this.counterName, 'desc')

    return this.makeSlugFromCounter(slug, rows)
  }

  /**
   * Returns the slug for mssql. With MSSQL it maybe is possible to use the
   * T-SQL with Patindex to narrow down the search query. But for now
   * I want to save time and not concern myself much with learning
   * T-SQL.
   *
   * If you use MSSQL and concerned with performance. Please take out time and
   * help improve the MSSQL query
   */
  private async getSlugForMssql(
    model: Model,
    field: Extract<keyof InstanceType<Model>, string>,
    _: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(field)
      .where(field, slug)
      .orWhere(field, 'like', `${slug}${this.separator}%`)

    return this.makeSlugFromMultipleRows(slug, field, rows)
  }

  /**
   * Makes slug for PostgreSQL and redshift both. Redshift is not tested and
   * assumed to be compatible with PG.
   */
  private async getSlugForPg(
    model: Model,
    _: Extract<keyof InstanceType<Model>, string>,
    columnName: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(db.raw(`SUBSTRING(${columnName} from '[0-9]+$')::INTEGER as ${this.counterName}`))
      .whereRaw(`?? ~* ?`, [columnName, `^${slug}(${this.separator}[0-9]*)?$`])
      .orderBy(this.counterName, 'desc')

    return this.makeSlugFromCounter(slug, rows)
  }

  /**
   * Makes slug for Oracle. Oracle is not tested
   */
  private async getSlugForOracle(
    model: Model,
    _: Extract<keyof InstanceType<Model>, string>,
    columnName: string,
    slug: string
  ) {
    const rows = await model
      .query()
      .select(db.raw(`TO_NUMBER(REGEXP_SUBSTR(${columnName}, '[0-9]+$')) as ${this.counterName}`))
      .whereRaw(`REGEXP_LIKE(??, ?)`, [columnName, `^${slug}(${this.separator}[0-9]*)?$`])
      .orderBy(this.counterName, 'desc')

    return this.makeSlugFromCounter(slug, rows)
  }

  /**
   * Converts an existing slug to a unique slug by inspecting the database
   */
  async make(model: Model, field: Extract<keyof InstanceType<Model>, string>, slug: string) {
    model.boot()

    const column = model.$columnsDefinitions.get(field)!
    const dialect = model.$adapter.modelConstructorClient(model).dialect
    const columnName = column.columnName
    const dialectName = dialect.name
    const dialectVersion = Number(dialect.version)

    slug = this.makeSlug(model, field, slug)

    switch (dialectName) {
      case 'postgres':
      case 'redshift':
        return this.getSlugForPg(model, field, columnName, slug)
      case 'sqlite3':
        return this.getSlugForSqlite(model, field, columnName, slug)
      case 'mysql':
        return dialectVersion < 8
          ? this.getSlugForOldMysql(model, field, columnName, slug)
          : this.getSlugForMysql(model, field, columnName, slug)
      case 'mssql':
        return this.getSlugForMssql(model, field, columnName, slug)
      case 'oracledb':
        return this.getSlugForOracle(model, field, columnName, slug)
      default:
        throw new Exception(
          `"${dialectName}" database is not supported for the dbIncrement strategy`,
          {
            code: 'E_UNSUPPORTED_DBINCREMENT_DIALECT',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          }
        )
    }
  }
}
