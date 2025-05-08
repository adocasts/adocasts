import AssetOptions from '#enums/asset_options'
import AssetService from '#services/asset_service'
import BaseAction from '#actions/base_action'
import { HttpContext } from '@adonisjs/http-server'
import GetAsset from './get_asset.js'

export default class ShowAsset extends BaseAction {
  async asController({ request, response, params }: HttpContext) {
    const query = request.only(Object.values(AssetOptions))
    const path = AssetService.getParamFilename(params)
    const options = AssetService.getImageOptions(query, path)
    const image = await GetAsset.run(options)

    response.append('Content-Type', `image/${options.format}`)

    return response.stream(image)
  }
}
