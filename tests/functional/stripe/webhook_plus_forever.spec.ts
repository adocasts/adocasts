import { test } from '@japa/runner'
import { MockPlusForeverCheckoutSessionCompleted } from '../../mocks/plus-forever/on-purchase/01-checkout-session-completed.js'
import Plans from '#enums/plans'
import StripeService from '#services/stripe_service'
import StripeMockService from '#services/stripe_mock_service'
import db from '@adonisjs/lucid/services/db'

test.group('Stripe webhook plus forever', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should handle new plus forever purchase', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
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