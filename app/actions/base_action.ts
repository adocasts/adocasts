import ForbiddenException from '#exceptions/forbidden_exception'
import NotImplementedException from '#exceptions/not_implemented_exception'
import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import { RequestValidationOptions } from '@adonisjs/core/types/http'
import { VineValidator } from '@vinejs/vine'

interface StaticAction<T> {
  new (): T
}

export interface BaseActionable {
  handle?(...args: any[]): any
  asController?(ctx: HttpContext, data?: unknown, ...args: any[]): Promise<any>
  asListener?(...args: any[]): Promise<any>
  authorize?(ctx: HttpContext): Promise<any> | any
  validator?: VineValidator<any, any>
  validatorOptions?: RequestValidationOptions<any>
}

export interface Actionable extends BaseActionable {}

export default abstract class BaseAction<HandleArgs extends any[] = []> implements BaseActionable {
  asController?(ctx: HttpContext, ...args: any[]): Promise<any>
  asListener?(...args: any[]): Promise<any>
  authorize?(ctx: HttpContext): Promise<any> | any
  handle?(...args: HandleArgs): any

  static run<T extends BaseAction<any>>(
    this: StaticAction<T>,
    ...args: T extends { handle: (...args: infer P) => any } ? P : never
  ): T extends { handle: (...args: any) => infer R } ? R : never {
    const action = new this()

    if (typeof action.handle !== 'function') {
      throw new NotImplementedException(`${this.constructor.name} does not implement handle`)
    }

    return action.handle(...args)
  }

  static handleController<T extends BaseAction<HandleArgs>, HandleArgs extends any[] = []>(
    this: StaticAction<T>,
    ...args: any[]
  ) {
    const action = new this()

    if (args.at(1) instanceof HttpContext) {
      args.splice(0, 1)
      return action.#handleController(args.at(0), ...args.splice(0, 1))
    }

    throw new InvalidArgumentsException(
      `${this.constructor.name}.handleController was not provided the HttpContext as expected`
    )
  }

  async #handleController<T extends BaseActionable>(this: T, ctx: HttpContext, ...args: any[]) {
    if (typeof this.asController !== 'function') {
      throw new NotImplementedException(`${this.constructor.name} does not implement asController`)
    }

    if (typeof this.authorize === 'function') {
      const authorized = await this.authorize(ctx)

      if (typeof authorized !== 'undefined') {
        if (!authorized) throw new ForbiddenException()
        args.unshift(authorized)
      }
    }

    let data: unknown
    if (this.validator) {
      data = await ctx.request.validateUsing(this.validator, this.validatorOptions)
    }

    return this.asController(ctx, data, ...args)
  }
}
