/**
 * Sourced from:
 * https://github.com/carlosvaldesweb/tiptap-extension-upload-image/tree/main
 */

import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/
let imagePreview = null
let uploadFn = null

const UploadImage = Node.create({
  name: 'uploadImage',
  onCreate({ editor }) {
    uploadFn = this.options.uploadFn
  },
  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    }
  },
  inline() {
    return this.options.inline
  },
  group() {
    return this.options.inline ? 'inline' : 'block'
  },
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },
  addCommands() {
    return {
      addImage:
        () =>
        ({ commands }) => {
          let fileHolder = document.createElement('input')
          fileHolder.setAttribute('type', 'file')
          fileHolder.setAttribute('accept', 'image/*')
          fileHolder.setAttribute('style', 'visibility:hidden')
          document.body.appendChild(fileHolder)

          let view = this.editor.view
          let schema = this.editor.schema

          fileHolder.addEventListener('change', (e) => {
            if (view.state.selection.$from.parent.inlineContent && e.target.files.length)
              if (typeof uploadFn !== 'function') {
                console.error('uploadFn should be a function')
                return
              }
            startImageUpload(view, e.target.files[0], schema)
            view.focus()
          })
          fileHolder.click()
        },
    }
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match

          return { src, alt, title }
        },
      }),
    ]
  },
  addProseMirrorPlugins() {
    return [placeholderPlugin]
  },
})

//Plugin for placeholder
let placeholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc)
      // See if the transaction adds or removes any placeholders
      let action = tr.getMeta(this)
      if (action && action.add) {
        let widget = document.createElement('div')
        let img = document.createElement('img')
        widget.classList = 'image-uploading'
        img.src = imagePreview
        widget.appendChild(img)
        let deco = Decoration.widget(action.add.pos, widget, { id: action.add.id })
        set = set.add(tr.doc, [deco])
      } else if (action && action.remove) {
        set = set.remove(set.find(null, null, (spec) => spec.id == action.remove.id))
      }
      return set
    },
  },
  props: {
    decorations(state) {
      return this.getState(state)
    },
  },
})

//Find the placeholder in editor
function findPlaceholder(state, id) {
  let decos = placeholderPlugin.getState(state)
  let found = decos.find(null, null, (spec) => spec.id == id)
  return found.length ? found[0].from : null
}

function startImageUpload(view, file, schema) {
  imagePreview = URL.createObjectURL(file)
  // A fresh object to act as the ID for this upload
  let id = {}

  // Replace the selection with a placeholder
  let tr = view.state.tr
  if (!tr.selection.empty) tr.deleteSelection()
  tr.setMeta(placeholderPlugin, { add: { id, pos: tr.selection.from } })
  view.dispatch(tr)
  uploadFn(file).then(
    (url) => {
      let pos = findPlaceholder(view.state, id)
      // If the content around the placeholder has been deleted, drop
      // the image
      if (pos == null) return
      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      view.dispatch(
        view.state.tr
          .replaceWith(pos, pos, schema.nodes.uploadImage.create({ src: url }))
          .setMeta(placeholderPlugin, { remove: { id } })
      )
    },
    (e) => {
      // On failure, just clean up the placeholder
      view.dispatch(tr.setMeta(placeholderPlugin, { remove: { id } }))
    }
  )
}
export default UploadImage
