import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'
import { Storage } from '@google-cloud/storage'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: {
    r2: services.s3({
      credentials: {
        accessKeyId: env.get('R2_KEY'),
        secretAccessKey: env.get('R2_SECRET'),
      },
      region: 'auto',
      bucket: env.get('R2_BUCKET'),
      endpoint: env.get('R2_ENDPOINT'),
      visibility: 'public',
    }),
    gcs: services.gcs({
      storage: new Storage({
        keyFilename: env.get('GCS_KEY'),
      }),
      bucket: env.get('GCS_BUCKET'),
      visibility: 'public',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
