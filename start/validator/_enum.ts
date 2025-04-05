import vine, { VineNumber } from '@vinejs/vine'
import { messages } from '@vinejs/vine/defaults'
import { EnumLike, FieldContext } from '@vinejs/vine/types'

declare module '@vinejs/vine' {
  interface VineNumber {
    enum(option: EnumLike): this
  }
}

async function numberEnum<T extends EnumLike>(value: unknown, option: T, field: FieldContext) {
  if (typeof value !== 'number') return

  if (!option[value]) {
    field.report(messages['in'], 'enumId', field, Object.values(option))
  }
}

const enumRule = vine.createRule(numberEnum)

VineNumber.macro('enum', function (this: VineNumber, option: EnumLike) {
  return this.use(enumRule(option))
})
