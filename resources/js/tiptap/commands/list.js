export const commandList = [
  {
    name: 'h2',
    title: 'Heading 2',
    inline: true,
    basic: false,
    command: ({ editor, range }) => {
      let level = 2
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'h3',
    title: 'Heading 3',
    inline: true,
    command: ({ editor, range }) => {
      let level = 3
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'h4',
    title: 'Heading 4',
    inline: true,
    command: ({ editor, range }) => {
      let level = 4
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setNode('heading', { level }).run()
      callList.toggleHeading({ level }).run()
    },
  },
  {
    name: 'bold',
    title: 'Bold',
    inline: true,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setMark('bold').run()
      callList.toggleMark('bold').run()
    },
  },
  {
    name: 'italic',
    title: 'Italic',
    inline: true,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setMark('italic').run()
      callList.toggleItalic().run()
    },
  },
  {
    name: 'strike',
    title: 'Strikethrough',
    inline: true,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setMark('strikethrough').run()
      callList.toggleStrike().run()
    },
  },
  {
    name: 'blockquote',
    title: 'Blockquote',
    inline: false,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setBlockquote('blockquote').run()
      callList.toggleBlockquote().run()
    },
  },
  {
    name: 'hr',
    title: 'Horizontal Rule',
    inline: false,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).setHorizontalRule('hr').run()
      callList.setHorizontalRule('hr').run()
    },
  },
  {
    name: 'ul',
    title: 'Unordered List',
    inline: false,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).toggleBulletList().run()
      callList.toggleBulletList().run()
    },
  },
  {
    name: 'ol',
    title: 'Ordered List',
    inline: false,
    command: ({ editor, range }) => {
      let callList = editor.chain().focus()
      if (range) return callList.deleteRange(range).toggleOrderedList().run()
      callList.toggleOrderedList().run()
    },
  },
  {
    name: 'img',
    title: 'Image',
    inline: false,
    command: ({ editor, range }) => {
      const url = window.prompt('Enter the image URL')

      if (url === null) return

      let callList = editor.chain().focus()
      return callList.deleteRange(range).setImage({ src: url, alt: 'TODO' }).run()
    },
  },
  {
    name: 'link',
    title: 'Link',
    inline: true,
    command: ({ editor, range }) => {
      const previousUrl = editor.getAttributes('link').href
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
    name: 'html',
    title: 'HTML',
    inline: false,
    basic: false,
    command: ({ editor, range }) => {
      const html = window.prompt('Enter your HTML')

      if (html === null) return

      if (range) editor.chain().focus().deleteRange(range).run()

      editor.commands.insertContent(html)
    }
  }
]
