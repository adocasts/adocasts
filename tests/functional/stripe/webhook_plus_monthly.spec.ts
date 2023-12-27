import Plans from '#enums/plans'
import { test } from '@japa/runner'
import { MockPlusMonthlyUpgradeToForeverCustomerSubscriptionDeleted } from '../../mocks/plus-monthly/on-upgrade-to-forever/02-customer-subscription-deleted.js'
import { MockPlusMonthlyUpgradeToForever } from '../../mocks/plus-monthly/on-upgrade-to-forever/01-checkout-session-completed.js';
import StripeService from '#services/stripe_service';
import StripeMockService from '#services/stripe_mock_service';
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses';
import { MockPlusMonthlyUpgradeToAnnual } from '../../mocks/plus-monthly/on-upgrade-to-annual/01-customer-subscription-updated.js';
import { MockPlusMonthlyCustomerSubscriptionDeleted } from '../../mocks/plus-monthly/on-cancel-end-of-billing-period/01-customer-subscription-deleted.js';
import { MockPlusMonthlyCancelAtEndOfBillingPeriod } from '../../mocks/plus-monthly/on-cancel-end-of-billing-period/01-customer-subscription-updated.js';
import { MockPlusMonthlyCustomerSubscriptionUpdated } from '../../mocks/plus-monthly/on-subscription-created/02-customer-subscription-updated.js';
import { MockPlusMonthlyCheckoutSessionCompleted } from '../../mocks/plus-monthly/on-subscription-created/03-checkout-session-completed.js';
import { MockPlusMonthlyCustomerSubscriptionCreated } from '../../mocks/plus-monthly/on-subscription-created/01-customer-subscription-created.js';
import db from '@adonisjs/lucid/services/db';

test.group('Stripe webhook plus monthly', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should handle new plus monthly subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const user = await stripeMockService.createFreeUserWithCustomerId()

    // stripe emits 3 hooks we capture when a new customer subscribes
    assert.equal(user.planId, Plans.FREE)
    assert.isNull(user.stripeSubscriptionStatus)

    // 1. customer.subscription.created, handled by onSubscriptionCreated
    const mockCustomerSubscriptionCreated = MockPlusMonthlyCustomerSubscriptionCreated(user)
    await stripeService.onSubscriptionCreated({ data: mockCustomerSubscriptionCreated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.INCOMPLETE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionCreated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionCreated.object.current_period_end)

    // 2. customer.subscription.updated, handled by onSubscriptionUpdated
    const mockCustomerSubscriptionUpdated = MockPlusMonthlyCustomerSubscriptionUpdated(user)
    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()
    
    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
    
    // 3. checkout.session.completed, handled by onCheckoutCompleted
    const mockCheckoutSessionCompleted = MockPlusMonthlyCheckoutSessionCompleted(user)
    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle renewed plus monthly subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const mockCustomerSubscriptionUpdated = MockPlusMonthlyCustomerSubscriptionUpdated(user, { month: 1 })

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle request to cancel at end of plus monthly billing period', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const mockCancelAtEndOfBillingPeriod = MockPlusMonthlyCancelAtEndOfBillingPeriod(user)

    await stripeService.onSubscriptionUpdated({ data: mockCancelAtEndOfBillingPeriod })
    await user.refresh()

    // should still be member of plan
    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.current_period_end)

    // should know cancellation is coming
    assert.equal(user.stripeSubscriptionCanceledAt?.toSeconds(), mockCancelAtEndOfBillingPeriod.object.created)
  })

  test('should handle cancellation of plus monthly', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const mockCustomerSubscriptionDeleted = MockPlusMonthlyCustomerSubscriptionDeleted(user)

    await stripeService.onSubscriptionDeleted({ data: mockCustomerSubscriptionDeleted })
    await user.refresh()

    assert.equal(user.planId, Plans.FREE)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.CANCELED)
    assert.isNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)
  })

  test('should handle upgrade from plus monthly to annual', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const mockCustomerSubscriptionUpdated = MockPlusMonthlyUpgradeToAnnual(user)

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(user.planPeriodStart?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_start)
    assert.equal(user.planPeriodEnd?.toSeconds(), mockCustomerSubscriptionUpdated.object.current_period_end)
  })

  test('should handle upgrade from plus monthly to forever', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const stripeService = new StripeService()
    const { user } = await stripeMockService.createPlusMonthlyUser()
    const mockCheckoutSessionCompleted = MockPlusMonthlyUpgradeToForever(user)

    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    // should upgrade to forever plan
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)

    const mockCustomerSubscriptionDeleted = MockPlusMonthlyUpgradeToForeverCustomerSubscriptionDeleted(user)
    await stripeService.onSubscriptionDeleted({ data: mockCustomerSubscriptionDeleted })
    await user.refresh()

    // nothing should change
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)
  })
})