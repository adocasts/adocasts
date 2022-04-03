import HttpContext, { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TypedSchema, RequestValidatorNode, ParsedTypedSchema } from '@ioc:Adonis/Core/Validator';

/**
 * BaseHttpService
 * Provides the HttpContext and Http-related utilities for Http-based services
 */
export default class BaseHttpService {
  protected ctx: HttpContextContract

  constructor () {
    this.ctx = HttpContext.getOrFail()
  }

  get user() {
    return this.ctx.auth.user
  }

  get isAuthenticated() {
    return !!this.user
  }

  public async validate(schema: RequestValidatorNode<ParsedTypedSchema<TypedSchema>>, nullableFields: Array<string> = []) {
    const nullableData = this.ctx.request.only(nullableFields)
    const validatedData = await this.ctx.request.validate(schema)
    return {
      ...nullableData,
      ...validatedData
    }
  }

  public async validateData<T>(ValidatorClass: new(HttpContextContract: HttpContextContract) => { schema: any, messages: any }, data: Partial<T>, nullableFields: Array<string> = []) {
    const v = new ValidatorClass(this.ctx)
    const keys = Object.keys(data)
    const nullableData = nullableFields.reduce((data, curr) => ({ ...data, ...(keys.includes(curr) ? { [curr]: data[curr] } : {}) }), {})
    const validatedData = await this.ctx.request.validate({
      schema: v.schema,
      messages: v.messages,
      data
    })

    return {
      ...nullableData,
      ...validatedData
    }
  }
}
