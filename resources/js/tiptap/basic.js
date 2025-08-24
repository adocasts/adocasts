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
import { languages } from '../syntax/languages'
import Commands from './commands'
import { commandList } from './commands/list'
import { getSuggestions } from './commands/suggestions'
import { Mention } from './mentions'
import mentionSuggestions from './mentions/suggestions'
import UploadImage from './upload_image'

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
      return this.editor.isActive(type, opts)
    },

    chain() {
      return this.editor.chain()
    },

    command(name) {
      return commandList.find((cmd) => cmd.name === name).command({ editor: this.editor })
    },

    init() {
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
                  'language-selector',
                  'absolute',
                  'top-1',
                  'right-1',
                  'rounded',
                  'text-xs',
                  'text-gray-200',
                  'bg-gray-900',
                  'border-gray-800',
                  'px-2',
                  'py-1',
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

                const updateFocusClass = () => {
                  const { from, to } = props.editor.state.selection
                  const pos = props.getPos()
                  const isFocused = from >= pos && to <= pos + props.node.nodeSize
                  container.classList.toggle('is-focused', isFocused)
                }

                updateFocusClass()
                props.editor.on('selectionUpdate', updateFocusClass)

                return {
                  dom: container,
                  contentDOM: code,
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
          console.log('selectionUpdate', { e })
          // const isCodeBlock = this.editor.isActive('codeBlock');
          // document.getElementById('language-selector')!.style.display = isCodeBlock ? 'block' : 'none';
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
