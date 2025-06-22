import intersect from '@alpinejs/intersect'
import Alpine from 'alpinejs'
import './_carousel'
import './_color'
import './_comment'
import './_editor'
import './_header'
import './_series'
import './_lesson'
import './_toaster'
import './_starfield'

window.Alpine = Alpine

Alpine.plugin(intersect)
Alpine.start()
