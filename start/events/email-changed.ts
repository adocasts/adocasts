import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

Event.on('email:changed', async ({ user, oldEmail, signedUrl }) => {
  const href = Env.get('APP_DOMAIN') + signedUrl

  await Mail.sendLater(message => {
    message
      .to(oldEmail)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] Your account's email has been successfully changed.")
      .htmlView('emails/email_changed', { user, href })
  })
})

Event.on('email:reverted', async ({ user }) => {
  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] Your account's email has been successfully reverted.")
      .htmlView('emails/email_reverted', { user })
  })
})
