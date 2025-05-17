import Alpine from "alpinejs"
import { prominent } from "color.js"

Alpine.data('color', function (src, amount = 2) {
  return {
    colors: [
      'var(--primary)',
      'var(--secondary)',
      'var(--accent)',
    ],

    get style() {
      return {
        backgroundImage: `linear-gradient(to bottom right, ${this.colors.join(', ')})`,
      }
    },

    async init() {
      const main = await prominent(src, { amount })
      console.log({ main })

      this.colors = main.map((rgb) => `rgb(${rgb.join(', ')})`)
    }
  }
})
