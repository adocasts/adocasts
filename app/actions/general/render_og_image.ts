import BaseAction from '#actions/base_action'
import GetSeries from '#actions/collections/get_series'
import GetBlog from '#actions/posts/get_blog'
import GetLesson from '#actions/posts/get_lesson'
import { HttpContext } from '@adonisjs/core/http'
import puppeteer from 'puppeteer'

export default class RenderOgImage extends BaseAction {
  async asController({ response, view, params }: HttpContext) {
    let browser: puppeteer.Browser | null = null

    try {
      const type = params.entity
      const slug = params.slug
      const entity = await this.#getEntity(type, slug)

      // 1. Render an Edge view to HTML
      // Create a dedicated Edge template for your OG image
      const htmlContent = await view.render('pages/og', { entity, type })

      // 2. Launch Puppeteer and generate the image
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-dev-shm-usage'], // Important for production environments
      })

      const page = await browser.newPage()

      await page.setViewport({ width: 1200, height: 630 }) // Standard OG image size
      await page.goto('data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent), {
        waitUntil: 'networkidle0',
      })

      const screenshotBuffer = await page.screenshot({ type: 'png' }) // or 'jpeg'

      await page.close()
      await browser.close()

      response.header('Content-Type', 'image/png')
      response.send(screenshotBuffer)
    } catch (error) {
      await browser?.close()
      throw error
    }
  }

  async #getEntity(entity: string, slug: string) {
    if (!entity || !slug) return

    switch (entity) {
      case 'series':
        return GetSeries.run(slug)
      case 'lesson':
        return GetLesson.run(slug)
      case 'blog':
        return GetBlog.run(slug)
    }
  }
}
