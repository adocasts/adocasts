import Starback from 'starback'
import Alpine from 'alpinejs'

Alpine.data('starfield', () => {
  const isReducedMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
  return {
    init() {
      if (isReducedMotion) return
      if (this.$refs.canvasLine) {
        new Starback(this.$refs.canvasLine, {
          type: 'line',
          quantity: 25,
          speed: 5,
          frequency: 75,
          slope: { x: -1, y: 10 },
          directionX: 1,
          speed: 3,
          spread: -3,
          width: this.$refs.canvasLine.parentElement.clientWidth,
          height: this.$refs.canvasLine.parentElement.clientHeight,
          backgroundColor: 'transparent',
        })
      }
    
      if (this.$refs.canvasDot) {
        new Starback(this.$refs.canvasDot, {
          type: 'dot',
          quantity: 100,
          direction: 200,
          starSize: [0,1],
          width: this.$refs.canvasDot.parentElement.clientWidth,
          height: this.$refs.canvasDot.parentElement.clientHeight,
          backgroundColor: 'transparent',
          randomOpacity: true,
        })
      }
    }
  }
})