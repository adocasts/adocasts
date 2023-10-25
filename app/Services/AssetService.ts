import { AllyUserContract, GithubToken, GoogleToken } from '@ioc:Adonis/Addons/Ally';
import User from 'App/Models/User';
import sharp, { AvailableFormatInfo, FormatEnum } from 'sharp';
import fetch from 'cross-fetch'
import Drive from '@ioc:Adonis/Core/Drive'
import Asset from 'App/Models/Asset';
import Application from '@ioc:Adonis/Core/Application';

class ImageOptions {
  width: number
  quality: number
  format: keyof FormatEnum | AvailableFormatInfo
  name: string
  blur: number
}

export default class AssetService {
  public static getAssetUrl(filename: string) {
    return `/img/${filename}`
  }

  public static getParamFilename(params: Array<string> | object): string {
    if (Array.isArray(params)) {
      return params['*'].join('/');
    }

    if (params['*']) {
      return params['*'].join('/')
    }

    return Object.values(params).join('/')
  }

  public static getFileExtension(file): string {
    const contentType = file.headers['content-type'];
    const subtype = contentType.slice(contentType.lastIndexOf('/') + 1);
    let extension = subtype.split('+')[0];
    return extension;
  }

  public static getFilenameExtension(filename: string, defaultValue: string = 'jpg') {
    const name = filename.split('/').pop()
    
    if (!name) return defaultValue

    return name.includes('.') ? name.split('.').pop() : defaultValue
  }

  public static getAlteredImage(file: Buffer | string, options: ImageOptions): Promise<Buffer> {
    let image = sharp(file);
    return image.metadata().then(metadata => {
      const toOptions = options.quality ? { quality: options.quality } : {};
      
      image
        .resize(options.width || metadata.width)
        .toFormat(options.format, toOptions)

      if (options.blur) {
        image = image.blur(options.blur)
      }
        
      return image.toBuffer()
    });
  }

  public static getImageOptions(queries: object, path: string): ImageOptions {
    const isSVG = path.endsWith('.svg');
    let options = new ImageOptions();

    for (let key in queries) {
      const value = queries[key];

      switch (key) {
        case 'w':
        case 'width':
          options.width = parseInt(value);
          break;
        case 'q':
        case 'quality':
          options.quality = parseInt(value);
          break;
        case 'f':
        case 'format':
          options.format = isSVG ? `svg+xml` : value;
          break;
        case 'blur':
          options.blur = parseInt(value || '0')
          break
      }
    }

    if (!options.format) {
      const [_, format] = path.split('.');
      options.format = isSVG ? 'svg' : format as keyof FormatEnum;
    }

    options.name = `width_${options.width}__quality_${options.quality}.${options.format}`

    return options;
  }

  public static async refreshAvatar(user: User, socialUser: AllyUserContract<GithubToken | GoogleToken>) {
    if (!socialUser.avatarUrl || user.avatarUrl?.startsWith(`${user.id}/profile/`)) return

    const response = await fetch(socialUser.avatarUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = new Buffer(arrayBuffer)
    const filename = this.getAvatarFilename(user, socialUser.avatarUrl)

    if (user.avatarUrl === filename) return

    if (await Drive.exists(filename) && Application.inProduction) {
      await Drive.delete(filename)
    }

    await Drive.put(filename, buffer)

    user.avatarUrl = filename

    await user.save()
  }

  public static getAvatarFilename(user: User, url: string) {
    const prefix = Application.inProduction ? '' : 'local/'
    const extension = AssetService.getFilenameExtension(url, 'jpg');
    return `${prefix}${user.id}/avatar.${extension}`;
  }

  public static async syncAssetTypes(assetIds: number[] | undefined, assetTypeIds: number[] | undefined, altTexts: (string | undefined)[] | undefined, credits: (string | undefined)[] | undefined) {
    if (!assetIds || !assetTypeIds) return

    const promises = assetIds.map((id, i) => {
      const assetTypeId = assetTypeIds[i]
      const altText = altTexts && altTexts[i]
      const credit = credits && credits[i]
      return Asset.query().where({ id }).update({ assetTypeId, altText, credit })
    })

    await Promise.all(promises)
  }
}