import SessionLog from '#models/session_log'
import User from '#models/user'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'
import edge from 'edge.js'

export default class AccountListener {
  async onEmailChanged({
    user,
    oldEmail,
    signedUrl,
  }: {
    user: User
    oldEmail: string
    signedUrl: string
  }) {
    const href = env.get('APP_DOMAIN') + signedUrl
    const username = user.username
    const html = await edge.render('emails/email_changed', { username, href })

    await mail.send((mailer) => {
      mailer
        .to(oldEmail)
        .subject("[Adocasts] Your account's email has been successfully changed")
        .html(html)
      //.htmlView('emails/email_changed', { username, href })
    })
  }

  async onEmailReverted({ user }: { user: User }) {
    const username = user.username
    const html = await edge.render('emails/email_reverted', { username })

    await mail.send((mailer) => {
      mailer
        .to(user.email)
        .subject("[Adocasts] Your account's email has been successfully reverted")
        .html(html)
      //.htmlView('emails/email_reverted', { user })
    })
  }

  async onPasswordReset({ user, signedUrl }: { user: User; signedUrl: string }) {
    const href = env.get('APP_DOMAIN') + signedUrl
    const html = await edge.render('emails/password_reset', { user, href })

    await mail.send((message) => {
      message.to(user.email).subject('[Adocasts] Reset your password').html(html)
    })
  }

  async onPasswordResetSuccess({ user }: { user: User }) {
    const html = await edge.render('emails/password_reset_success', { user })

    await mail.send((message) => {
      message
        .to(user.email)
        .subject('[Adocasts] Your password has been successfully reset')
        .html(html)
    })
  }

  async onNewDevice({ user, log }: { user: User; log: SessionLog }) {
    const href = env.get('APP_DOMAIN') + router.makeUrl('settings', { section: 'account' })
    const html = await edge.render('emails/new_device', { user, log, href })

    await mail.send((mailer) => {
      mailer.to(user.email).subject('We noticed a new sign in to your Adocasts account').html(html)
    })
  }

  async onVerifyEmail({ user }: { user: User }) {
    let href = router.makeSignedUrl(
      'verification.email.verify',
      {
        email: user.email,
      },
      {
        expiresIn: '24h',
        purpose: 'email_verification',
      }
    )

    href = env.get('APP_DOMAIN') + href

    const html = await edge.render('emails/verify_email', { user, href })

    await mail.send((mailer) => {
      mailer.to(user.email).subject('[Adocasts] Please verify your email').html(html)
    })
  }
}
