import ForbiddenException from '#core/exceptions/forbidden_exception'
import NotImplementedException from '#core/exceptions/not_implemented_exception'
import { ContainerResolver } from '@adonisjs/core/container'
import { HttpContext } from '@adonisjs/core/http'
import { RequestValidationOptions } from '@adonisjs/core/types/http'
import { VineValidator } from '@vinejs/vine'

interface StaticAction<T> {
  new (): T
}

export interface BaseActionable {
  handle?(...args: any[]): Promise<any>
  asController?(ctx: HttpContext, data?: unknown): Promise<any>
  asListener?(...args: any[]): Promise<any>
  authorize?(ctx: HttpContext): Promise<boolean> | boolean
  validator?: VineValidator<any, any>
  validatorOptions?: RequestValidationOptions<any>
}

export interface Actionable extends BaseActionable {}

export default abstract class BaseAction<HandleArgs extends any[] = any[]>
  implements BaseActionable
{
  asController?(ctx: HttpContext, ...args: any[]): Promise<any>
  asListener?(...args: any[]): Promise<any>
  handle?(...args: HandleArgs): Promise<any>

  static async run<T extends BaseAction<HandleArgs>, HandleArgs extends any[]>(
    this: StaticAction<T>,
    ...args: T['handle'] extends (...args: any) => any ? Parameters<T['handle']> : any[]
  ): Promise<T['handle'] extends (...args: any) => any ? ReturnType<T['handle']> : any[]> {
    const action = new this()

    if (args.at(0) instanceof ContainerResolver && args.at(1) instanceof HttpContext) {
      args.splice(0, 1)
      return action.#handleController(args.at(0))
    }

    if (typeof action.handle !== 'function') {
      throw new NotImplementedException(`${this.constructor.name} does not implement handle`)
    }

    return action.handle(...(args as HandleArgs))
  }

  async #handleController<T extends BaseActionable>(this: T, ctx: HttpContext) {
    if (typeof this.asController !== 'function') {
      throw new NotImplementedException(`${this.constructor.name} does not implement asController`)
    }

    if (typeof this.authorize === 'function') {
      const authorized = await this.authorize(ctx)
      if (!authorized) {
        throw new ForbiddenException()
      }
    }

    let data: unknown
    if (this.validator) {
      data = await ctx.request.validateUsing(this.validator, this.validatorOptions)
    }

    return this.asController(ctx, data)
  }
}
