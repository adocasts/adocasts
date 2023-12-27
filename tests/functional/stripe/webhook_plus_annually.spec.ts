import { test } from '@japa/runner'
import { MockPlusAnnuallyCustomerSubscriptionUpdated } from '../../mocks/plus-annually/on-subscription-created/02-customer-subscription-updated.js'
import { MockPlusAnnuallyCustomerSubscriptionCreated } from '../../mocks/plus-annually/on-subscription-created/01-customer-subscription-created.js'
import { MockPlusAnnuallyCheckoutSessionCompleted } from '../../mocks/plus-annually/on-subscription-created/03-checkout-session-completed.js'
import { MockPlusAnnuallyCancelAtEndOfBillingPeriod } from '../../mocks/plus-annually/on-cancel-end-of-billing-period/01-customer-subscription-updated.js'
import { MockPlusAnnuallyCustomerSubscriptionDeleted } from '../../mocks/plus-annually/on-cancel-end-of-billing-period/01-customer-subscription-deleted.js'
import { MockPlusAnnuallyDowngradeToMonthly } from '../../mocks/plus-annually/on-downgrade-to-monthly/01-customer-subscription-updated.js'
import { MockPlusAnnuallyUpgradeToForever } from '../../mocks/plus-annually/on-upgrade-to-forever/01-checkout-session-completed.js'
import { MockPlusAnnuallyUpgradeToForeverCustomerSubscriptionDeleted } from '../../mocks/plus-annually/on-upgrade-to-forever/02-customer-subscription-deleted.js'
import db from '@adonisjs/lucid/services/db'
import Plans from '#enums/plans'
import StripeService from '#services/stripe_service'
import StripeMockService from '#services/stripe_mock_service'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'

test.group('Stripe webhook plus annually', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should handle new plus annually subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const user = await stripeMockService.createFreeUserWithCustomerId()

    // stripe emits 3 hooks we capture when a new customer subscribes
    assert.equal(user.planId, Plans.FREE)
    assert.isNull(user.stripeSubscriptionStatus)

    // 1. customer.subscription.created, handled by onSubscriptionCreated
    const mockCustomerSubscriptionCreated = MockPlusAnnuallyCustomerSubscriptionCreated(user)
    await stripeService.onSubscriptionCreated({ data: mockCustomerSubscriptionCreated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.INCOMPLETE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionCreated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionCreated.object.current_period_end)

    // 2. customer.subscription.updated, handled by onSubscriptionUpdated
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyCustomerSubscriptionUpdated(user)
    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()
    
    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
    
    // 3. checkout.session.completed, handled by onCheckoutCompleted
    const mockCheckoutSessionCompleted = MockPlusAnnuallyCheckoutSessionCompleted(user)
    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle renewed plus annually subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyCustomerSubscriptionUpdated(user, { year: 1 })

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle request to cancel at end of plus annually billing period', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCancelAtEndOfBillingPeriod = MockPlusAnnuallyCancelAtEndOfBillingPeriod(user)

    await stripeService.onSubscriptionUpdated({ data: mockCancelAtEndOfBillingPeriod })
    await user.refresh()

    // should still be member of plan
    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.current_period_end)

    // should know cancellation is coming
    assert.equal(user.stripeSubscriptionCanceledAt?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.created)
  })

  test('should handle cancellation of plus annually', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCustomerSubscriptionDeleted = MockPlusAnnuallyCustomerSubscriptionDeleted(user)

    await stripeService.onSubscriptionDeleted({ data: mockCustomerSubscriptionDeleted })
    await user.refresh()

    assert.equal(user.planId, Plans.FREE)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.CANCELED)
    assert.isNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)
  })

  test('should handle downgrade from plus annual to monthly', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyDowngradeToMonthly(user)

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle upgrade from plus annually to forever', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCheckoutSessionCompleted = MockPlusAnnuallyUpgradeToForever(user)

    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    // should upgrade to forever plan
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)

    const mockCustomerSubscriptionDeleted = MockPlusAnnuallyUpgradeToForeverCustomerSubscriptionDeleted(user)
    await stripeService.onSubscriptionDeleted({ data: mockCustomerSubscriptionDeleted })
    await user.refresh()

    // nothing should change
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)
  })
})