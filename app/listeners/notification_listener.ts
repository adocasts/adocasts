import Notification from "#models/notification";
import User from "#models/user";
import env from "#start/env";
import router from "@adonisjs/core/services/router";
import mail from "@adonisjs/mail/services/main";
import edge from "edge.js";

export default class NotificationListener {
  public async onSend({ notification, user }: { notification: Notification, user: User }) {
    const domain = env.get('APP_DOMAIN')
    const href = domain + notification.href
    
    const turnOffFieldHref = domain + router.makeSignedUrl('users.notifications.disable.field', {
      userId: user.id,
      field: notification.settingsField
    })

    const turnOffHref = domain + router.makeSignedUrl('users.notifications.disable', {
      userId: user.id
    })

    const html = await edge.render('emails/notification', { notification, user, href, turnOffFieldHref, turnOffHref })

    await mail.send(mailer => {
      mailer
        .to(user.email)
        .subject(`[Adocasts] ${notification.title}`)
        .html(html)
    })
  }
}