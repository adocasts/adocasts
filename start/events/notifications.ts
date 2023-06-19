import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

Event.on('notification:send', async ({ notification, user }: { notification: Notification, user: User }) => {
  const href = Env.get('APP_DOMAIN') + notification.href
  
  const turnOffFieldHref = Env.get('APP_DOMAIN') + Route.makeSignedUrl('users.notifications.disable.field', {
    userId: user.id,
    field: notification.settingsField
  })

  const turnOffHref = Env.get('APP_DOMAIN') + Route.makeSignedUrl('users.notifications.disable', {
    userId: user.id
  })

  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject(`[Adocasts] ${notification.title}`)
      .htmlView('emails/notifications/send', { notification, user, href, turnOffFieldHref, turnOffHref })
  })
})