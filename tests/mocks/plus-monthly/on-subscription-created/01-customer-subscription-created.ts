import User from 'App/Models/User'
import { DateTime, DurationLike } from 'luxon'

export const MockPlusMonthlyCustomerSubscriptionCreated = (user: User, offset: DurationLike = {}) => {
  const start = DateTime.now().plus(offset)

  return {
    "object": {
      "id": "sub_1Nf3lmFPw3xO2XBhLm3Xhq9M",
      "object": "subscription",
      "application": null,
      "application_fee_percent": null,
      "automatic_tax": {
        "enabled": false
      },
      "billing_cycle_anchor": start.toSeconds(),
      "billing_thresholds": null,
      "cancel_at": null,
      "cancel_at_period_end": false,
      "canceled_at": null,
      "cancellation_details": {
        "comment": null,
        "feedback": null,
        "reason": null
      },
      "collection_method": "charge_automatically",
      "created": start.toSeconds(),
      "currency": "usd",
      "current_period_end": start.plus({ month: 1 }).toSeconds(),
      "current_period_start": start.toSeconds(),
      "customer": user.stripeCustomerId,
      "days_until_due": null,
      "default_payment_method": null,
      "default_source": null,
      "default_tax_rates": [
      ],
      "description": null,
      "discount": null,
      "ended_at": null,
      "items": {
        "object": "list",
        "data": [
          {
            "id": "si_ORxhY5R46QIyCy",
            "object": "subscription_item",
            "billing_thresholds": null,
            "created": 1692031051,
            "metadata": {
            },
            "plan": {
              "id": "price_1Nzon4FPw3xO2XBhZe5ETPF7",
              "object": "plan",
              "active": true,
              "aggregate_usage": null,
              "amount": 500,
              "amount_decimal": "500",
              "billing_scheme": "per_unit",
              "created": 1661623918,
              "currency": "usd",
              "interval": "month",
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
              "id": "price_1Nzon4FPw3xO2XBhZe5ETPF7",
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
                "interval": "month",
                "interval_count": 1,
                "trial_period_days": null,
                "usage_type": "licensed"
              },
              "tax_behavior": "exclusive",
              "tiers_mode": null,
              "transform_quantity": null,
              "type": "recurring",
              "unit_amount": 500,
              "unit_amount_decimal": "500"
            },
            "quantity": 1,
            "subscription": "sub_1Nf3lmFPw3xO2XBhLm3Xhq9M",
            "tax_rates": [
            ]
          }
        ],
        "has_more": false,
        "total_count": 1,
        "url": "/v1/subscription_items?subscription=sub_1Nf3lmFPw3xO2XBhLm3Xhq9M"
      },
      "latest_invoice": "in_1Nf3lmFPw3xO2XBh0uXh5Leu",
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
        "id": "price_1Nzon4FPw3xO2XBhZe5ETPF7",
        "object": "plan",
        "active": true,
        "aggregate_usage": null,
        "amount": 500,
        "amount_decimal": "500",
        "billing_scheme": "per_unit",
        "created": 1661623918,
        "currency": "usd",
        "interval": "month",
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
      "start_date": start.toSeconds(),
      "status": "incomplete",
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