import Plans from '#enums/plans'
import { UserFactory } from '#factories/user_factory'
import Plan from '#models/plan'
import StripeMockService from '#services/stripe_mock_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Stripe subscription', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should allow an authenticated free user to proceed with checkout for plus monthly', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.with('profile').create()
    const plan = await Plan.findOrFail(Plans.PLUS_MONTHLY)
    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()

    assert.include(response.header('location'), 'stripe.com')
  })

  test('should allow an authenticated free user to proceed with checkout for plus annual', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.with('profile').create()
    const plan = await Plan.findOrFail(Plans.PLUS_ANNUAL)
    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()

    assert.include(response.header('location'), 'stripe.com')
  })

  test('should allow an authenticated plus user to proceed with checkout for plus monthly', async ({
    client,
    assert,
  }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const plan = await Plan.findOrFail(Plans.PLUS_MONTHLY)

    assert.equal(user.planId, Plans.PLUS_MONTHLY)

    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()

    assert.include(response.header('location'), 'stripe.com')
  })

  test('should allow an authenticated plus user to proceed with checkout for plus annual', async ({
    client,
    assert,
  }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const plan = await Plan.findOrFail(Plans.PLUS_ANNUAL)

    assert.equal(user.planId, Plans.PLUS_ANNUAL)

    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()

    assert.include(response.header('location'), 'stripe.com')
  })

  test('should not allow an authenticated plus forever user to proceed with checkout for plus monthly', async ({
    client,
    assert,
  }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusForverUser()
    const plan = await Plan.findOrFail(Plans.PLUS_MONTHLY)

    assert.equal(user.planId, Plans.FOREVER)

    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()
    response.assertHeader('location', '/')
    response.assertToast(
      'warning',
      "You're already a member of our forever plan, so you're all set!"
    )
  })

  test('should not allow an authenticated plus forever user to proceed with checkout for plus annually', async ({
    client,
    assert,
  }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusForverUser()
    const plan = await Plan.findOrFail(Plans.PLUS_ANNUAL)

    assert.equal(user.planId, Plans.FOREVER)

    const response = await client
      .post(`/stripe/subscription/checkout/${plan.slug}`)
      .withCsrfToken()
      .sessionLoginAs(user)
      .redirects(0)

    response.assertFound()
    response.assertHeader('location', '/')
    response.assertToast(
      'warning',
      "You're already a member of our forever plan, so you're all set!"
    )
  })
})
