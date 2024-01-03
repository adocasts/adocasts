import AdvertisementSizes from '#enums/advertisement_sizes'
import AssetTypes from '#enums/asset_types'
import States from '#enums/states'
import Advertisement from '#models/advertisement'
import AdvertisementSize from '#models/advertisement_size'
import Asset from '#models/asset'
import logger from '#services/logger_service'
import storage from '#services/storage_service'
import { advertisementStoreValidator, advertisementUpdateValidator } from '#validators/advertisement_validator'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class AdvertisementsController {
  public async index({ view, auth }: HttpContext) {
    const ads = await auth.user!.related('ads').query()
      .preload('size')
      .preload('asset')
      .withCount('impressions')
      .withCount('clicks')
      .withAggregate('impressions', query => query.countDistinct('identity').as('unique_impressions_count'))
      .withAggregate('clicks', query => query.countDistinct('identity').as('unique_clicks_count'))
      .orderBy('created_at', 'desc')

    return view.render('pages/advertisements/index', { ads })
  }

  public async create({ view }: HttpContext) {
    const sizes = await AdvertisementSize.query()
      .whereNot('id', AdvertisementSizes.SKYSCRAPER)
      .orderBy('id')

    return view.render('pages/advertisements/create', { sizes })
  }

  public async store({ request, response, auth, session }: HttpContext) {
    const { asset, altText, credit, ...data } = await request.validateUsing(advertisementStoreValidator)
    const trx = await db.transaction()

    try {
      if (asset) {
        const location = `${auth.user!.id}/ads/`
        const filename = `ad_${new Date().getTime()}.${asset.extname}`
        
        // upload and set new asset
        await storage.storeFromTmp(location, filename, asset)
        const record = await Asset.create({ 
          assetTypeId: AssetTypes.ADVERTISEMENT,
          byteSize: asset.size,
          altText,
          credit,
          filename: location + filename
        }, { client: trx })
        
        data.assetId = record.id
      }

      await auth.user!.related('ads').create(data, { client: trx })
      await trx.commit()

      session.flash('success', 'Your advertisement has been created!')

      return response.redirect().toRoute('advertisements.index')
    } catch (error) {
      await trx.rollback()
      await logger.error('AdvertisementController:store', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  public async edit({ view, auth, params }: HttpContext) {
    const sizes = await AdvertisementSize.query()
      .whereNot('id', AdvertisementSizes.SKYSCRAPER)
      .orderBy('id')

    const ad = await auth.user!.related('ads').query()
      .where('id', params.id)
      .preload('asset')
      .preload('size')
      .firstOrFail()

    return view.render('pages/advertisements/edit', { ad, sizes })
  }

  public async update({ request, response, session, auth, params }: HttpContext) {
    const { asset, altText, credit, ...data } = await request.validateUsing(advertisementUpdateValidator)
    const ad = await auth.user!.related('ads').query().preload('asset').where('id', params.id).firstOrFail()
    const assetRecord = ad.asset
    const oldAssetFilename = assetRecord.filename
    const trx = await db.transaction()

    console.log({
      data
    })

    try {
      if (asset) {
        const location = `${auth.user!.id}/ads/`
        const filename = `ad_${new Date().getTime()}.${asset.extname}`

        assetRecord.useTransaction(trx)
        
        // upload and set new asset info
        await storage.storeFromTmp(location, filename, asset)
        await assetRecord.merge({
          filename: location + filename,
          byteSize: asset.size,
          altText,
          credit,
        }).save()
      }

      ad.useTransaction(trx)

      await ad.merge(data).save()
      await trx.commit()
      await storage.destroy(oldAssetFilename)

      session.flash('success', 'Your advertisement has been updated!')

      return response.redirect().toRoute('advertisements.index')
    } catch (error) {
      await trx.rollback()
      await logger.error('AdvertisementController:update', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }

  public async start({ response, session, auth, params }: HttpContext) {
    const ad = await auth.user!.related('ads').query()
      .where('id', params.id)
      .firstOrFail()

    const data: Partial<Advertisement> = {
      stateId: States.PUBLIC,
      startAt: DateTime.now(),
    }

    // re-run the ad for it's original duration, starting from today
    if (ad.endAt <= DateTime.now()) {
      const { days } = ad.startAt.diff(ad.endAt, ['days'])
      data.endAt = DateTime.now().plus({ days })
    }

    await ad.merge(data).save()

    session.flash('success', 'Your advertisement has been started!')

    return response.redirect().toRoute('advertisements.index')
  }

  public async end({ response, session, auth, params }: HttpContext) {
    const ad = await auth.user!.related('ads').query()
      .where('id', params.id)
      .firstOrFail()

    await ad.merge({
      stateId: States.PRIVATE
    }).save()

    session.flash('success', 'Your advertisement has been ended!')

    return response.redirect().toRoute('advertisements.index')
  }

  public async destroy({ response, session, auth, params }: HttpContext) {
    const ad = await auth.user!.related('ads').query().where('id', params.id).firstOrFail()
    const asset = await ad.related('asset').query().first()
    
    const trx = await db.transaction()
    
    try {
      ad.useTransaction(trx)
      asset?.useTransaction(trx)

      await ad.delete()
      await asset?.delete()
      await trx.commit()
      
      if (asset) {
        // await storage.destroy(asset.filename)
      }

      return response.redirect().toRoute('advertisements.index')
    } catch (error) {
      await trx.rollback()
      await logger.error('AdvertisementController:destroy', error)
      session.flash('error', 'Something went wrong. Please try again later.')
      return response.redirect().back()
    }
  }
}