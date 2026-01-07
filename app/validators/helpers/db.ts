import { Database } from '@adonisjs/lucid/database'
import { FieldContext } from '@vinejs/vine/types'

type DbOptions = {
  caseInsensitive: boolean
}

const query = (db: Database, table: string, column: string, value: string, options?: DbOptions) => {
  return db
    .from(table)
    .select('id')
    .if(
      options?.caseInsensitive,
      (truthy) => truthy.whereILike(column, value),
      (falsy) => falsy.where(column, value)
    )
}

export const exists = (table: string, column: string, options?: DbOptions) => {
  return async (db: Database, value: string, _field: FieldContext) => {
    const result = await query(db, table, column, value, options)
    return !!result.length
  }
}

export const unique = (table: string, column: string, options?: DbOptions) => {
  return async (db: Database, value: string, _field: FieldContext) => {
    const result = await query(db, table, column, value, options)
    return result.length ? false : true
  }
}
