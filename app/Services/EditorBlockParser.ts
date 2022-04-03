import Post from 'App/Models/Post'
import Application from '@ioc:Adonis/Core/Application'
const BlockParser = require('editorjs-parser')
const shiki = require('shiki')

async function highlightCode(code: string, languageCode: string) {
  const highlighter = await shiki.getHighlighter({
    theme: 'github-dark',
    langs: [...shiki.BUNDLED_LANGUAGES,
      {
        id: 'edge',
        scopeName: 'text.html.edge',
        path: Application.publicPath('/shiki/edge.json')
      }
    ]
  })

  return highlighter.codeToHtml(code, { lang: languageCode })
}

class EditorBlockParser {
  public parser: any

  constructor() {
    this.parser = new BlockParser(undefined, this.getCustomParsers())
  }

  public async parse(post: Post) {
    const html = typeof post.bodyBlocks === 'string'
      ? this.parseBlocks(JSON.parse(post.bodyBlocks))
      : this.parseBlocks(post.bodyBlocks)

    post.body = await html
  }

  public async parseBlocks(blocks: any[] | any) {
    let html = ''

    if (typeof blocks == 'object') {
      blocks = blocks.blocks
    }

    for (let i = 0; i < blocks.length; i++) {
      const blockHtml = await this.parseBlock(blocks[i])
      html += blockHtml
    }

    return html
  }

  public async parseBlock(block: any) {
    return this.parser.parseBlock(block)
  }

  private getCustomParsers() {
    return {
      code: async function(data, _config) {
        return highlightCode(data.code, data.languageCode)
      }
    }
  }
}

export default new EditorBlockParser()
