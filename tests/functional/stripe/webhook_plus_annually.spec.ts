import Plans from '#enums/plans'
import StripeSubscriptionStatuses from '#enums/stripe_subscription_statuses'
import { MockPlusAnnuallyCustomerSubscriptionDeleted } from '#mocks/plus_annually/on_cancel_end_of_billing_period/01_customer_subscription_deleted'
import { MockPlusAnnuallyCancelAtEndOfBillingPeriod } from '#mocks/plus_annually/on_cancel_end_of_billing_period/01_customer_subscription_updated'
import { MockPlusAnnuallyDowngradeToMonthly } from '#mocks/plus_annually/on_downgrade_to_monthly/01_customer_subscription_updated'
import { MockPlusAnnuallyCustomerSubscriptionCreated } from '#mocks/plus_annually/on_subscription_created/01_customer_subscription_created'
import { MockPlusAnnuallyCustomerSubscriptionUpdated } from '#mocks/plus_annually/on_subscription_created/02_customer_subscription_updated'
import { MockPlusAnnuallyCheckoutSessionCompleted } from '#mocks/plus_annually/on_subscription_created/03_checkout_session_completed'
import { MockPlusAnnuallyUpgradeToForever } from '#mocks/plus_annually/on_upgrade_to_forever/01_checkout_session_completed'
import { MockPlusAnnuallyUpgradeToForeverCustomerSubscriptionDeleted } from '#mocks/plus_annually/on_upgrade_to_forever/02_customer_subscription_deleted'
import StripeMockService from '#services/stripe_mock_service'
import stripeService from '#services/stripe_service'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Stripe webhook plus annually', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('should handle new plus annually subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
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
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCustomerSubscriptionCreated.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCustomerSubscriptionCreated.object.current_period_end
    )

    // 2. customer.subscription.updated, handled by onSubscriptionUpdated
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyCustomerSubscriptionUpdated(user)
    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_end
    )

    // 3. checkout.session.completed, handled by onCheckoutCompleted
    const mockCheckoutSessionCompleted = MockPlusAnnuallyCheckoutSessionCompleted(user)
    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.COMPLETE)
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_end
    )
  })

  test('should handle renewed plus annually subscription', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyCustomerSubscriptionUpdated(user, {
      year: 1,
    })

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_end
    )
  })

  test('should handle request to cancel at end of plus annually billing period', async ({
    assert,
  }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCancelAtEndOfBillingPeriod = MockPlusAnnuallyCancelAtEndOfBillingPeriod(user)

    await stripeService.onSubscriptionUpdated({ data: mockCancelAtEndOfBillingPeriod })
    await user.refresh()

    // should still be member of plan
    assert.equal(user.planId, Plans.PLUS_ANNUAL)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCancelAtEndOfBillingPeriod.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCancelAtEndOfBillingPeriod.object.current_period_end
    )

    // should know cancellation is coming
    assert.equal(
      user.stripeSubscriptionCanceledAt?.toSeconds(),
      mockCancelAtEndOfBillingPeriod.object.created
    )
  })

  test('should handle cancellation of plus annually', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
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
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCustomerSubscriptionUpdated = MockPlusAnnuallyDowngradeToMonthly(user)

    await stripeService.onSubscriptionUpdated({ data: mockCustomerSubscriptionUpdated })
    await user.refresh()

    assert.equal(user.planId, Plans.PLUS_MONTHLY)
    assert.equal(user.stripeSubscriptionStatus, StripeSubscriptionStatuses.ACTIVE)
    assert.equal(
      user.planPeriodStart?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_start
    )
    assert.equal(
      user.planPeriodEnd?.toSeconds(),
      mockCustomerSubscriptionUpdated.object.current_period_end
    )
  })

  test('should handle upgrade from plus annually to forever', async ({ assert }) => {
    const stripeMockService = new StripeMockService()
    const { user } = await stripeMockService.createPlusAnnualUser()
    const mockCheckoutSessionCompleted = MockPlusAnnuallyUpgradeToForever(user)

    await stripeService.onCheckoutCompleted({ data: mockCheckoutSessionCompleted })
    await user.refresh()

    // should upgrade to forever plan
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)

    const mockCustomerSubscriptionDeleted =
      MockPlusAnnuallyUpgradeToForeverCustomerSubscriptionDeleted(user)
    await stripeService.onSubscriptionDeleted({ data: mockCustomerSubscriptionDeleted })
    await user.refresh()

    // nothing should change
    assert.equal(user.planId, Plans.FOREVER)
    assert.isNotNull(user.planPeriodStart)
    assert.isNull(user.planPeriodEnd)
  })
})
