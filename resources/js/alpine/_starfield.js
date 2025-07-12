import { MoveDirection, OutMode, tsParticles } from "@tsparticles/engine"
import Alpine from 'alpinejs'
import { loadFull } from 'tsparticles'
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

Alpine.data('stars', () => ({
  container: null,

  async init() {
    if (!this.$el.id) return console.error('Alpine.stars: please ensure the element has a unique id')

    await loadFull(tsParticles)

    this.container = await tsParticles.load({
      id: this.$el.id,
      options: {
        // background: {
        //   color: "#000",
        // },
        fullScreen: false,
        particles: {
          color: '#6ab7dc',
          number: {
            value: 400,
          },
          move: {
            direction: MoveDirection.bottom,
            enable: true,
            outModes: {
              default: OutMode.out,
            },
            random: true,
            speed: 0.3,
            straight: false,
          },
          opacity: {
            animation: {
              enable: true,
              speed: 1,
              sync: false,
            },
            value: { min: 0, max: 1 },
          },
          size: {
            value: { min: 0.3, max: 2 },
          },
        },
        interactivity: {
          detectsOn: 'canvas',
          events: {
            onHover: {
              enable: true,
              mode: 'bubble',
            },
            onClick: {
              enable: true,
              mode: 'push',
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 400,
              links: {
                opacity: 1,
              },
            },
            bubble: {
              distance: 83.9,
              size: 1,
              duration: 3,
              opacity: 1,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
            push: {
              quantity: 4,
            },
            remove: {
              quantity: 2,
            },
          },
        },
      },
    })
  },

  destroy() {
    this.container?.destroy()
  }
}))
