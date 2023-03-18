import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'

Event.on('verification:email:send', async ({ user }) => {
  let href = Route.makeSignedUrl('verification.email.verify', {
    email: user.email
  }, { 
    expiresIn: '24h', 
    purpose: 'email_verification' 
  })

  href = Env.get('APP_DOMAIN') + href

  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject('[Adocasts] Please verify your email.')
      .htmlView('emails/verification/verify_email', { user, href })
  })
})