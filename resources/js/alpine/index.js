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

window.Alpine = Alpine

Alpine.store('app', {
  heroVisible: true,
  heroHeight: 0,
  videoSmall: false,
  videoHeight: 0,
  videoTimestamp: 0,
  videoPlaying: false,
})

Alpine.plugin(intersect)
Alpine.start()
