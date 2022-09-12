import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class ContactController {
  public async index({ view }: HttpContextContract) {
    return view.render('contact')
  }

  public async contact({ response, request, session }: HttpContextContract) {
    const contactBlockedIps = Env.get('CONTACT_BLOCKED', '').split(',').map(ip => ip.trim())
    
    if (contactBlockedIps.includes(request.ip())) {
      session.put('hideContact', true)
      session.flash('blocked', "You've been blocked for spamming. Please refrain from spamming again in the future if your block is ever lifted.")
      return response.redirect().back()
    }

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

    await Mail.send(message => {
      message
        .from('contact@adocasts.com', 'Contact Form on Adocasts')
        .replyTo(data.email)
        .to('contact@adocasts.com')
        .subject(data.subject)
        .html(`
          <p><strong>IP:</strong> ${request.ip()}</p>
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
            Adocasts, LLC
          </p>
          <p><strong>Below is your message:</strong></p>
          <p>${data.body}</p>
        `)
    })

    session.flash('success', "Your message has been successfully sent. Please allow up to 48 hours for a response. A copy has been sent to your email as well");

    return response.redirect().back();
  }
}
