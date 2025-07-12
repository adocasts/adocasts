
export const commandList = [
  {
    name: 'h2',
    title: 'Heading 2',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M156 56v120a12 12 0 0 1-24 0v-48H52v48a12 12 0 0 1-24 0V56a12 12 0 0 1 24 0v48h80V56a12 12 0 0 1 24 0m84 140h-24l28.74-38.33A36 36 0 1 0 182.05 124a12 12 0 0 0 22.63 8a11.67 11.67 0 0 1 1.73-3.22a12 12 0 1 1 19.15 14.46L182.4 200.8A12 12 0 0 0 192 220h48a12 12 0 0 0 0-24"/></svg>',
    inline: true,
    basic: false,
    command: ({ editor, range }) => {
      let level = 2
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'h3',
    title: 'Heading 3',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M252 180a40 40 0 0 1-68.57 28a12 12 0 1 1 17.14-16.79A16 16 0 1 0 212 164a12 12 0 0 1-9.83-18.88L217 124h-25a12 12 0 0 1 0-24h48a12 12 0 0 1 9.83 18.88l-18.34 26.2A40 40 0 0 1 252 180M144 44a12 12 0 0 0-12 12v48H52V56a12 12 0 0 0-24 0v120a12 12 0 0 0 24 0v-48h80v48a12 12 0 0 0 24 0V56a12 12 0 0 0-12-12"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      let level = 3
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'h4',
    title: 'Heading 4',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M256 176a12 12 0 0 1-12 12v20a12 12 0 0 1-24 0v-20h-36a12 12 0 0 1-11.38-15.79l24-72a12 12 0 0 1 22.76 7.58L200.65 164H220v-20a12 12 0 0 1 24 0v20a12 12 0 0 1 12 12M144 44a12 12 0 0 0-12 12v48H52V56a12 12 0 0 0-24 0v120a12 12 0 0 0 24 0v-48h80v48a12 12 0 0 0 24 0V56a12 12 0 0 0-12-12"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      let level = 4
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'bold',
    title: 'Bold',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M177.08 114.46A48 48 0 0 0 140 36H72a12 12 0 0 0-12 12v152a12 12 0 0 0 12 12h80a52 52 0 0 0 25.08-97.54M84 60h56a24 24 0 0 1 0 48H84Zm68 128H84v-56h68a28 28 0 0 1 0 56"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setMark('bold').run()
      callList.toggleMark('bold').run()
    },
  },
  {
    name: 'italic',
    title: 'Italic',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M204 56a12 12 0 0 1-12 12h-31.35l-40 120H144a12 12 0 0 1 0 24H64a12 12 0 0 1 0-24h31.35l40-120H112a12 12 0 0 1 0-24h80a12 12 0 0 1 12 12"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setMark('italic').run()
      callList.toggleItalic().run()
    },
  },
  {
    name: 'strike',
    title: 'Strikethrough',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M228 128a12 12 0 0 1-12 12h-30.14A41.48 41.48 0 0 1 196 168c0 14.45-7.81 28.32-21.43 38.05C162 215.05 145.44 220 128 220s-34-4.95-46.57-13.95C67.81 196.32 60 182.45 60 168a12 12 0 0 1 24 0c0 15.18 20.15 28 44 28s44-12.82 44-28c0-12.76-9.3-20.18-35.35-28H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M75.11 100a12 12 0 0 0 12-12c0-16 17.58-28 40.89-28c17.36 0 31.37 6.65 37.48 17.78a12 12 0 0 0 21-11.56C176.13 47.3 154.25 36 128 36c-37 0-64.89 22.35-64.89 52a12 12 0 0 0 12 12"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setMark('strikethrough').run()
      callList.toggleStrike().run()
    },
  },
  {
    name: 'link',
    title: 'Link',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M136.37 187.53a12 12 0 0 1 0 17l-5.94 5.94a60 60 0 0 1-84.88-84.88l24.12-24.11A60 60 0 0 1 152 99a12 12 0 1 1-16 18a36 36 0 0 0-49.37 1.47l-24.1 24.08a36 36 0 0 0 50.92 50.92l5.94-5.94a12 12 0 0 1 16.98 0m74.08-142a60.09 60.09 0 0 0-84.88 0l-5.94 5.94a12 12 0 0 0 17 17l5.94-5.94a36 36 0 0 1 50.92 50.92l-24.11 24.12A36 36 0 0 1 120 139a12 12 0 1 0-16 18a60 60 0 0 0 82.3-2.43l24.12-24.11a60.09 60.09 0 0 0 .03-84.91Z"/></svg>',
    inline: true,
    command: ({ editor, range }) => {
      const previousUrl = Alpine.raw(editor).getAttributes('link').href
      const url = window.prompt('Enter your link URL', previousUrl)

      if (url === null) return

      let callList = editor.chain().focus()
      if (range) callList.deleteRange(range)

      if (url === '') {
        callList.extendMarkRange('link').unsetLink().run()
        return
      }

      callList.extendMarkRange('link').setLink({ href: url }).run()
    }
  },
  {
    name: 'blockquote',
    title: 'Blockquote',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M116 72v88a48.05 48.05 0 0 1-48 48a8 8 0 0 1 0-16a32 32 0 0 0 32-32v-8H40a16 16 0 0 1-16-16V72a16 16 0 0 1 16-16h60a16 16 0 0 1 16 16m100-16h-60a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h60v8a32 32 0 0 1-32 32a8 8 0 0 0 0 16a48.05 48.05 0 0 0 48-48V72a16 16 0 0 0-16-16"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setBlockquote('blockquote').run()
      callList.toggleBlockquote().run()
    },
  },
  {
    name: 'hr',
    title: 'Horizontal Rule',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M235.32 96L96 235.31a16 16 0 0 1-22.63 0l-52.69-52.68a16 16 0 0 1 0-22.63l29.17-29.17a4 4 0 0 1 5.66 0l34.83 34.83a8 8 0 0 0 11.71-.43a8.18 8.18 0 0 0-.6-11.09l-34.63-34.63a4 4 0 0 1 0-5.65l15-15a4 4 0 0 1 5.66 0l34.83 34.83a8 8 0 0 0 11.71-.43a8.18 8.18 0 0 0-.6-11.09L98.83 87.51a4 4 0 0 1 0-5.65l15-15a4 4 0 0 1 5.65 0l34.83 34.83a8 8 0 0 0 11.72-.43a8.18 8.18 0 0 0-.61-11.09l-34.59-34.66a4 4 0 0 1 0-5.65L160 20.69a16 16 0 0 1 22.63 0l52.69 52.68a16 16 0 0 1 0 22.63"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).setHorizontalRule('hr').run()
      callList.setHorizontalRule('hr').run()
    },
  },
  {
    name: 'ul',
    title: 'Unordered List',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M76 64a12 12 0 0 1 12-12h128a12 12 0 0 1 0 24H88a12 12 0 0 1-12-12m140 52H88a12 12 0 0 0 0 24h128a12 12 0 0 0 0-24m0 64H88a12 12 0 0 0 0 24h128a12 12 0 0 0 0-24M44 112a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0-64a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0 128a16 16 0 1 0 16 16a16 16 0 0 0-16-16"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).toggleBulletList().run()
      callList.toggleBulletList().run()
    },
  },
  {
    name: 'ol',
    title: 'Ordered List',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M228 128a12 12 0 0 1-12 12H116a12 12 0 0 1 0-24h100a12 12 0 0 1 12 12M116 76h100a12 12 0 0 0 0-24H116a12 12 0 0 0 0 24m100 104H116a12 12 0 0 0 0 24h100a12 12 0 0 0 0-24M44 59.31V104a12 12 0 0 0 24 0V40a12 12 0 0 0-17.36-10.73l-16 8a12 12 0 0 0 9.36 22Zm39.73 96.86a27.7 27.7 0 0 0-11.2-18.63A28.89 28.89 0 0 0 32.9 143a27.71 27.71 0 0 0-4.17 7.54a12 12 0 0 0 22.55 8.21a4 4 0 0 1 .58-1a4.78 4.78 0 0 1 6.5-.82a3.82 3.82 0 0 1 1.61 2.6a3.63 3.63 0 0 1-.77 2.77l-.13.17l-28.68 38.35A12 12 0 0 0 40 220h32a12 12 0 0 0 0-24h-8l14.28-19.11a27.48 27.48 0 0 0 5.45-20.72"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) return callList.deleteRange(range).toggleOrderedList().run()
      callList.toggleOrderedList().run()
    },
  },
  {
    name: 'img',
    title: 'Image URL',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12M40 200v-28l52-52l80 80Zm176 0h-21.37l-36-36l20-20L216 181.38z"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      const url = window.prompt('Enter the image URL')

      if (url === null) return

      let callList = Alpine.raw(editor).chain().focus()
      return callList.deleteRange(range).setImage({ src: url, alt: 'TODO' }).run()
    },
  },
  {
    // isPlusOnly: true,
    name: 'imgUpload',
    title: 'Image Upload',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-60 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12M40 200v-28l52-52l80 80Zm176 0h-21.37l-36-36l20-20L216 181.38z"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      let callList = Alpine.raw(editor).chain().focus()
      if (range) callList.deleteRange(range)
      return callList.addImage().run()
    }
  },
  {
    // isPlusOnly: true,
    name: 'youtube',
    title: 'YouTube Embed',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M234.33 69.52a24 24 0 0 0-14.49-16.4C185.56 39.88 131 40 128 40s-57.56-.12-91.84 13.12a24 24 0 0 0-14.49 16.4C19.08 79.5 16 97.74 16 128s3.08 48.5 5.67 58.48a24 24 0 0 0 14.49 16.41C69 215.56 120.4 216 127.34 216h1.32c6.94 0 58.37-.44 91.18-13.11a24 24 0 0 0 14.49-16.41c2.59-10 5.67-28.22 5.67-58.48s-3.08-48.5-5.67-58.48m-72.11 61.81l-48 32A4 4 0 0 1 108 160V96a4 4 0 0 1 6.22-3.33l48 32a4 4 0 0 1 0 6.66"/></svg>',
    inline: false,
    command: ({ editor, range }) => {
      const url = window.prompt('Enter the URL of the YouTube video you want to embed')

      if (url === null) return

      let callList = Alpine.raw(editor).chain().focus()
      if (range) callList.deleteRange(range)

      callList.setYoutubeVideo({ src: url }).run()
    }
  },
  {
    name: 'html',
    title: 'HTML',
    icon: '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M71.68 97.22L34.74 128l36.94 30.78a12 12 0 1 1-15.36 18.44l-48-40a12 12 0 0 1 0-18.44l48-40a12 12 0 0 1 15.36 18.44m176 21.56l-48-40a12 12 0 1 0-15.36 18.44L221.26 128l-36.94 30.78a12 12 0 1 0 15.36 18.44l48-40a12 12 0 0 0 0-18.44M164.1 28.72a12 12 0 0 0-15.38 7.18l-64 176a12 12 0 0 0 7.18 15.37a11.79 11.79 0 0 0 4.1.73a12 12 0 0 0 11.28-7.9l64-176a12 12 0 0 0-7.18-15.38"/></svg>',
    inline: false,
    basic: false,
    command: ({ editor, range }) => {
      const html = window.prompt('Enter your HTML')

      if (html === null) return

      if (range) Alpine.raw(editor).chain().focus().deleteRange(range).run()

      Alpine.raw(editor).commands.insertContent(html)
    }
  }
]
