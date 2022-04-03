import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RoleEnum from 'App/Enums/Roles'
import UnauthorizedException from 'App/Exceptions/UnauthorizedException'

export default class Role {
  public async handle ({ auth }: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    const guardRoleIds = guards.map(k => RoleEnum[k.toUpperCase()])

    if (!guardRoleIds.includes(auth.user?.roleId)) {
      throw new UnauthorizedException()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
