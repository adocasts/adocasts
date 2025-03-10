import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'argon',

  list: {
    scrypt: drivers.scrypt({
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      maxMemory: 33554432,
    }),

    argon: drivers.argon2({
      version: 0x13, // hex code for 19
      variant: 'id',
      iterations: 3,
      memory: 65536,
      parallelism: 4,
      saltSize: 16,
      hashLength: 32,
    }),
  },
})

export default hashConfig

/**
 * Inferring types for the list of hashers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> {}
}
