import User from 'App/Models/User'
import { DateTime, DurationLike } from 'luxon'


export const MockPlusForeverCheckoutSessionCompleted = (user: User, offset: DurationLike = {}) => {
  const start = DateTime.now().plus(offset)
  
  return {
    "object": {
      "id": "cs_test_a1E3eqjWTAlzo3vsPCe0iiXdNQsu1Vj3EZpW5tyadLRJx70vP1CzRAKKX6",
      "object": "checkout.session",
      "after_expiration": null,
      "allow_promotion_codes": null,
      "amount_subtotal": 24900,
      "amount_total": 24900,
      "automatic_tax": {
        "enabled": false,
        "status": null
      },
      "billing_address_collection": null,
      "cancel_url": "http://localhost:3333",
      "client_reference_id": null,
      "consent": null,
      "consent_collection": null,
      "created": start.toSeconds(),
      "currency": "usd",
      "currency_conversion": null,
      "custom_fields": [
      ],
      "custom_text": {
        "shipping_address": null,
        "submit": null
      },
      "customer": user.stripeCustomerId,
      "customer_creation": null,
      "customer_details": {
        "address": {
          "city": null,
          "country": "US",
          "line1": null,
          "line2": null,
          "postal_code": "40205",
          "state": null
        },
        "email": user.email,
        "name": user.username,
        "phone": null,
        "tax_exempt": "none",
        "tax_ids": [
        ]
      },
      "customer_email": null,
      "expires_at": 1692456415,
      "invoice": null,
      "invoice_creation": {
        "enabled": false,
        "invoice_data": {
          "account_tax_ids": null,
          "custom_fields": null,
          "description": null,
          "footer": null,
          "metadata": {
          },
          "rendering_options": null
        }
      },
      "livemode": false,
      "locale": null,
      "metadata": {
      },
      "mode": "payment",
      "payment_intent": "pi_3NgTxKFPw3xO2XBh1DSJQ7lF",
      "payment_link": null,
      "payment_method_collection": "always",
      "payment_method_options": {
      },
      "payment_method_types": [
        "card"
      ],
      "payment_status": "paid",
      "phone_number_collection": {
        "enabled": false
      },
      "recovered_from": null,
      "setup_intent": null,
      "shipping_address_collection": null,
      "shipping_cost": null,
      "shipping_details": null,
      "shipping_options": [
      ],
      "status": "complete",
      "submit_type": null,
      "subscription": null,
      "success_url": "http://localhost:3333/stripe/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan_id=4",
      "total_details": {
        "amount_discount": 0,
        "amount_shipping": 0,
        "amount_tax": 0
      },
      "url": null
    }
  }
}