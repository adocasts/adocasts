import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Commands from './commands'
import { getSuggestions } from './commands/suggestions'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import CodeBlock from '@tiptap/extension-code-block'
import { commandList } from './commands/list'
import { languages } from '../syntax/languages'
import Blockquote from '@tiptap/extension-blockquote'
import Dropcursor from '@tiptap/extension-dropcursor'
import HardBreak from '@tiptap/extension-hard-break'
import CharacterCount from '@tiptap/extension-character-count'
import YouTube from '@tiptap/extension-youtube'
import Image from '@tiptap/extension-image'
import { Typography } from '@tiptap/extension-typography'
import { Mention } from './mentions'
import mentionSuggestions from './mentions/suggestions'
import UploadImage from './upload_image'
import axios from 'axios'

export const setupEditor = function (content, isFreeUser = true) {
  let editor

  return {
    editor: null,

    isInitialized: false,
    isFocused: false,
    content: content,
    updatedAt: Date.now(), // force Alpine to rerender on selection change

    language: 'ts',
    languages: [...languages],

    characterLimit: isFreeUser ? 500 : null,
    characterCount: 0,

    isActive(type, opts = {}) {
      return editor.isActive(type, opts)
    },

    chain() {
      return editor.chain()
    },

    command(name) {
      return commandList.find((cmd) => cmd.name === name).command({ editor })
    },

    init() {
      const tieredExtensions = isFreeUser
        ? [
            CharacterCount.configure({
              limit: this.characterLimit,
            }),
          ]
        : [
            YouTube.configure({
              width: 1280,
              height: 720,
            }),
            UploadImage.configure({
              uploadFn: this.uploadImage,
            }),
          ]

      this.editor = new Editor({
        element: this.$refs.element,
        extensions: [
          ...tieredExtensions,
          StarterKit,
          BubbleMenu.configure({
            element: document.querySelector('.bubble-menu'),
          }),
          Placeholder.configure({
            placeholder: 'Type / to see available commands',
          }),
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
            addNodeView() {
              return (props) => {
                const container = document.createElement('div')
                container.classList.add('code-block', 'relative')
                container.dataset.nodeViewWrapper = ''

                const content = document.createElement('pre')
                const code = document.createElement('code')
                code.style = 'white-space: pre-wrap;'
                content.append(code)
                container.append(content)

                const selector = document.createElement('select')
                selector.classList.add(
                  'absolute',
                  'top-1',
                  'right-1',
                  'rounded',
                  'text-xs',
                  'text-gray-200',
                  'bg-gray-900',
                  'border-gray-800',
                  'px-2',
                  'py-1'
                )
                selector.contentEditable = false
                selector.addEventListener('change', (e) => {
                  const view = props.editor.view
                  const language = e.target.value
                  view.dispatch(
                    view.state.tr.setNodeMarkup(props.getPos(), undefined, { language })
                  )
                })
                languages.map((lang) => {
                  const option = document.createElement('option')
                  option.value = lang.code
                  option.textContent = lang.name
                  option.selected = lang.code === props.node.attrs.language
                  selector.append(option)
                })
                container.append(selector)

                return {
                  dom: container,
                  contentDOM: content,
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
        onSelectionUpdate: () => {
          this.updatedAt = Date.now()
        },
      })

      this.isInitialized = true

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
