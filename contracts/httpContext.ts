declare module '@ioc:Adonis/Core/HttpContext' {
  import { Settings } from 'contracts/settings'

  interface HttpContextContract {
    settings: Settings
  }
}