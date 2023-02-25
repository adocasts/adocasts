import { string } from '@ioc:Adonis/Core/Helpers'
import { parse } from 'node-html-parser'

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
}