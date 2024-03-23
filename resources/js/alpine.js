import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import ajax from '@imacrayon/alpine-ajax'
import { setupEditor } from './tiptap/basic'
import { DateTime } from 'luxon'

const isReducedMotion =
  window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
  window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true

Alpine.plugin(intersect)
Alpine.plugin(ajax)

window.DateTime = DateTime
window.Alpine = Alpine

Alpine.store('app', {
  heroVisible: true,
  heroHeight: 0,
  videoSmall: false,
  videoHeight: 0,
  videoTimestamp: 0,
  videoPlaying: false,
})

Alpine.data('setupEditor', setupEditor)

Alpine.data('mouseParallax', function (refNames = [], transforms = '') {
  let onMouseMove
  return {
    exists: true,

    init() {
      if (isReducedMotion) return

      onMouseMove = this.onMove.bind(this)
      document.addEventListener('mousemove', onMouseMove)

      this.$watch('exists', (value) => !value && this.destroy())
    },

    destroy() {
      document.removeEventListener('mousemove', onMouseMove)
    },

    onMove(event) {
      refNames.map((ref) => {
        const el = this.$refs[ref]

        if (!el) this.destroy()

        const position = el.getAttribute('value') || 5
        const x = (window.innerWidth - event.pageX * position) / 90
        const y = (window.innerHeight - event.pageY * position) / 90

        el.style.transform = `${transforms} translateX(${x}px) translateY(${y}px)`
      })
    },
  }
})

Alpine.data('credits', function () {
  let interval = null

  return {
    exists: true,
    play: true,

    init() {
      if (isReducedMotion) return

      setTimeout(() => {
        interval = setInterval(() => {
          if (this.play && this.$el.scrollTop !== this.$el.scrollTopMax) this.$el.scrollTop += 10
        }, 60)

        this.$watch('exists', (value) => !value && this.destroy())
      }, 2500)
    },

    destroy() {
      clearInterval(interval)
    },
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
    },
  }
})

Alpine.data('turnstile', function () {
  return {
    onRender(sitekey) {
      turnstile.render(this.$el, {
        sitekey,
        callback: function (token) {},
      })
    },
  }
})

Alpine.data('progressRing', function (percentage, width) {
  return {
    isOpen: false,
    sideOpen: false,
    percentage: percentage,
    circumference: Math.round(Math.PI * (2 * width)),
  }
})

Alpine.data('videoPlaceholder', () => {
  return {
    open() {
      document.querySelector('[video-placeholder]').classList.remove('hidden')
    },

    close() {
      console.log('closing video player')

      if (typeof window.player?.pause === 'function') {
        window.player.pause()
      } else if (typeof window.player?.stopVideo === 'function') {
        window.player.stopVideo()
      }

      document.querySelector('[video-placeholder]').classList.add('hidden')
    },
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

      const { currentTime, duration } = event.detail
      const remaining = duration - currentTime

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
    },
  }
})

Alpine.data('proseBody', function () {
  return {
    init() {
      this.registerAnchors()
    },

    registerAnchors() {
      const article = document.getElementById('proseBody')
      const postAnchorLinks = Array.from(
        article.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
      )

      postAnchorLinks.map((heading) => {
        const anchor = document.createElement('a')
        anchor.setAttribute('aria-hidden', 'true')
        anchor.setAttribute('tabindex', '-1')
        anchor.setAttribute('href', `#${heading.id}`)
        anchor.setAttribute(
          'class',
          'hidden md:block md:absolute md:-left-8 top-2 opacity-0 group-hover:opacity-100 text-slate-600 duration-300'
        )
        anchor.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clip-rule="evenodd"></path></svg>`
        heading.classList.add('relative')
        heading.classList.add('group')
        heading.appendChild(anchor)
      })
    },

    onTranscriptToggle() {
      const transcriptBtn = document.getElementById('transcriptCutoffBtn')
      const transcriptCutoff = Array.from(document.querySelectorAll('.prose .transcript.cutoff'))
      transcriptBtn.parentElement.classList.toggle('active')
      transcriptCutoff.map((el) => el.classList.toggle('active'))
    },
  }
})

Alpine.data('countdown', ({ dateTime }) => {
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
    },
  }
})

Alpine.start()
