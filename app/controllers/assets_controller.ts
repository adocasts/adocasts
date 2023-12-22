import AssetService from '#services/asset_service';
import CacheService from '#services/cache_service';
import storage from '#services/storage_service';
import type { HttpContext } from '@adonisjs/core/http'

export default class AssetsController {
  public async show({ request, response, params }: HttpContext) {
    const tempDirectory = '.cache';
    const path = AssetService.getParamFilename(params);
    const query = request.only(['w', 'width', 'q', 'quality', 'f', 'format', 'blur']);
    const options = AssetService.getImageOptions(query, path);
    const tempName = `${tempDirectory}/${path}/${options.name}`;
    const isCached = await CacheService.has(tempName);
    const isSkipResize = path.endsWith('.svg') || path.endsWith('.gif');

    let image: Buffer|undefined;
    
    if (!isCached && !isSkipResize) {
      const exists = await storage.exists(tempName)

      if (!exists) {
        await storage.alter(path, tempName, options)
      }
    }

    await CacheService.set(tempName, true);
    
    response.append('Content-Type', `image/${options.format}`);
    
    if (!image) {
      return response.stream(storage.get(isSkipResize ? path : tempName))
    }


    return image
  }
}