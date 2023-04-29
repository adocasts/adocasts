declare module '@ioc:Adonis/Core/HttpContext' {
  import TurnstileService from "App/Services/TurnstileService";

  interface HttpContextContract {
    turnstile: TurnstileService
  }
}
