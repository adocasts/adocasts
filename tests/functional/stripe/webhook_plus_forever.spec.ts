import Plans from '#enums/plans'
import { MockPlusForeverCheckoutSessionCompleted } from '#mocks/plus_forever/on_purchase/01_checkout_session_completed'
import StripeMockService from '#services/stripe_mock_service'
import stripeService from '#services/stripe_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Stripe webhook plus forever', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should handle new plus forever purchase', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const user = await stripeMockService.createFreeUserWithCustomerId()

    // stripe emits 3 hooks we capture when a new customer subscribes
    assert.equal(user.planId, Plans.FREE)
    assert.isNull(user.stripeSubscriptionStatus)

    // 1. checkout.session.completed, handled by onCheckoutCompleted
    const mockCheckoutSessionCompleted = MockPlusForeverCheckoutSessionCompleted(user)
    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    assert.equal(user.planId, Plans.FOREVER)
    assert.notEqual(user.planPeriodStart?.toSeconds(), undefined)
    assert.isUndefined(user.planPeriodEnd?.toSeconds())
  })
})
