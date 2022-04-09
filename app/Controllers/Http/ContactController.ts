import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class ContactController {
  public async index({ view }: HttpContextContract) {
    return view.render('contact')
  }

  public async contact({ response, request, session }: HttpContextContract) {
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
        .from('tom@jagr.co', 'Tom from Jagr')
        .replyTo(data.email)
        .to('tom@jagr.co')
        .subject(data.subject)
        .html(`
          <p><strong>Email:</strong> ${data.email}</p>
          <p>${data.body}</p>
        `)
    })

    session.flash('success', "Your message has been successfully sent. Please allow up to 48 hours for a response.");

    return response.redirect().back();
  }
}
