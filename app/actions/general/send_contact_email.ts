import BaseAction from '#actions/base_action'
import { contactValidator } from '#validators/contact'
import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { Infer } from '@vinejs/vine/types'
import GetIpAddress from './get_ip_address.js'

type Validator = Infer<typeof contactValidator>

export default class SendContactEmail extends BaseAction {
  validator = contactValidator

  async asController({ response, request, session, auth }: HttpContext, data: Validator) {
    const ip = await GetIpAddress.run(request)

    await mail.send((message) => {
      message
        .from('contact@adocasts.com', 'Contact Form on Adocasts')
        .replyTo(data.email)
        .to('contact@adocasts.com')
        .subject(data.subject).html(`
          <p><strong>IP:</strong> ${ip}</p>
          <p><strong>User Id:</strong> ${auth.user?.id}</p>
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

    session.toast(
      'success',
      'Your message has been successfully sent. Please allow up to 48 hours for a response. A copy has been sent to your email as well'
    )

    return response.redirect().back()
  }
}
