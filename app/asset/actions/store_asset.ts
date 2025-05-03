import assetStorage from '#asset/services/asset_storage_service'
import { assetStoreValidator } from '#asset/validators/asset'
import BaseAction from '#core/actions/base_action'
import { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'

export default class StoreAsset extends BaseAction {
  validator = assetStoreValidator

  async asController(
    { request, response, auth, bouncer }: HttpContext,
    { file }: Infer<typeof this.validator>
  ) {
    await bouncer.with('AssetPolicy').authorize('store')

    const location = `${auth.user!.id}/uploads/`
    const filename = `upload_${new Date().getTime()}.${file.extname}`

    await assetStorage.storeFromTmp(location, filename, file)

    return response.json({ url: `/img/${location}${filename}` })
  }
}
