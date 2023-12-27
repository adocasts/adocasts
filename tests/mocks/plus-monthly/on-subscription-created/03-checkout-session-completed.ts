import User from 'App/Models/User'
import { DateTime, DurationLike } from 'luxon'


export const MockPlusMonthlyCheckoutSessionCompleted = (user: User, offset: DurationLike = {}) => {
  const start = DateTime.now().plus(offset)
  
  return {
    "object": {
      "id": "cs_test_a1pK9kmubhGyxPDsAAmvqlLEFAqkpWwcToOm96CFtqk0IwMDAWorXwdhmf",
      "object": "checkout.session",
      "after_expiration": null,
      "allow_promotion_codes": null,
      "amount_subtotal": 500,
      "amount_total": 500,
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
          "postal_code": "22342",
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
      "expires_at": 1692117413,
      "invoice": "in_1Nf3lmFPw3xO2XBh0uXh5Leu",
      "invoice_creation": null,
      "livemode": false,
      "locale": null,
      "metadata": {
      },
      "mode": "subscription",
      "payment_intent": null,
      "payment_link": null,
      "payment_method_collection": "always",
      "payment_method_options": null,
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
      "subscription": "sub_1Nf3lmFPw3xO2XBhLm3Xhq9M",
      "success_url": "http://localhost:3333/stripe/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan_id=2",
      "total_details": {
        "amount_discount": 0,
        "amount_shipping": 0,
        "amount_tax": 0
      },
      "url": null
    }
  }
}