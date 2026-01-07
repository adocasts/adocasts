import { AdvertisementSizeSchema } from '#database/schema'
import { computed } from '@adonisjs/lucid/orm'

export default class AdvertisementSize extends AdvertisementSizeSchema {
  @computed()
  get aspectRatio() {
    return this.width / this.height
  }
}
