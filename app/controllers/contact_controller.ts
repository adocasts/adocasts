import { contactValidator } from '#validators/contact_validator'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class ContactController {
  async index({ view }: HttpContext) {
    return view.render('pages/contact')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(contactValidator)

    const sent = session.get('contactsSent', 0) + 1
    session.put('contactsSent', sent)

    await mail.send((message) => {
      message
        .from('contact@adocasts.com', 'Contact Form on Adocasts')
        .replyTo(data.email)
        .to('contact@adocasts.com')
        .subject(data.subject).html(`
          <p><strong>IP:</strong> ${request.ip()}</p>
          <p><strong>User Id:</strong> ${auth.user?.id}</p>
          <p><strong>Sends:</strong> ${sent}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p>${data.body}</p>
        `)
    })

    await mail.sendLater((message) => {
      message
        .from('contact@adocasts.com', 'Tom from Adocasts')
        .replyTo('contact@adocasts.com')
        .to(data.email)
        .subject(`Copy of: ${data.subject}`).html(`
          <p>
            We've recieved your message and wanted to forward a copy on to you.
            If you need to add any additional information, please feel free to respond directly to this email.
          </p>
          <p>
            Thank you,<br/>
            Tom Gobich<br/>
            Adocasts
          </p>
          <p><strong>Below is your message:</strong></p>
          <p>${data.body}</p>
        `)
    })

    session.flash(
      'success',
      'Your message has been successfully sent. Please allow up to 48 hours for a response. A copy has been sent to your email as well'
    )

    return response.redirect().back()
  }
}

