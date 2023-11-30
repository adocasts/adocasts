import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
 
Alpine.plugin(intersect)

window.Alpine = Alpine

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

Alpine.start()