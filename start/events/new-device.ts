import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

Event.on('email:new_device', async ({ user, log }) => {
  const href = Env.get('APP_DOMAIN') + Route.makeUrl('users.settings.index', { section: 'account' })

  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("We noticed a new sign in to your Adocasts Account")
      .htmlView('emails/new_device', { user, log, href })
  })
})