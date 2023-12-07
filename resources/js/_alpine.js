import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { setupEditor } from './tiptap/basic'

Alpine.plugin(intersect)

window.Alpine = Alpine

Alpine.data('setupEditor', setupEditor)

Alpine.data('mouseParallax', function (refNames = [], transforms = '') {
  return {
    init() {
      document.addEventListener('mousemove', this.onMove.bind(this))
    },

    destroy() {
      document.removeEventListener('mousemove', this.onMove.bind(this))
    },

    onMove(event) {
      refNames.map(ref => {
        const el = this.$refs[ref]
        const position = el.getAttribute("value") || 5
        const x = (window.innerWidth - event.pageX * position) / 90
        const y = (window.innerHeight - event.pageY * position) / 90

        el.style.transform = `${transforms} translateX(${x}px) translateY(${y}px)`
      })
    }
  }
})

Alpine.data('comments', function () {
  return {
    editId: null,
    createId: null,
    create(createId) {
      this.cancel()
      this.createId = createId
    },
    edit(editId) {
      this.cancel()
      this.editId = editId
    },
    cancel() {
      this.editId = null
      this.createId = null
    }
  }
})

Alpine.data('turnstile', function () {
  return {
    onRender(sitekey) {
      turnstile.render(this.$el, {
        sitekey,
        callback: function(token) {},
      })
    }
  }
})

Alpine.start()