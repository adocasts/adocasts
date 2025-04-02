import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (
      !ctx.route ||
      typeof ctx.route.handler === 'function' ||
      ctx.route.handler.handle.name !== 'handle' ||
      !Array.isArray(ctx.route.handler.reference)
    ) {
      return next()
    }

    const controller = await ctx.route.handler.reference.at(0)()
    const isAction = Object.getPrototypeOf(controller.default) === BaseAction

    if (isAction) {
      ctx.route.handler.handle = controller.default.run.bind(controller.default)
    }

    return next()
  }
}
