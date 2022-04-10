import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Asset from 'App/Models/Asset';
import StorageService from 'App/Services/StorageService';
import AssetService from 'App/Services/AssetService';
import CacheService from 'App/Services/CacheService';
import Database from '@ioc:Adonis/Lucid/Database';
import Drive from '@ioc:Adonis/Core/Drive'

export default class AssetsController {
  public async index({ }: HttpContextContract) {
  }

  public async create({ }: HttpContextContract) {
  }

  public async store({ request, response, auth }: HttpContextContract) {
    try {
      const uid = auth.user?.id;

      if (!uid) {
        return response.json({ isSuccess: false, status: 'You must be logged in to upload' });
      }

      let filename;
      let byteSize;

      request.multipart.onFile('image', {}, async (file) => {
        try {
          const extension = AssetService.getFileExtension(file);
          const customFilename = `${uid}/${file.filename.split('.')[0]}_${new Date().getTime()}.${extension}`;

          filename = customFilename;
          byteSize = file.bytes || 0;

          await Drive.putStream(filename, file)
          // await StorageService.upload(file, customFilename);
        } catch (error) {
          console.error(error);
        }
      });

      await request.multipart.process();

      const { postId } = request.only(['postId'])

      const asset = await Asset.create({
        assetTypeId: 1,
        filename,
        byteSize
      });

      if (postId) {
        const { sort_order: postAssetMaxSort } = (await Database.from('asset_posts')
          .where('post_id', postId)
          .orderBy('sort_order', 'desc')
          .select('sort_order')
          .first()) ?? { sort_order: -1 }

        await asset.related('posts').attach({
          [postId]: { sort_order: postAssetMaxSort + 1 }
        })
      }

      return response.json({ isSuccess: true, status: 'Image was successfully uploaded', asset });
    } catch (error) {
      // Logger.error('AssetsController.store', error)

      return response.json({ isSuccess: false, status: 'An error occurred during the upload process' })
    }
  }

  public async show({ request, response, params }: HttpContextContract) {
    // try {
      const tempDirectory = '.cache';
      const path = AssetService.getParamFilename(params);
      const query = request.only(['w', 'width', 'q', 'quality', 'f', 'format']);
      const options = AssetService.getImageOptions(query, path);
      const tempName = `${tempDirectory}/${path}/${options.name}`;
      const isCached = await CacheService.has(tempName);
      const isSVG = path.endsWith('.svg');

      let image: Buffer|undefined;

      if (!isCached && !isSVG) {
        const exists = await Drive.exists(tempName)
        // const exists = await StorageService.exists(tempName);

        if (!exists) {
          let file = await Drive.get(path)
          // let file = await StorageService.getBufferOrProd(path);

          image = await AssetService.getAlteredImage(file, options);

          await Drive.put(tempName, image)
          // await StorageService.upload(image, tempName);
        }
      }

      if (!image) {
        image = await Drive.get(isSVG ? path : tempName)
        // image = await StorageService.getBuffer(isSVG ? path : tempName);
      }

      await CacheService.set(tempName, true);

      response.append('Content-Type', `image/${options.format}`);

      return image
    // } catch (error) {
    //   Logger.error('AssetController.show', error)
    // }
  }

  public async edit({ }: HttpContextContract) {
  }

  public async update({ }: HttpContextContract) {
  }

  public async destroy({ response, params }: HttpContextContract) {
    const asset = await Asset.findOrFail(params.id)

    await asset.related('posts').detach()
    await asset.related('collections').query().update({ assetId: null })
    await asset.related('taxonomies').query().update({ assetId: null })
    await asset.delete()

    await StorageService.destroy(asset.filename)

    return response.status(200).json({
      status: 200,
      message: 'Image has been successfully deleted'
    })
  }
}
