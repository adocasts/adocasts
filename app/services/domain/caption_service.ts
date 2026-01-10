/**
 * Ported to TypeScript Class from https://github.com/osk/node-webvtt/blob/master/lib/parser.js
 * See VTT Spec: https://www.w3.org/TR/webvtt1/#file-structure
 */
import CaptionTypes from '#enums/caption_types'
import { Exception } from '@adonisjs/core/exceptions'

export type CaptionOptions = {
  meta?: boolean
  strict?: boolean
}

export type CaptionCue = {
  identifier: string | undefined
  start: number | undefined
  end: number | undefined
  text: string
  styles: string
}

export type CaptionResult = {
  valid: boolean
  strict: boolean
  cues: (CaptionCue | null)[]
  errors: any[] | null
  meta?: Record<string, string> | null
}

export default class CaptionService {
  private static VTT_TIMESTAMP_REGEXP = /([0-9]+)?:?([0-9]{2}):([0-9]{2}\.[0-9]{2,3})/
  private static SRT_TIMESTAMP_REGEXP = /([0-9]+)?:?([0-9]{2}):([0-9]{2}\,[0-9]{2,3})/

  static parse(input: string, options: CaptionOptions = {}) {
    const { meta = false, strict = true } = options

    if (typeof input !== 'string') {
      throw new Exception('Input must be a string')
    }

    input = input.trim()
    input = input.replace(/\r\n/g, '\n')
    input = input.replace(/\r/g, '\n')

    const parts = input.split('\n\n')
    const type = parts.at(0)?.startsWith('WEBVTT') ? CaptionTypes.VTT : CaptionTypes.SRT
    let headerParts: string[] = []

    if (type === CaptionTypes.VTT) {
      const header = parts.shift()

      if (!header || !header.startsWith('WEBVTT')) {
        throw new Exception('Must start with "WEBVTT"')
      }

      headerParts = header.split('\n')

      const headerComments = headerParts[0].replace('WEBVTT', '')

      if (headerComments.length > 0 && headerComments[0] !== ' ' && headerComments[0] !== '\t') {
        throw new Exception('Header comment must start with space or tab')
      }
    }

    // nothing of interests, return early
    if (parts.length === 0 && headerParts.length === 1) {
      return { valid: true, strict, cues: [], errors: [] }
    }

    if (!meta && headerParts.length > 1 && headerParts[1] !== '') {
      throw new Exception('Missing blank line after signature')
    }

    const { cues, errors } = this.parseCues(parts, strict, type)

    if (strict && errors.length > 0) {
      throw errors[0]
    }

    const headerMeta = meta ? this.parseMeta(headerParts) : null

    const result: CaptionResult = { valid: errors.length === 0, strict, cues, errors }

    if (meta) {
      result.meta = headerMeta
    }

    return result
  }

  static parseAsParagraphs(
    input: string,
    options: CaptionOptions = {},
    gapThreshold: number = 1,
    maxParagraphLength: number = 10
  ): CaptionResult {
    const baseResult = this.parse(input, options)
    if (!baseResult.valid) return baseResult

    const cues = baseResult.cues.filter(Boolean) as CaptionCue[]
    const paragraphs: CaptionCue[] = []

    let currentParagraph: CaptionCue | null = null

    for (const cue of cues) {
      if (!cue.start || !cue.end) continue

      if (!currentParagraph) {
        currentParagraph = { ...cue }
        paragraphs.push(currentParagraph)
        continue
      }

      const timeGap = cue.start - currentParagraph.end!
      const newParagraphTooLong =
        maxParagraphLength !== undefined && cue.end - currentParagraph.start! > maxParagraphLength

      if (timeGap > gapThreshold || newParagraphTooLong) {
        // start a new paragraph
        currentParagraph = { ...cue }
        paragraphs.push(currentParagraph)
      } else {
        // merge into current paragraph
        currentParagraph.text += ' ' + cue.text.trim()
        currentParagraph.end = cue.end
      }
    }

    return {
      ...baseResult,
      cues: paragraphs,
    }
  }

