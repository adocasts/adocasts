import { Session } from '@adonisjs/session'

declare module '@adonisjs/session' {
  interface Session {
    toast(type: string, message: string): void
  }
}

Session.macro('toast', function (this: Session, type: string, message: string) {
  this.flash('toasts', [{ type, message }])
})
