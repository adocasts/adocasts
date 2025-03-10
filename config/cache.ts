import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'default',

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