  static parseMeta(headerParts: string[]) {
    const meta: Record<string, string> | null = {}
    headerParts.slice(1).forEach((header) => {
      const splitIdx = header.indexOf(':')
      const key = header.slice(0, splitIdx).trim()
      const value = header.slice(splitIdx + 1).trim()
      meta[key] = value
    })
    return Object.keys(meta).length > 0 ? meta : null
  }

  static parseCues(cues: string[], strict: boolean, type: CaptionTypes) {
    const errors: any[] = []

    const parsedCues = cues
      .map((cue, i) => {
        try {
          return this.parseCue(cue, i, strict, type)
        } catch (e) {
          errors.push(e)
          return null
        }
      })
      .filter(Boolean)

    return {
      cues: parsedCues,
      errors,
    }
  }

  /**
   * Parse a single cue block.
   *
   * @param {array} cue Array of content for the cue
   * @param {number} i Index of cue in array
   * @param {boolean} strict Perform stricter validations
   * @param {CaptionTypes} type type of caption
   *
   * @returns {object} cue Cue object with start, end, text and styles.
   *                       Null if it's a note
   */
  static parseCue(cue: string, i: number, strict: boolean, type: CaptionTypes) {
    let identifier: string | undefined = ''
    let start: number | undefined = 0
    let end: number | undefined = 0.01
    let text = ''
    let styles = ''

    // split and remove empty lines
    const lines = cue.split('\n').filter(Boolean)

    if (lines.length > 0 && lines[0].trim().startsWith('NOTE')) {
      return null
    }

    if (lines.length === 1 && !lines[0].includes('-->')) {
      throw new Exception(`Cue identifier cannot be standalone (cue #${i})`)
    }

    if (lines.length > 1 && !(lines[0].includes('-->') || lines[1].includes('-->'))) {
      const msg = `Cue identifier needs to be followed by timestamp (cue #${i})`
      throw new Exception(msg)
    }

    if (lines.length > 1 && lines[1].includes('-->')) {
      identifier = lines.shift()
    }

    const times = typeof lines[0] === 'string' ? lines[0].split(' --> ') : []

    if (
      times.length !== 2 ||
      !this.validTimestamp(times[0], type) ||
      !this.validTimestamp(times[1], type)
    ) {
      throw new Exception(`Invalid cue timestamp (cue #${i})`)
    }

    start = this.parseTimestamp(times[0], type)
    end = this.parseTimestamp(times[1], type)

    if (strict) {
      if (typeof start !== 'number' || typeof end !== 'number') {
        return null
      }

      if (start > end) {
        throw new Exception(`Start timestamp greater than end (cue #${i})`)
      }

      if (end < start) {
        throw new Exception(`End must be greater than start (cue #${i})`)
      }
    }

    if (!strict && start && end && end < start) {
      return null
    }

    styles = times[1].replace(this.regex(type), '').trim()

    lines.shift()

    text = lines.join('\n')

    if (!text) {
      return null
    }

    return { identifier, start, end, text, styles }
  }

  static validTimestamp(timestamp: string, type: CaptionTypes) {
    return this.regex(type).test(timestamp)
  }

  static parseTimestamp(timestamp: string, type: CaptionTypes) {
    const matches = timestamp.match(this.regex(type))
    if (!matches) return
    let secs = Number.parseFloat(matches[1] || '0') * 60 * 60 // hours
    secs += Number.parseFloat(matches[2]) * 60 // mins
    secs += Number.parseFloat(matches[3])
    // secs += parseFloat(matches[4]);
    return secs
  }

  static regex(type: CaptionTypes) {
    return type === CaptionTypes.VTT ? this.VTT_TIMESTAMP_REGEXP : this.SRT_TIMESTAMP_REGEXP
  }
}
