import intersect from '@alpinejs/intersect'
import Alpine from 'alpinejs'
import './_carousel'
import './_color'
import './_comment'
import './_editor'
import './_header'
import './_lesson'
import './_series'
import './_starfield'
import './_toaster'
import './_turnstile'

window.Alpine = Alpine

Alpine.store('app', {
  heroVisible: true,
  heroHeight: 0,
  videoSmall: false,
  videoHeight: 0,
  videoTimestamp: 0,
  videoPlaying: false,
  showTranscript: document.body.dataset.showTranscript === 'true',

  secondsToTime(totalSeconds) {
    if (typeof totalSeconds === 'string') {
      totalSeconds = Number(totalSeconds)
    }

    const hours = Math.floor(totalSeconds / 3600)

    totalSeconds %= 3600

    const minutes = Math.floor(totalSeconds / 60)

    totalSeconds %= 60

    const seconds = Math.floor(totalSeconds)
    const short = `${(minutes + '').padStart(2, '0')}:${(seconds + '').padStart(2, '0')}`

    if (!hours) {
      return short
    }

    return `${(hours + '').padStart(2, '0')}:${short}`
  }
})

Alpine.plugin(intersect)
Alpine.start()
