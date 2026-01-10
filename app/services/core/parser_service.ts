import env from '#start/env'
import string from '@adonisjs/core/helpers/string'
import edge from 'edge.js'
import { type HTMLElement, parse } from 'node-html-parser'
import { bundledLanguages, createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: [
    'javascript',
    'typescript',
    'vue',
    'html',
    'plaintext',
    'jsx',
    'tsx',
    'edge',
    'bash',
    'csharp',
    'docker',
    'go',
    'graphql',
    'handlebars',
    'java',
    'json',
    'less',
    'lua',
    'markdown',
    'nginx',
    'php',
    'powershell',
    'pug',
    'python',
    'ruby',
    'rust',
    'sass',
    'scss',
    'sql',
    'vim',
    'yaml',
  ],
})

class ParserService {
  static highlightVersion = '2023-10-19.01'

  stripHtml(html?: string) {
    if (!html) return ''

    return parse(html).textContent
  }

  normalizeLanguage(language: string | undefined) {
    if (!language) return language

    switch (language.toLowerCase()) {
      case 'typescript':
        return 'ts'
      case 'javascript':
        return 'js'
      case 'xml':
      case 'vbscript-html':
        return 'edge'
      default:
        return Object.keys(bundledLanguages).some((lang) => lang === language)
          ? language
          : undefined
    }
  }

  async normalizeUrls(html: string) {
    const root = parse(html || '')
    const anchors = root.querySelectorAll('a')
    const images = root.querySelectorAll('img')

    if (anchors?.length) {
      anchors.map((el) => {
        const href = el.getAttribute('href')
        if (href?.startsWith('/') && !href.startsWith('//')) {
          el.setAttribute('href', `${env.get('APP_DOMAIN')}${href}`)
        }
      })
    }

    if (images?.length) {
      images.map((el) => {
        const source = el.getAttribute('src')
        if (source?.startsWith('/') && !source.startsWith('//')) {
          el.setAttribute('src', `${env.get('APP_DOMAIN')}${source}`)
        }
      })
    }

    return root.toString()
  }

  async getLangIconHtml(lang: string, filepath: string) {
    let identifier = ''
    let iconHtml = ''

    // overwrite to correct lang when using html as fallback
    if (lang === 'html') {
      if (filepath.includes('.vue')) lang = 'vue'
    }

    switch (lang) {
      case 'ts':
        identifier = 'simple-icons:typescript'
        break
      case 'edge':
        identifier = 'simple-icons:adonisjs'
        break
      case 'js':
        identifier = 'simple-icons:javascript'
        break
      case 'vue':
        identifier = 'simple-icons:vuedotjs'
        break
      case 'jsx':
        identifier = 'simple-icons:react'
        break
      case 'tsx':
        identifier = 'simple-icons:react'
        break
      case 'html':
        identifier = 'simple-icons:html5'
        break
      case 'bash':
        identifier = 'simple-icons:gnubash'
        break
      case 'docker':
        identifier = 'simple-icons:docker'
        break
      // case 'git':
      //   identifier = 'simple-icons:git'
      //   break
      case 'go':
        identifier = 'simple-icons:go'
        break
      case 'graphql':
        identifier = 'simple-icons:graphql'
        break
      case 'handlebars':
        identifier = 'simple-icons:handlebarsdotjs'
        break
      case 'json':
        // case 'json5':
        // case 'jsonp':
        identifier = 'simple-icons:json'
        break
      case 'less':
        identifier = 'simple-icons:less'
        break
      case 'lua':
        identifier = 'simple-icons:lua'
        break
      case 'markdown':
        identifier = 'simple-icons:markdown'
        break
      case 'nginx':
        identifier = 'simple-icons:nginx'
        break
      case 'php':
        identifier = 'simple-icons:php'
        break
      case 'pug':
        identifier = 'simple-icons:pug'
        break
      case 'python':
        identifier = 'simple-icons:python'
        break
      case 'ruby':
        identifier = 'simple-icons:ruby'
        break
      case 'rust':
        identifier = 'simple-icons:rust'
        break
      case 'sass':
      case 'scss':
        identifier = 'simple-icons:sass'
        break
      case 'sql':
        identifier = 'simple-icons:postgresql'
        break
      case 'vim':
        identifier = 'simple-icons:vim'
        break
      case 'yaml':
        identifier = 'simple-icons:yaml'
        break
    }

    if (identifier) {
      iconHtml = `<span class="lang-icon ${lang}">${await edge.render(`components/helpers/svg`, {
        identifier,
      })}</span>`
    }

    return iconHtml
  }

  getCopyCode(code: string, lang: string) {
    let lines = code
      .split('\n')
      .filter((l) => !l.startsWith('--'))
      .filter((l) => l !== '\r')
      .map((l) => (l.startsWith('++') ? l.replace('++', '') : l))

    switch (lang) {
      case 'bash':
        // remove bash comments
        lines = lines.filter((l) => !l.startsWith('#'))
        break
    }

    return lines.join('\n')
  }

  async getPreview(html: string) {
    const root = parse(html || '')
    const [one, two, three] = root.childNodes

    root.childNodes = [one, two, three].filter(Boolean)

    return root.toString()
  }

