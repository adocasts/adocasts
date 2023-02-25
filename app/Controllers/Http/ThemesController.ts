import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ThemeService from 'App/Services/ThemeService'
import ThemeValidator from 'App/Validators/ThemeValidator'

export default class ThemesController {
  /**
   * Update auth / session user's theme preference
   * @param param0 
   * @returns 
   */
  public async update({ request, response, auth, session }: HttpContextContract) {
    const { theme } = await request.validate(ThemeValidator)

    await ThemeService.update(auth, session, theme)

    return response.noContent()
  }
}
