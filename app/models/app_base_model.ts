import { BaseModel } from '@adonisjs/lucid/orm'
import { ModelAdapterOptions, ModelAssignOptions } from '@adonisjs/lucid/types/model'
import CamelCaseNamingStrategy from '#strategies/camel_case_naming_strategy'

export default class AppBaseModel extends BaseModel {
  static namingStrategy = new CamelCaseNamingStrategy()
  serializeExtras = true

  get meta() {
    return this.$extras
  }

  static async firstOrNewById(
    id: number | undefined = undefined,
    savePayload?: any,
    options?: ModelAssignOptions
  ): Promise<any> {
    const query =
      id !== undefined
        ? this.query(options).where(this.primaryKey, id)
        : this.query(options).whereNull(this.primaryKey)

    const row = await query.first()

    if (!row) {
      return this.newUpWithOptions(
        Object.assign({ [this.primaryKey]: id }, savePayload),
        query.clientOptions,
        options?.allowExtraProperties
      )
    }

    return row
  }

  private static newUpWithOptions(
    payload: any,
    options?: ModelAdapterOptions,
    allowExtraProperties?: boolean
  ) {
    const row = new this()

    row.fill(payload, allowExtraProperties)
    row.$setOptionsAndTrx(options)

    return row
  }
}
