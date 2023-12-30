import AssetService from '#services/asset_service';
import CacheService from '#services/cache_service';
import storage from '#services/storage_service';
import { assetStoreValidator } from '#validators/asset_validator';
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

  public async store({ request, response, auth, bouncer }: HttpContext) {
    await bouncer.with('AssetPolicy').authorize('store')

    const { file } = await request.validateUsing(assetStoreValidator)
    const location = `${auth.user!.id}/uploads/`
    const filename = `upload_${new Date().getTime()}.${file.extname}`
    
    // upload and set new avatar
    await storage.storeFromTmp(location, filename, file)

    return response.json({ url: '/img/' + location + filename })
  }
}