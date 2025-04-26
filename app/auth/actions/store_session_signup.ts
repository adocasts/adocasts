import { signUpValidator } from '#auth/validators/auth'
import BaseAction from '#core/actions/base_action'
import User from '#user/models/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class StoreSessionSignUp extends BaseAction {
  validator = signUpValidator

  async asController(
    { response, auth, session }: HttpContext,
    { options, ...data }: Infer<typeof this.validator>
  ) {
    const user = await User.create(data)
    
    await user.related('profile').create({})
  }
}
