import string from '@adonisjs/core/helpers/string'
import { parse } from 'node-html-parser'
import { DateTime } from 'luxon'
import dinero, { Currency } from 'dinero.js'
import { Database } from '@adonisjs/lucid/database'

export default class UtilityService {
  /**
   * returns the string in either singular or plural form depending on the count provided
   * @param str
   * @param count
   * @returns
   */
  public static getSingularOrPlural(str: string, count: string | number | any[]) {
    let isPlural = false

    if (Array.isArray(count)) {
      isPlural = count.length == 0 || count.length > 1
    } else {
      isPlural = count == 0 || count != 1
    }

    return isPlural ? string.pluralize(str) : str
  }

  /**
   * strips HTML tags from a string
   * @param html
   * @returns
   */
  public static stripHTML(html: string) {
    return parse(html).textContent
  }

  /**
   * truncates a string to length
   * @param string
   * @param length
   * @param stripHTML
   * @returns
   */
  public static truncate(string: string, length: number = 255, stripHTML: boolean = true) {
    const str = stripHTML ? this.stripHTML(string) : string
    return str.length > length ? str.slice(0, length) + '...' : str
  }

  /**
   * returns acronym for a given string
   * @param text
   * @returns
   */
  public static getAbbrev(text: string) {
    if (typeof text != 'string' || !text) {
      return '';
    }
    const acronym = text
      .match(/\b([A-Z])/g)
      ?.reduce((previous, next) => previous + ((+next === 0 || parseInt(next)) ? parseInt(next): next[0] || ''), '')
      .toUpperCase()
    return acronym;
  }

  /**
   * returns displayable time in a human readable format
   * @param totalSeconds
   * @returns
   */
  public static secondsForDisplay(totalSeconds: number) {
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const days = Math.floor(totalSeconds / (3600 * 24));

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
      maxDisplayKey
    }
  }

  public static secondsToTimestring(totalSeconds: number | string, verbose: boolean = false) {
    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)
    
    totalSeconds %= 60
    
    const seconds = Math.floor(totalSeconds)

    if (!hours) {
      return verbose
        ? `${minutes} minutes ${seconds} seconds`
        : `${minutes}m ${seconds}s`
    }

    if (verbose) {
      return `${hours} hours ${minutes} minutes`
    }

    return `${hours}h ${minutes}m`
  }

  /**
   * returns date in relative human readable time ago string
   * @param date
   */
  public static timeago(date: string | DateTime | null) {
    if (typeof date === 'string') {
      date = DateTime.fromISO(date)
    }

    return date ? date.toRelative() : ''
  }

  public static formatNumber(number: number) {
    return number.toLocaleString()
  }

  public static formatCurrency(amount: number, currencyCode: Currency | undefined = 'USD') {
    return dinero({ amount, currency: currencyCode }).toFormat('$0,0.00')
  }

  public static centsToDollars(amount: number, showChange: boolean = false, currencyCode: Currency | undefined = 'USD') {
    const format = showChange ? '0,0.00' : '0,0'
    return dinero({ amount, currency: currencyCode }).toFormat(format)
  }

  public static displaySocialUrl(url: string) {
    return url.replace('https://', '').replace('http://', '')
  }

  public static getRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  public static classes(...args: string[] | string[][]) {
    return args.filter(Boolean).reduce((list, item) => {
      if (Array.isArray(item)) {
        return [...list, ...item]
      }

      return [...list, item]
    }, [])
  }
}
