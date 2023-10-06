import { parse } from 'node-html-parser'
import Application from '@ioc:Adonis/Core/Application'
import View from '@ioc:Adonis/Core/View'
import Env from '@ioc:Adonis/Core/Env'
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

  public static async normalizeUrls(html: string) {
    const root = parse(html || '')
    const anchors = root.querySelectorAll('a')
    const images = root.querySelectorAll('img')

    if (anchors?.length) {
      anchors.map(el => {
        const href = el.getAttribute('href')
        if (href?.startsWith('/') && !href.startsWith('//')) {
          el.setAttribute('href', `${Env.get('APP_DOMAIN')}${href}`)
        }
      })
    }

    if (images?.length) {
      images.map(el => {
        const source = el.getAttribute('src')
        if (source?.startsWith('/') && !source.startsWith('//')) {
          el.setAttribute('src', `${Env.get('APP_DOMAIN')}${source}`)
        }
      })
    }

    return root.toString()
  }

  public static async getLangIconHtml(lang) {
    let langIcon = ''
    let iconHtml = ''

    switch (lang) {
      case 'ts':
        langIcon = 'brand-typescript'
        break
      case 'edge':
        langIcon = 'brand-adonis-js'
        break
      case 'js':
        langIcon = 'brand-javascript'
        break
      case 'vue':
        langIcon = 'brand-vue'
        break
      case 'jsx':
        langIcon = 'file-type-jsx'
        break
      case 'tsx':
        langIcon = 'file-type-tsx'
        break
    }

    if (langIcon) {
      iconHtml = `<span class="lang-icon ${lang}">${await View.render(`components/icons/${langIcon}`)}</span>`
    }

    return iconHtml
  }

  public static async getPreview(html: string) {
    const root = parse(html || '')
    const [one, two, three, four, five, ..._rest ] = root.childNodes
    
    root.childNodes = [one, two, three, four, five].filter(Boolean)
    
    return root.toString()
  }

  public static async highlight(html: string) {
    const root = parse(html || '')
    const headings = root.querySelectorAll('h1,h2,h3,h4,h5,h6')
    const preBlocks = root.querySelectorAll('pre')
    const paragraphs = root.querySelectorAll('p')

    // set slug anchor id to all headings
    if (headings?.length) {
      headings.map(el => el.setAttribute('id', slugify(el.textContent, { lower: true, replacement: '_' })))
    }

    // add timestamp class to timestamp paragraphs
    if (paragraphs.length) {
      const regexWholeString = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}$/i
      const regex = /([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}/gim
      
      paragraphs
        .filter(el => el.textContent.match(regex))
        .map(el => {
          if (el.textContent.trim().match(regexWholeString)) {
            el.setAttribute('class', 'timestamp')
            return
          } 

          el.setAttribute('class', 'chapters')
          el.innerHTML = el.innerHTML.replaceAll(regex, '<span class="timestamp">$&</span>')
        })

      // find & set transcript paragraph timestamps
      const transcriptIndex = paragraphs.findIndex(el => el.textContent.includes('Transcript:'))
      if (transcriptIndex > -1) {
        const transcriptParagraphs = paragraphs.slice(transcriptIndex + 1).filter(el => el.textContent.match(regex))
        const transcriptCutoffIndex = transcriptParagraphs.length > 12 ? 6 : 0
        
        if (transcriptCutoffIndex) {
          const cutoffHTML = transcriptParagraphs[transcriptCutoffIndex].innerHTML
          transcriptParagraphs[transcriptCutoffIndex].replaceWith(`
            <div class="transcript-cutoff"><button type="button" id="transcriptCutoffBtn" @click="onTranscriptToggle"></button></div>
            <p class="timestamp transcript cutoff active">${cutoffHTML}</p>
          `)
        }
        
        transcriptParagraphs.map((el, i) => el.setAttribute('class', `timestamp transcript ${i >= transcriptCutoffIndex ? 'cutoff active' : ''}`))
      }
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
          let code = c.text.replace(tagStart, '').replace('</code>', '')
          const filepath = code.match(/^\/\/ (\w+\/){1,6}\w+.(ts|js|edge|vue|jsx|tsx)((\r\n)?){1,6}/)

          if (filepath?.length) {
            code = code.replace(filepath[0], '')
          }

          const lines = code.split('\r\n')
          const delLineNumbers = lines.map((line, i) => line.startsWith('--') ? i + 1 : undefined).filter(Boolean)
          const addLineNumbers = lines.map((line, i) => line.startsWith('++') ? i + 1 : undefined).filter(Boolean)
          const codeLessChange = code.replaceAll('\r\n--', '\r\n').replaceAll('\r\n++', '\r\n')
          let highlighted = await (await highlighter).codeToHtml(codeLessChange, { 
            lang,
            lineOptions: [
              ...delLineNumbers.map(x => ({ line: x, classes: ['del'] })),
              ...addLineNumbers.map(x => ({ line: x, classes: ['add'] }))
            ]
          })

          const h = parse(highlighted)
          let highlightedCode = highlighted
          
          if (filepath?.length) {
            const path = filepath[0].replaceAll('\r\n', '').replace('//', '').trim().split('/')
            const iconHtml = await this.getLangIconHtml(lang)
            const filePathHtml = parse(`<span class="filepath">${iconHtml}<ul class="filepath-list">${path.map(item => `<li>${item}</li>`).join('')}</ul></span>`)
            const rawInnerText = h.firstChild.rawText
            const rawText = rawInnerText + filePathHtml.outerHTML
            
            highlightedCode = highlighted.replace(rawInnerText, rawText)
          }
          
          c.replaceWith(highlightedCode)
        }
      })

      await Promise.all(promises)
    }
    return root.toString()
  }
}
