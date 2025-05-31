import BaseAction from '#actions/base_action'
import { billtoValidator } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof billtoValidator>

export default class UpdateUserBillTo extends BaseAction {
  validator = billtoValidator

  async asController({ response, auth }: HttpContext, { billToInfo }: Validator) {
    let clearedBillTo = false
    let user = auth.user!

    if (billToInfo === '\n') {
      billToInfo = null
      clearedBillTo = true
    }

    await user.merge({ billToInfo }).save()

    return response.status(200).json({ clearedBillTo, billToInfo })
  }
}
