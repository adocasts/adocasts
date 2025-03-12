import { DateTime } from 'luxon'

export default class TimeService {
  /**
   * returns displayable time in a human readable format
   * @param totalSeconds
   * @returns
   */
  static secondsForDisplay(totalSeconds: number) {
    const seconds = Math.floor(totalSeconds % 60)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const days = Math.floor(totalSeconds / (3600 * 24))

    let maxDisplay = days
    let maxDisplayKey = 'day'

    if (!days) {
      maxDisplay = hours
      maxDisplayKey = 'hour'
    }

    if (!hours) {
      maxDisplay = minutes
      maxDisplayKey = 'minute'
    }

    if (!minutes) {
      maxDisplay = seconds
      maxDisplayKey = 'second'
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      maxDisplay,
      maxDisplayKey,
    }
  }

  static secondsToTimestring(totalSeconds: number | string, verbose: boolean = false) {
    if (!totalSeconds) return '0s'

    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)

    totalSeconds %= 60

    const seconds = Math.floor(totalSeconds)

    if (hours) {
      return verbose ? `${hours} hours ${minutes} minutes` : `${hours}h ${minutes}m`
    }

    if (minutes) {
      return verbose ? `${minutes} minutes ${seconds} seconds` : `${minutes}m ${seconds}s`
    }

    return verbose ? `${seconds} seconds` : `${seconds}s`
  }

  static secondsToTime(totalSeconds: number | string) {
    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)

    totalSeconds %= 60

    const seconds = Math.floor(totalSeconds)
    const short = `${(minutes + '').padStart(2, '0')}:${(seconds + '').padStart(2, '0')}`

    if (!hours) {
      return short
    }

    return `${(hours + '').padStart(2, '0')}:${short}`
  }

  /**
   * returns date in relative human readable time ago string
   * @param date
   */
  static timeago(date: string | DateTime | null) {
    if (typeof date === 'string') {
      date = DateTime.fromISO(date)
    }

    return date ? date.toRelative() : ''
  }

  static dtmHumanShort(iso: string) {
    const dtm = DateTime.fromISO(iso)
    const suffix = this.#getDaySuffix(dtm.day)

    if (dtm.year === DateTime.now().year) {
      return dtm.toFormat(`MMM d'${suffix}'`)
    }

    return dtm.toFormat(`MMM d'${suffix}', yy`)
  }

  static #getDaySuffix(day: number) {
    if (day > 3 && day < 21) {
      return 'th'
    }

    const suffixes = ['st', 'nd', 'rd']
    return suffixes[(day % 10) - 1] || 'th'
  }
}
