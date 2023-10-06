import User from 'App/Models/User'
import { DateTime, DurationLike } from 'luxon'

export const MockPlusAnnuallyCustomerSubscriptionDeleted = (user: User, offset: DurationLike = {}) => {
  const end = DateTime.now().plus(offset)

  return {
    "object": {
      "id": "sub_1NeeUAFPw3xO2XBhAiaN9k3f",
      "object": "subscription",
      "application": null,
      "application_fee_percent": null,
      "automatic_tax": {
        "enabled": false
      },
      "billing_cycle_anchor": 1718562780,
      "billing_thresholds": null,
      "cancel_at": end.toSeconds(),
      "cancel_at_period_end": true,
      "canceled_at": 1725136380,
      "cancellation_details": {
        "comment": "test",
        "feedback": "other",
        "reason": "cancellation_requested"
      },
      "collection_method": "charge_automatically",
      "created": 1691933617,
      "currency": "usd",
      "current_period_end": end.toSeconds(),
      "current_period_start": end.minus({ year: 1 }).toSeconds(),
      "customer": user.stripeCustomerId,
      "days_until_due": null,
      "default_payment_method": "pm_1NeeU9FPw3xO2XBhOG8o2StB",
      "default_source": null,
      "default_tax_rates": [
      ],
      "description": null,
      "discount": null,
      "ended_at": end.toSeconds(),
      "items": {
        "object": "list",
        "data": [
          {
            "id": "si_OSo7Q1hPqnbRr5",
            "object": "subscription_item",
            "billing_thresholds": null,
            "created": 1692226099,
            "metadata": {
            },
            "plan": {
              "id": "price_1LbTUAFPw3xO2XBhVTPfzrri",
              "object": "plan",
              "active": true,
              "aggregate_usage": null,
              "amount": 5000,
              "amount_decimal": "5000",
              "billing_scheme": "per_unit",
              "created": 1661623918,
              "currency": "usd",
              "interval": "year",
              "interval_count": 1,
              "livemode": false,
              "metadata": {
              },
              "nickname": null,
              "product": "prod_MK7j6nBYZtcSKQ",
              "tiers_mode": null,
              "transform_usage": null,
              "trial_period_days": null,
              "usage_type": "licensed"
            },
            "price": {
              "id": "price_1LbTUAFPw3xO2XBhVTPfzrri",
              "object": "price",
              "active": true,
              "billing_scheme": "per_unit",
              "created": 1661623918,
              "currency": "usd",
              "custom_unit_amount": null,
              "livemode": false,
              "lookup_key": null,
              "metadata": {
              },
              "nickname": null,
              "product": "prod_MK7j6nBYZtcSKQ",
              "recurring": {
                "aggregate_usage": null,
                "interval": "year",
                "interval_count": 1,
                "trial_period_days": null,
                "usage_type": "licensed"
              },
              "tax_behavior": "exclusive",
              "tiers_mode": null,
              "transform_quantity": null,
              "type": "recurring",
              "unit_amount": 5000,
              "unit_amount_decimal": "5000"
            },
            "quantity": 1,
            "subscription": "sub_1NfsViFPw3xO2XBhotVJhqGH",
            "tax_rates": [
            ]
          }
        ],
        "has_more": false,
        "total_count": 1,
        "url": "/v1/subscription_items?subscription=sub_1NfsViFPw3xO2XBhotVJhqGH"
      },
      "latest_invoice": "in_1Nehz8FPw3xO2XBhjiiqEMRN",
      "livemode": false,
      "metadata": {
      },
      "next_pending_invoice_item_invoice": null,
      "on_behalf_of": null,
      "pause_collection": null,
      "payment_settings": {
        "payment_method_options": null,
        "payment_method_types": null,
        "save_default_payment_method": "off"
      },
      "pending_invoice_item_interval": null,
      "pending_setup_intent": null,
      "pending_update": null,
      "plan": {
        "id": "price_1LbTUAFPw3xO2XBhVTPfzrri",
        "object": "plan",
        "active": true,
        "aggregate_usage": null,
        "amount": 5000,
        "amount_decimal": "5000",
        "billing_scheme": "per_unit",
        "created": 1661623918,
        "currency": "usd",
        "interval": "year",
        "interval_count": 1,
        "livemode": false,
        "metadata": {
        },
        "nickname": null,
        "product": "prod_MK7j6nBYZtcSKQ",
        "tiers_mode": null,
        "transform_usage": null,
        "trial_period_days": null,
        "usage_type": "licensed"
      },
      "quantity": 1,
      "schedule": null,
      "start_date": 1691933617,
      "status": "canceled",
      "test_clock": "clock_1NeeQuFPw3xO2XBhIbPDB9Dc",
      "transfer_data": null,
      "trial_end": null,
      "trial_settings": {
        "end_behavior": {
          "missing_payment_method": "create_invoice"
        }
      },
      "trial_start": null
    }
  }
}