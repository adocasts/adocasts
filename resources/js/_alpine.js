import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { setupEditor } from './tiptap/basic'

Alpine.plugin(intersect)

window.Alpine = Alpine

Alpine.store('app', {
  heroVisible: true, 
  heroHeight: 0, 
  videoSmall: false,
  videoHeight: 0,
  videoPlaying: false
})

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

Alpine.data('videoPlaceholder', () => {
  return {
    open() {
      document.querySelector('[video-placeholder]').classList.remove('hidden')
    },

    close() {
      console.log('closing video player')
      window.player?.pause()
      document.querySelector('[video-placeholder]').classList.add('hidden')
    }
  }
})

Alpine.data('videoAutoPlayNext', (enabled = true, nextLessonUrl) => {
  return {
    enabled: nextLessonUrl ? enabled : false,
    displayed: false,
    timeRemaining: 100, // start at some number outside threshold
    threshold: 15, // remaining seconds to display countdown

    onTimeUpdate(event) {
      if (!this.enabled) return

      const player = event.detail.player
      const { currentTime, duration } = player
      const remaining = chain(duration).subtract(currentTime).done()

      this.timeRemaining = Math.floor(remaining)
      this.displayed = this.timeRemaining <= this.threshold

      if (this.timeRemaining === 0) {
        this.onPlayNext()
      }
    },

    onPlayNext() {
      if (!this.enabled) return

      window.up.visit(nextLessonUrl + '?autoplay=1')
    },

    onCancel() {
      this.enabled = false
      this.displayed = false
    }
  }
})

Alpine.start()