  async highlight(html: string) {
    const root = parse(html || '')
    const headings = root.querySelectorAll('h1,h2,h3,h4,h5,h6')
    const preBlocks = root.querySelectorAll('pre')
    const paragraphs = root.querySelectorAll('p')

    // set slug anchor id to all headings
    if (headings?.length) {
      headings.map((el) =>
        el.setAttribute('id', string.slug(el.textContent, { lower: true, replacement: '_' }))
      )
    }

    // add timestamp class to timestamp paragraphs
    if (paragraphs.length) {
      const regexWholeString = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}$/i
      const regex = /([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}/gim

      paragraphs
        .filter((el) => el.textContent.match(regex))
        .map((el) => {
          if (el.textContent.trim().match(regexWholeString)) {
            el.setAttribute('class', 'timestamp')
            return
          }

          el.setAttribute('class', 'chapters')
          el.innerHTML = el.innerHTML.replaceAll(regex, '<span class="timestamp">$&</span>')
        })

      // find & set transcript paragraph timestamps
      const transcriptIndex = paragraphs.findIndex((el) => el.textContent.includes('Transcript:'))
      if (transcriptIndex > -1) {
        const transcriptParagraphs = paragraphs
          .slice(transcriptIndex + 1)
          .filter((el) => el.textContent.match(regex))
        const transcriptCutoffIndex = transcriptParagraphs.length > 12 ? 6 : 0

        if (transcriptCutoffIndex) {
          const cutoffHTML = transcriptParagraphs[transcriptCutoffIndex].innerHTML

          transcriptParagraphs[transcriptCutoffIndex].replaceWith(`
            <div class="transcript-cutoff test"><button type="button" id="transcriptCutoffBtn" @click="onTranscriptToggle"></button></div>
            <p class="timestamp transcript cutoff active">${cutoffHTML}</p>
          `)
        }

        transcriptParagraphs.map((el, i) =>
          el.setAttribute(
            'class',
            `timestamp transcript ${i >= transcriptCutoffIndex ? 'cutoff active' : ''}`
          )
        )
      }
    }

    if (preBlocks?.length) {
      const promises = preBlocks.map(async (c) => {
        const codeRoot = parse(c.text, {
          blockTextElements: {
            code: false,
          },
        })

        const codeBlock = codeRoot.querySelector('code')

        if (codeBlock) {
          const classList = [...codeBlock.classList.values()]
          const lang = this.normalizeLanguage(
            classList.find((list) => list.startsWith('language-'))?.replace('language-', '')
          )

          if (!lang) return

          const outerHTML = codeBlock.outerHTML
          const tagStart = outerHTML.replace('</code>', '')
          let code = c.text.replace(tagStart, '').replace('</code>', '')
          const filepath = code.match(
            /^\/\/ (\w+\/){1,6}\w+.(ts|js|edge|vue|jsx|tsx)((\r\n)?){1,6}/
          )

          if (filepath?.length) {
            code = code.replace(filepath[0], '')
          }

          if (code.startsWith('\n')) {
            code = code.replace('\n', '')
          }

          // older tiptap version newlines
          let lines = code.split('\r\n')

          // newer tiptap version newlines
          if (lines.length === 1) {
            lines = code.split('\n')
          }

          const delLineNumbers = lines
            .map((line, i) => (line.startsWith('--') ? i + 1 : undefined))
            .filter(Boolean)

          const addLineNumbers = lines
            .map((line, i) => (line.startsWith('++') ? i + 1 : undefined))
            .filter(Boolean)

          const codeLessChange = code.replaceAll('\n--', '\n').replaceAll('\n++', '\n')

          let highlighted = highlighter.codeToHtml(codeLessChange, {
            lang,
            themes: { light: 'github-light', dark: 'github-dark' },
            transformers: [
              {
                line(node, line) {
                  if (delLineNumbers.includes(line)) {
                    this.addClassToHast(node, 'del')
                  }

                  if (addLineNumbers.includes(line)) {
                    this.addClassToHast(node, 'add')
                  }
                },
              },
            ],
          })

          const copyCode = this.getCopyCode(code, lang)
          const copy = `<div class="code-copy">${await edge.render('components/clipboard/copy', {
            code: copyCode,
          })}</div>`
          highlighted = highlighted.replace('</pre>', copy + '</pre>')

          const h = parse(highlighted)
          let highlightedCode = highlighted

          if (filepath?.length) {
            const path = filepath[0].replaceAll('\r\n', '').replace('//', '').trim().split('/')
            const iconHtml = await this.getLangIconHtml(lang, filepath[0])
            const filePathHtml = parse(
              `<span class="filepath">${iconHtml}<ul class="filepath-list">${path
                .map((item) => `<li>${item}</li>`)
                .join('')}</ul></span>`
            )
            const rawInnerText = h.firstChild?.rawText ?? ''
            const rawText = rawInnerText + filePathHtml.outerHTML

            highlightedCode = highlighted.replace(rawInnerText, rawText)
          }

          c.replaceWith(highlightedCode)
        }
      })

      await Promise.all(promises)
    }

    this.addUtmTags(root)

    return root.toString()
  }

  addUtmTags(root: HTMLElement) {
    const links = root.querySelectorAll('a')
    const utms = {
      utm_source: 'adocasts.com',
    }

    const utmQueryString = new URLSearchParams(utms).toString()

    links.forEach((link) => {
      try {
        const href = link.getAttribute('href')

        if (!href) {
          return
        }

        if (href.startsWith('http://') || href.startsWith('https://')) {
          const url = new URL(href)

          if (url.search) {
            url.search += '&' + utmQueryString
          } else {
            url.search = utmQueryString
          }

          link.setAttribute('href', url.toString())
        }
      } catch (_error) {
        return
      }
    })

    return root
  }
}

const parser = new ParserService()
export default parser
