import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Plans from 'App/Enums/Plans'
import StripeMockService from 'App/Services/StripeMockService'
import StripeService from 'App/Services/StripeService'
import { MockPlusForeverCheckoutSessionCompleted } from '../../mocks/plus-forever/on-purchase/01-checkout-session-completed'

test.group('Stripe webhook plus forever', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
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