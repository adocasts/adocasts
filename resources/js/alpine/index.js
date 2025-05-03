import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import './_header'
import './_series'
import './_carousel'
import './_starfield'
import './_editor'

window.Alpine = Alpine

Alpine.plugin(intersect)
Alpine.start()
