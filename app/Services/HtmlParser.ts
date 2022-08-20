import { parse } from 'node-html-parser'
import Application from '@ioc:Adonis/Core/Application'
import slugify from 'slugify'
const shiki = require('shiki')

const highlighter = shiki.getHighlighter({
  theme: 'github-dark',
  langs: [...shiki.BUNDLED_LANGUAGES,
    {
      id: 'edge',
      scopeName: 'text.html.edge',
      path: Application.publicPath('/shiki/edge.json')
    }
  ]
})

export default class HtmlParser {
  public static normalizeLanguage(language: string | undefined) {
    if (!language) return language

    switch(language.toLowerCase()) {
      case 'typescript':
        return 'ts'
      case 'javascript':
        return 'js'
      case 'xml':
      case 'vbscript-html':
        return 'edge'
      default:
        return language
    }
  }

  public static async highlight(html: string) {
    const root = parse(html || '')
    const headings = root.querySelectorAll('h1,h2,h3,h4,h5,h6')
    const preBlocks = root.querySelectorAll('pre')
    const paragraphs = root.querySelectorAll('p')

    if (headings?.length) {
      headings.map(el => el.setAttribute('id', slugify(el.textContent, { lower: true, replacement: '_' })))
    }

    if (paragraphs.length) {
      const timestampTemplates = ['X:XX', 'XX:XX', 'X:XX:XX', 'XX:XX:XX']
      const timestamps = paragraphs.filter(el => {
        const timestampReValue = el.textContent.replaceAll(/[0-9]/g, 'X').trim()
        const isMatch = timestampTemplates.includes(timestampReValue)
        return isMatch
      })
      timestamps.map(el => el.setAttribute('class', 'timestamp'))
    }

    if (preBlocks?.length) {
      const promises = preBlocks.map(async (c) => {
        const codeRoot = parse(c.text, {
          blockTextElements: {
            code: false
          }
        })

        const codeBlock = codeRoot.querySelector('code')

        if (codeBlock) {
          const classList = [...codeBlock.classList.values()]
          const lang = this.normalizeLanguage(classList.find((c) => c.startsWith('language-'))?.replace('language-', ''))

          if (!lang) return

          const outerHTML = codeBlock.outerHTML
          const tagStart = outerHTML.replace('</code>', '')
          const code = c.text.replace(tagStart, '').replace('</code>', '')
          const highlighted = await (await highlighter).codeToHtml(code, { lang })

          c.replaceWith(highlighted)
        }
      })

      await Promise.all(promises)
    }
    return root.toString()
  }
}
