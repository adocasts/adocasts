import { string } from '@ioc:Adonis/Core/Helpers'
import { parse } from 'node-html-parser'
import { DateTime } from 'luxon'
import { dinero, toDecimal } from 'dinero.js'
import * as currencies from '@dinero.js/currencies'

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

  public static secondsToTimestring(totalSeconds: number | string) {
    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600);

    totalSeconds %= 3600;

    const minutes = Math.floor(totalSeconds / 60);

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

  public static formatCurrency(amount: number, currencyCode: string | undefined = 'USD', lang: string | undefined = 'en-US', minimumFractionDigits: number = 2) {
    const currency = currencies[currencyCode.toUpperCase()]
    const data = dinero({ amount, currency })
    return toDecimal(data, ({ currency, value }) => Number(value).toLocaleString(lang, { 
      currency: currency.code,
      style: 'currency',
      minimumFractionDigits
    }))
  }

  public static displaySocialUrl(url: string) {
    return url.replace('https://', '').replace('http://', '')
  }

  public static getRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
