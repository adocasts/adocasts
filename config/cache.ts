import { defineConfig, drivers, errors, store } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'default',

  onFactoryError(error) {
    switch (true) {
      case error.cause instanceof errors.E_FACTORY_ERROR:
      case error.cause instanceof errors.E_FACTORY_HARD_TIMEOUT:
      case error.cause instanceof errors.E_FACTORY_SOFT_TIMEOUT:
      case error.cause instanceof errors.E_L2_CACHE_ERROR:
      case error.cause instanceof errors.E_UNDEFINED_VALUE:
        return // continue with thrown error
      default:
        throw error.cause // don't swallow non-cache error, a 404 should remain a 404
    }
  },

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    default: store()
      .useL1Layer(drivers.memory({ maxSize: 10_000 }))
      .useL2Layer(
        drivers.redis({
          connectionName: 'main',
        })
      ),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
