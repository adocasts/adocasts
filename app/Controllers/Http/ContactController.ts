import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class ContactController {
  public async index({ view }: HttpContextContract) {
    return view.render('pages/contact')
  }

  public async store({ request, response, session, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      name: schema.string.optional(),
      email: schema.string({ trim: true }, [rules.email()]),
      subject: schema.string({ trim: true }),
      body: schema.string({ trim: true })
    });

    const validationMessages = {
      'required': "Please provide a {{ field }}",
      'email': "Please provide a valid email"
    };

    const data = await request.validate({ schema: validationSchema, messages: validationMessages });

    const sent = session.get('contactsSent', 0) + 1
    session.put('contactsSent', sent)

    await Mail.send(message => {
      message
        .from('contact@adocasts.com', 'Contact Form on Adocasts')
        .replyTo(data.email)
        .to('contact@adocasts.com')
        .subject(data.subject)
        .html(`
          <p><strong>IP:</strong> ${request.ip()}</p>
          <p><strong>User Id:</strong> ${auth.user?.id}</p>
          <p><strong>Sends:</strong> ${sent}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p>${data.body}</p>
        `)
    })

    await Mail.sendLater(message => {
      message
        .from('contact@adocasts.com', 'Tom from Adocasts')
        .replyTo('contact@adocasts.com')
        .to(data.email)
        .subject(`Copy of: ${data.subject}`)
        .html(`
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

    session.flash('success', "Your message has been successfully sent. Please allow up to 48 hours for a response. A copy has been sent to your email as well")

    return response.redirect().back()
  }
}
