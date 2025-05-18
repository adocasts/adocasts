import Alpine from "alpinejs"
import { prominent } from "color.js"

Alpine.data('color', function (src, amount = 2) {
  return {
    colors: [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-accent)',
    ],

    get style() {
      return {
        backgroundImage: `linear-gradient(to bottom right, ${this.colors.join(', ')})`,
      }
    },

    init() {
      this.loadColors()  
    },

    async loadColors() {
      const main = await prominent(src, { amount })
      this.colors = main.map((rgb) => `rgb(${rgb.join(', ')})`)
    }
  }
})
