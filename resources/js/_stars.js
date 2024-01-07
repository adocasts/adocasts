import Starback from 'starback'
import Alpine from 'alpinejs'

Alpine.data('starfield', () => {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true

  return {
    line: null,
    dot: null,

    init() {
      this.create()
    },

    redraw() {
      this.create()
    },

    create() {
      if (isReducedMotion) return
      if (this.$refs.canvasLine) {
        this.line = new Starback(this.$refs.canvasLine, {
          type: 'line',
          quantity: 15,
          speed: 5,
          frequency: 100,
          slope: { x: -1, y: 10 },
          directionX: 1,
          speed: 5,
          spread: -3,
          width: this.$refs.canvasLine.parentElement.clientWidth,
          height: this.$refs.canvasLine.parentElement.clientHeight,
          backgroundColor: 'transparent',
        })
      }

      if (this.$refs.canvasDot) {
        this.dot = new Starback(this.$refs.canvasDot, {
          type: 'dot',
          quantity: 100,
          direction: 200,
          starSize: [0, 1],
          width: this.$refs.canvasDot.parentElement.clientWidth,
          height: this.$refs.canvasDot.parentElement.clientHeight,
          backgroundColor: 'transparent',
          randomOpacity: true,
        })
      }
    },
  }
})
