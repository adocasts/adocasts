import { SessionLogSchema } from '#database/schema'
import User from '#models/user'
import timeHelpers from '#services/helpers/time'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { UAParser } from 'ua-parser-js'

export default class SessionLog extends SessionLogSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  isCurrentSession: boolean = false

  @computed()
  get lastTouchedAgo() {
    if (!this.lastTouchedAt && !this.loginAt) return ''

    if (!this.lastTouchedAt) {
      return timeHelpers.timeago(this.loginAt)
    }

    return timeHelpers.timeago(this.lastTouchedAt)
  }

  @computed()
  get device(): UAParser.IResult | undefined {
    if (!this.userAgent) return undefined
    return UAParser(this.userAgent)
  }

  @computed()
  get browser() {
    if (typeof this.userAgent === 'undefined') return '--'
    if (!this.device?.browser) return '--'

    const info = [
      `${this.device.browser?.name} ${this.device.browser?.version}`,
      `${this.device.os.name} ${this.device.os.version}`,
    ].filter(Boolean)

    return info.join(', ')
  }

  @computed()
  get location() {
    if (!this.city && !this.country) return '--'

    const info = [this.city, this.country].filter(Boolean).filter((i) => i !== '-')

    return info.length ? info.join(', ') : '--'
  }
}
