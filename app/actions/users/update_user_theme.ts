import BaseAction from '#actions/base_action'
import { rememberMeTokensAge } from '#config/auth'
import { themeValidator } from '#validators/theme'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

type Validator = Infer<typeof themeValidator>

export default class UpdateUserTheme extends BaseAction {
  validator = themeValidator

  async asController({ view, response, auth }: HttpContext, { theme }: Validator) {
    await auth.user?.merge({ theme }).save()

    response.cookie('adocasts-theme', theme, {
      maxAge: rememberMeTokensAge,
    })

    return view.render('components/frags/header/theme', { theme })
  }
}
