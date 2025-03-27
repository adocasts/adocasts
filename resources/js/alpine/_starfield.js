import Alpine from 'alpinejs'
import Starfield from '../vendor/starfield'

Alpine.data('starfield', () => ({
  init() {
    Starfield.setup({
      starColor: "rgb(255, 255, 255)",
      hueJitter: 35,
      trailLength: 0.8,
      baseSpeed: 3,
      maxAcceleration: 2,
      accelerationRate: 0.05,
      decelerationRate: 0.05,
      minSpawnRadius: 80,
      maxSpawnRadius: 500
    })
  },

  destroy() {
    Starfield.cleanup()
  }
}))
