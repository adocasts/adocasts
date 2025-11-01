import string from '@adonisjs/core/helpers/string'
import { HttpContext } from '@adonisjs/core/http'

/**
 * A list of supported unpoly headers
 */
const UNPOLY_HEADERS = [
  'X-Up-Accept-Layer',
  'X-Up-Clear-Cache',
  'X-Up-Context',
  'X-Up-Dismiss-Layer',
  'X-Up-Events',
  'X-Up-Fail-Context',
  'X-Up-Fail-Mode',
  'X-Up-Fail-Target',
  'X-Up-Location',
  'X-Up-Method',
  'X-Up-Mode',
  'X-Up-Reload-From-Time',
  'X-Up-Target',
  'X-Full-Reload',
  'X-Up-Status',
]

export default class Up {
  /**
   * The headers to set on the response or flash messages in case of redirect
   */
  private headers: Record<string, string> = {}

  /**
   * Converts the unpoly header name to flash messages key
   */
  private headerToFlashKey(header: string) {
    return header.replace('X-', '').toLowerCase()
  }

  /**
   * Returns the value of an unpoly header. Giving priority to the
   * flash messages
   */
  private getProperty(header: string): string {
    return this.ctx.session.flashMessages.get(
      this.headerToFlashKey(header),
      this.ctx.request.header(header)
    )
  }

  /**
   * Set the unpoly response header
   */
  private setProperty(header: string, value: string): void {
    this.headers[header] = value
  }

  /**
   * Set unpoly headers as flash messages
   */
  private setHeadersAsFlashMessages(headers: Record<string, string>) {
    Object.keys(headers).forEach((header) => {
      this.ctx.session.flash(this.headerToFlashKey(header), headers[header])
    })
  }

  /**
   * Set unpoly headers as response headers
   */
  private setHeadersAsResponse(headers: Record<string, string>) {
    Object.keys(headers).forEach((header) => {
      const h = header
        .split('-')
        .map((text) => string.capitalCase(text))
        .join('-')
      // this.ctx.response.response.setHeader(h, headers[header])
      this.ctx.response.header(h, headers[header])
    })

    if (this.getStatus()) {
      this.ctx.response.response.statusCode = Number.parseInt(this.getStatus())
    }
  }

  constructor(private ctx: HttpContext) {}

  /**
   * Commit response
   */
  commit() {
    const headers = Object.assign(
      UNPOLY_HEADERS.reduce((result, header) => {
        const value = this.ctx.session.flashMessages.get(this.headerToFlashKey(header))
        if (value) {
          result[header as keyof Object] = value
        }
        return result
      }, {}),
      this.headers
    )
    if (this.ctx.response.getHeader('Location')) {
      this.setHeadersAsFlashMessages(headers)
    } else {
      this.setHeadersAsResponse(headers)
    }
    // this.ctx.view.share({ up: this })
  }

  get isPage() {
    return this.getOriginMode() === 'root'
  }

  get isLayoutUpdate() {
    return this.getTarget() === 'body'
  }

  get isUnpolyRequest() {
    return !!this.getContext()
  }

  getLayer() {
    return this.getProperty('X-Up-Accept-Layer')
  }

  getCache() {
    return this.getProperty('X-Up-Clear-Cache')
  }

  getContext() {
    return this.getProperty('X-Up-Context')
  }

  getDismissLayer() {
    return this.getProperty('X-Up-Dismiss-Layer')
  }

  getEvents() {
    return this.getProperty('X-Up-Events')
  }

  getFailContext() {
    return this.getProperty('X-Up-Fail-Context')
  }

  getFailMode() {
    return this.getProperty('X-Up-Fail-Mode')
  }

  getFailTarget() {
    return this.getProperty('X-Up-Fail-Target')
  }

  getLocation() {
    return this.getProperty('X-Up-Location')
  }

  getMethod() {
    return this.getProperty('X-Up-Method')
  }

  getMode() {
    return this.getProperty('X-Up-Mode') || 'root'
  }

  getOriginMode() {
    return this.getProperty('X-Up-Origin-Mode') || 'root'
  }

  getReloadFromTime() {
    return this.getProperty('X-Up-Reload-From-Time')
  }

  getTarget() {
    return this.getProperty('X-Up-Target') || 'body'
  }

  targetIncludes(selector: string): boolean {
    const target = this.getTarget()
      .split(',')
      .map((value) => value.trim())
    return target.includes('body') ? true : target.includes(selector)
  }

  getStatus() {
    return this.getProperty('X-Up-Status')
  }

  getTitle() {
    return this.getProperty('X-Up-Title')
  }

  getValidate() {
    return this.getProperty('X-Up-Validate')
  }

  getVersion() {
    return this.getProperty('X-Up-Version')
  }

  setLayer(value: string) {
    return this.setProperty('X-Up-Accept-Layer', value)
  }

  setCache(value: string) {
    return this.setProperty('X-Up-Clear-Cache', value)
  }

  setContext(value: string) {
    return this.setProperty('X-Up-Context', value)
  }

  setDismissLayer(value: string) {
    return this.setProperty('X-Up-Dismiss-Layer', value)
  }

  setEvents(value: string) {
    return this.setProperty('X-Up-Events', value)
  }

  setFailContext(value: string) {
    return this.setProperty('X-Up-Fail-Context', value)
  }

  setFailMode(value: string) {
    return this.setProperty('X-Up-Fail-Mode', value)
  }

  setFailTarget(value: string) {
    return this.setProperty('X-Up-Fail-Target', value)
  }

  setLocation(value: string) {
    return this.setProperty('X-Up-Location', value)
  }

  setMethod(value: string) {
    return this.setProperty('X-Up-Method', value)
  }

  setMode(value: string) {
    return this.setProperty('X-Up-Mode', value)
  }

  setReloadFromTime(value: string) {
    return this.setProperty('X-Up-Reload-From-Time', value)
  }

  setTarget(value: string) {
    return this.setProperty('X-Up-Target', value)
  }

  addTarget(...value: string[]) {
    const current = this.getProperty('X-Up-Target')?.split(',') ?? []
    this.setProperty('X-Up-Target', [...new Set([...current, ...value])].join(', '))
  }

  setStatus(status: number) {
    return this.setProperty('X-Up-Status', status + '')
  }

  setTitle(value: string) {
    return this.setProperty('X-Up-Title', value)
  }

  setValidate(value: string) {
    return this.setProperty('X-Up-Validate', value)
  }

  setVersion(value: string) {
    return this.setProperty('X-Up-Version', value)
  }

  fullReload() {
    return this.setProperty('X-Full-Reload', 'true')
  }
}
