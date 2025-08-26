import { Editor } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import CodeBlock from '@tiptap/extension-code-block'
import Dropcursor from '@tiptap/extension-dropcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import YouTube from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'
import highlighterPromise from '../shiki'
import { languages } from '../syntax/languages'
import Commands from './commands'
import { commandList } from './commands/list'
import { getSuggestions } from './commands/suggestions'
import { Mention } from './mentions'
import mentionSuggestions from './mentions/suggestions'
import UploadImage from './upload_image'

const getLanguageName = (code) => {
  const match = languages.find((lang) => lang.code === code)
  return match?.name || code
}

export const setupEditor = function ({
  value = '',
  placeholder = 'Type / to see available commands',
  isFreeUser = true,
}) {
  return {
    editor: null,

    isInitialized: false,
    isFocused: false,
    content: value,
    updatedAt: Date.now(), // force Alpine to rerender on selection change

    language: 'ts',
    languages: [...languages],

    characterLimit: null,
    characterCount: 0,

    isActive(type, opts = {}) {
      return this.editor?.isActive(type, opts)
    },

    chain() {
      return this.editor.chain()
    },

    command(name) {
      return commandList.find((cmd) => cmd.name === name).command({ editor: this.editor })
    },

    async init() {
      const highlighter = await highlighterPromise

      // removing free account restrictions
      const tieredExtensions = [
        YouTube.configure({
          width: 1280,
          height: 720,
        }),
        UploadImage.configure({
          uploadFn: this.uploadImage,
        }),
      ]

      this.editor = new Editor({
        element: this.$el.querySelector('[tiptap-editor]'),
        extensions: [
          ...tieredExtensions,
          StarterKit,
          BubbleMenu.configure({
            element: document.querySelector('.bubble-menu'),
          }),
          Placeholder.configure({ placeholder }),
          Link.configure({
            autolink: true,
            linkOnPaste: true,
            HTMLAttributes: {
              target: '_blank',
              rel: 'nofollow noopener noreferrer',
            },
          }),
          Blockquote.configure({}),
          Dropcursor.configure({}),
          HardBreak.configure({}),
          Image.configure({}),
          Typography.configure({
            openDoubleQuote: false,
            closeDoubleQuote: false,
            openSingleQuote: false,
            closeSingleQuote: false,
          }),

          Mention.configure({
            HTMLAttributes: {
              class: 'mention',
            },
            suggestion: mentionSuggestions,
            renderHTML({ node, HTMLAttributes }) {
              return [
                'a',
                mergeAttributes(
                  { 'data-type': this.name },
                  { 'href': `/${HTMLAttributes['data-id']}`, 'up-follow': true },
                  this.options.HTMLAttributes,
                  HTMLAttributes
                ),
                this.options.renderLabel({
                  options: this.options,
                  node,
                }),
              ]
            },
          }),
          CodeBlock.configure({
            languageClassPrefix: 'language-',
            HTMLAttributes: {
              class: 'code-block',
            },
          }).extend({
            addAttributes() {
              return {
                language: {
                  default: 'plaintext',
                  parseHTML: (el) => el.getAttribute('data-language') || 'plaintext',
                  renderHTML: (attrs) => ({ 'data-language': attrs.language }),
                },
                showSelect: {
                  default: false,
                  parseHTML: (el) => el.getAttribute('data-show-select') === 'true',
                  renderHTML: (attrs) => (attrs.showSelect ? { 'data-show-select': 'true' } : null),
                },
              }
            },
            addNodeView() {
              return (props) => {
                const container = document.createElement('div')
                container.classList.add('code-block', 'relative')

                const contentDOM = document.createElement('div')
                contentDOM.classList.add('hidden-content')
                
                const pre = document.createElement('pre')
                const code = document.createElement('code')
                pre.appendChild(code)
                contentDOM.appendChild(pre)
                container.appendChild(contentDOM)

                const shikiDOM = document.createElement('div')
                container.appendChild(shikiDOM)

                const selectParent = document.createElement('div')
                const selectPlaceholder = document.createElement('div')
                const select = document.createElement('select')
                selectParent.classList.add('language-selector', 'absolute', 'top-1', 'right-1')

                selectPlaceholder.classList.add('language-selector-placeholder')
                select.classList.add('language-selector-select')
                
                select.contentEditable = false
                selectPlaceholder.textContent = getLanguageName(props.node.attrs.language)

                languages.forEach((lang) => {
                  const option = document.createElement('option')
                  option.value = lang.code
                  option.textContent = lang.name
                  if (lang.code === props.node.attrs.language) {
                    option.selected = true
                  }
                  if (lang.hide) {
                    option.style.display = 'none';
                  }
                  select.appendChild(option)
                })

                const setView = (state) => {
                  props.editor.view.dispatch(
                    props.editor.view.state.tr.setNodeMarkup(props.getPos(), undefined, {
                      ...props.node.attrs,
                      ...state
                    })
                  )
                }

                selectPlaceholder.addEventListener('click', () => {
                  setView({ showSelect: true })
                })

                select.addEventListener('change', (e) => {
                  const newLang = e.target.value
                  selectPlaceholder.textContent = newLang
                  setView({ language: newLang, showSelect: false })
                })

                select.addEventListener('blur', (e) => {
                  setView({ showSelect: false })
                })

                selectParent.appendChild(selectPlaceholder)
                selectParent.appendChild(select)
                container.appendChild(selectParent)

                // Highlight initial content
                const renderHighlight = (codeText, lang) => {
                  const html = highlighter.codeToHtml(codeText, {
                    lang,
                    themes: {
                      light: 'github-light',
                      dark: 'github-dark',
                    },
                  })

                  shikiDOM.innerHTML = html
                }

                shikiDOM.innerHTML = props.node.textContent
                renderHighlight(props.node.textContent, props.node.attrs.language)

                return {
                  dom: container,
                  contentDOM: code,
                  update: (updatedNode) => {
                    if (updatedNode.type !== props.node.type) return false

                    const oldCode = props.node.textContent
                    const newCode = updatedNode.textContent

                    const oldLang = props.node.attrs.language
                    const newLang = updatedNode.attrs.language

                    if (newCode !== oldCode || newLang !== oldLang) {
                      renderHighlight(newCode, newLang)
                      if (select.value !== newLang) {
                        select.value = newLang
                        selectPlaceholder.textContent = getLanguageName(newLang)
                      }
                    }

                    const oldShowSelect = props.node.attrs.showSelect
                    const newShowSelect = updatedNode.attrs.showSelect

                    if (oldShowSelect !== newShowSelect) {
                      if (newShowSelect) {
                        selectPlaceholder.style.display = 'none'
                        select.style.display = 'block'
                      } else {
                        selectPlaceholder.style.display = 'block'
                        select.style.display = 'none'
                      }
                    }

                    return true
                  },
                }
              }
            },
          }),
          Commands.configure({
            suggestion: getSuggestions({ isBasic: true, isFreeUser }),
          }),
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML()

          if (this.characterLimit) {
            this.characterCount = editor.storage.characterCount.characters()
          }
        },
        onFocus: () => {
          this.isFocused = true
        },
        onBlur: () => {
          this.isFocused = false
        },
        onSelectionUpdate: (e) => {
          this.updatedAt = Date.now()
        },
      })

      this.isInitialized = true
      this.$el.querySelector('[tiptap-loader]')?.remove()

      if (this.characterLimit) {
        this.characterCount = this.editor.storage.characterCount.characters()
      }
    },

    async uploadImage(file) {
      const payload = new FormData()

      payload.append('file', file)

      try {
        const { data } = await axios.post('/api/image/upload', payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        return data.url
      } catch (error) {
        if (error.response?.data?.errors?.length) {
          return window.toast(error.response.data.errors[0].message, { type: 'error' })
        }
        window.toast(error.message, { type: 'error' })
      }
    },
  }
}
