import { BaseModel, ModelAdapterOptions, ModelAssignOptions } from "@ioc:Adonis/Lucid/Orm";
import CamelCaseNamingStrategy from "App/Strategies/CamelCaseNamingStrategy";

export default class AppBaseModel extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  public static async firstOrNewById(id: number | undefined = undefined, savePayload?: any, options?: ModelAssignOptions): Promise<any> {
    const query = id !== undefined
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