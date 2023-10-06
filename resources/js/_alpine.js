import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { DateTime } from 'luxon'
import { chain } from 'mathjs'

Alpine.plugin(intersect)

Alpine.data('drawer', function () {
  return {
    init() {
      document.body.classList.add('overflow-hidden')
    },
    destroy() {
      document.body.classList.remove('overflow-hidden')
      this.$el.remove()
    }
  }
})

Alpine.data('modal', function () {
  return {
    closeModal(modal) {
      modal.classList.add('closing')
      modal.addEventListener('animationend', () => modal.remove(), { once: true })
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

      window.location.href = nextLessonUrl + '?autoplay=1'
    },

    onCancel() {
      this.enabled = false
      this.displayed = false
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

window.countdown = function ({ dateTime }) {
  return {
    target: dateTime,
    interval: null,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,

    init() {
      const target = DateTime.fromISO(dateTime)

      this.interval = setInterval(() => {
        const { milliseconds } = target.diff(DateTime.now(), ['milliseconds'])
        
        this.days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
        this.hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        this.minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
        this.seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

        if (!this.days && !this.hours && !this.minutes && !this.seconds) {
          clearInterval(this.interval)
        }
      }, 1000)
    },
    destroy() {
      clearInterval(this.interval)
    }
  }
}

Alpine.start()
