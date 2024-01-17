import HttpStatus from '#enums/http_statuses'
import States from '#enums/states'
import { AdvertisementFactory } from '#factories/advertisement_factory'
import { AssetFactory } from '#factories/asset_factory'
import { UserFactory } from '#factories/user_factory'
import Advertisement from '#models/advertisement'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import axios from 'axios'
import { DateTime } from 'luxon'
import { File } from 'node:buffer'
import { readFileSync } from 'node:fs'

test.group('Advertisements', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('plus subscribers should be able to view ad portal', async ({ client, route }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const response = await client
      .get(route('advertisements.index'))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.OK)
  })

  test('base users should not be able to view ad portal', async ({ client, route }) => {
    const user = await UserFactory.create()
    const response = await client
      .get(route('advertisements.index'))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('info', 'Please upgrade to Adocasts Plus to use this feature')
  })

  test('plus subscribers should be able to view ad create form', async ({ client, route }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const response = await client
      .get(route('advertisements.create'))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.OK)
  })

  test('base users should not be able to view ad create form', async ({ client, route }) => {
    const user = await UserFactory.create()
    const response = await client
      .get(route('advertisements.create'))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('info', 'Please upgrade to Adocasts Plus to use this feature')
  })

  test('plus subscribers should be able to view ad edit form', async ({ client, route }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const response = await client
      .get(route('advertisements.edit', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.OK)
  })

  test('plus subscribers should not be able to view ad edit form for others ads', async ({
    client,
    route,
  }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .with('user')
      .create()

    const response = await client
      .get(route('advertisements.edit', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.NOT_FOUND)
  })

  test('base users should not be able to view ad edit form', async ({ client, route }) => {
    const user = await UserFactory.create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const response = await client
      .get(route('advertisements.edit', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('info', 'Please upgrade to Adocasts Plus to use this feature')
  })

  test('plus subscribers should be able to edit their ad', async ({ client, route, assert }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const newStart = DateTime.now().plus({ month: 1 }).toFormat('yyyy-MM-dd')
    const newEnd = DateTime.now().plus({ month: 2 }).toFormat('yyyy-MM-dd')
    const response = await client
      .put(route('advertisements.update', { id: ad.id }))
      .form({
        url: ad.url,
        assetId: ad.assetId,
        sizeId: ad.sizeId,
        altText: ad.asset.altText,
        startAt: newStart,
        endAt: newEnd,
      })
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    await ad.refresh()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your advertisement has been updated!')
    response.assertHeader('location', route('advertisements.index'))

    assert.equal(ad.startAt.toFormat('yyyy-MM-dd'), newStart)
    assert.equal(ad.endAt.toFormat('yyyy-MM-dd'), newEnd)
  })

  test('plus subscribers should not be able to edit others ads', async ({
    client,
    route,
    assert,
  }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .with('user')
      .create()

    const newStart = DateTime.now().plus({ month: 1 }).toFormat('yyyy-MM-dd')
    const newEnd = DateTime.now().plus({ month: 2 }).toFormat('yyyy-MM-dd')
    const response = await client
      .put(route('advertisements.update', { id: ad.id }))
      .form({
        url: ad.url,
        assetId: ad.assetId,
        sizeId: ad.sizeId,
        altText: ad.asset.altText,
        startAt: newStart,
        endAt: newEnd,
      })
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    await ad.refresh()

    response.assertStatus(HttpStatus.NOT_FOUND)

    assert.notEqual(ad.startAt.toFormat('yyyy-MM-dd'), newStart)
    assert.notEqual(ad.endAt.toFormat('yyyy-MM-dd'), newEnd)
  })

  test('plus subscribers should be able to delete their ad', async ({ client, route, assert }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const response = await client
      .delete(route('advertisements.destroy', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your advertisement has been deleted!')

    const exists = await Advertisement.find(ad.id)

    assert.isNull(exists)
  })

  test('plus subscribers should not be able to delete others ads', async ({ client, route }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .with('user')
      .create()

    const response = await client
      .delete(route('advertisements.destroy', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    response.assertStatus(HttpStatus.NOT_FOUND)
  })

  test('plus subscribers should be able to re-run an expired ad', async ({
    client,
    route,
    assert,
  }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .apply('over')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const { days } = ad.startAt.diff(ad.endAt, ['days'])

    const response = await client
      .patch(route('advertisements.start', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    await ad.refresh()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your advertisement has been started!')

    assert.equal(ad.stateId, States.PUBLIC)
    assert.equal(ad.startAt.toFormat('yyyy-MM-dd'), DateTime.now().toFormat('yyyy-MM-dd'))
    assert.equal(
      ad.endAt.toFormat('yyyy-MM-dd'),
      DateTime.now().plus({ days }).toFormat('yyyy-MM-dd')
    )
  })

  test('plus subscribers should be able to end a running ad', async ({ client, route, assert }) => {
    const user = await UserFactory.apply('plusMonthly').create()
    const ad = await AdvertisementFactory.apply('mediumRectangle')
      .with('asset', 1, (assets) => assets.apply('mediumRectangle'))
      .merge({ userId: user.id })
      .create()

    const response = await client
      .patch(route('advertisements.end', { id: ad.id }))
      .withGuard('web')
      .loginAs(user)
      .redirects(0)

    await ad.refresh()

    response.assertStatus(HttpStatus.FOUND)
    response.assertFlashMessage('success', 'Your advertisement has been ended!')

    assert.equal(ad.stateId, States.PRIVATE)
  })
})
