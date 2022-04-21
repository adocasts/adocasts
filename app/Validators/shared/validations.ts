import { rules, schema } from '@ioc:Adonis/Core/Validator'

export const usernameValidation = schema.string({ trim: true }, [
  rules.maxLength(50),
  rules.minLength(3),
  rules.regex(/^[a-zA-Z0-9-_.]+$/),
  rules.notIn(['admin', 'super', 'power', 'adocasts', 'adocast', 'Adocasts', 'AdoCasts', 'AdoCast', 'Adocast', 'jagr', 'jagrco', '_jagr', '_jagrco', 'jagr_', 'jagrco_', 'jagr-co', 'moderator', 'public', 'dev', 'alpha', 'mail']),
  rules.unique({ table: 'users', column: 'username', caseInsensitive: true })
])
