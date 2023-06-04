import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { SessionContract } from "@ioc:Adonis/Addons/Session";
import Themes from "App/Enums/Themes";

export default class ThemeService {
  /**
   * Update auth / session user's theme preference
   * @param auth 
   * @param session 
   * @param theme 
   * @returns 
   */
  public static async update(auth: AuthContract, session: SessionContract, theme: Themes) {
    auth.user?.merge({ theme })
    
    await auth.user?.save()
    
    session.put('theme', theme)

    return theme
  }
}