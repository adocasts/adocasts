import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'

Event.on('email:changed', async ({ user, oldEmail, signedUrl }) => {
  await Mail.sendLater(message => {
    message
      .to(oldEmail)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] Your account's email has been successfully changed.")
      .htmlView('emails/auth/email_changed', { user, signedUrl })
  })
})

Event.on('email:reverted', async ({ user }) => {
  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] Your account's email has been successfully reverted.")
      .htmlView('emails/auth/email_reverted', { user })
  })
})
