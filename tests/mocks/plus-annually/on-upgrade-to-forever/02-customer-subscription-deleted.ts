import User from 'App/Models/User'
import { DateTime, DurationLike } from 'luxon'

export const MockPlusAnnuallyUpgradeToForeverCustomerSubscriptionDeleted = (user: User, offset: DurationLike = {}) => {
  const end = DateTime.now().plus(offset)

  return {
    "object": {
      "id": "sub_1Nf3lmFPw3xO2XBhLm3Xhq9M",
      "object": "subscription",
      "application": null,
      "application_fee_percent": null,
      "automatic_tax": {
        "enabled": false
      },
      "billing_cycle_anchor": 1692057145,
      "billing_thresholds": null,
      "cancel_at": null,
      "cancel_at_period_end": false,
      "canceled_at": end.toSeconds(),
      "cancellation_details": {
        "comment": null,
        "feedback": null,
        "reason": "cancellation_requested"
      },
      "collection_method": "charge_automatically",
      "created": 1692031050,
      "currency": "usd",
      "current_period_end": end.plus({ days: 15 }).toSeconds(),
      "current_period_start": end.minus({ days: 15 }).toSeconds(),
      "customer": user.stripeCustomerId,
      "days_until_due": null,
      "default_payment_method": "pm_1Nf3llFPw3xO2XBhRCImyWLG",
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
              "id": "price_1NzooOFPw3xO2XBhDO2K7tfb",
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
              "id": "price_1NzooOFPw3xO2XBhDO2K7tfb",
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
      "latest_invoice": "in_1NfAYgFPw3xO2XBhd6UoPFZE",
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
        "id": "price_1NzooOFPw3xO2XBhDO2K7tfb",
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
      "start_date": 1692031050,
      "status": "canceled",
      "test_clock": null,
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