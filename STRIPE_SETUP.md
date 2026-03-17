# Stripe Payment Gateway Setup Guide

## Overview
This guide explains how to configure and use the Stripe payment gateway integration in your Gym Management System.

## Prerequisites
- Stripe account (https://stripe.com)
- Node.js and npm installed
- React frontend setup

## Step 1: Get Your Stripe Keys

1. **Create a Stripe Account**
   - Go to https://stripe.com
   - Sign up and complete verification

2. **Access API Keys**
   - Go to Dashboard → Developers → API Keys
   - You'll find:
     - **Publishable Key**: Used in frontend (public, safe to expose)
     - **Secret Key**: Used in backend (keep private, never share)

## Step 2: Environment Configuration

### Backend (.env file)

Add these variables to your `server/.env` file:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_live_your_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

**For Testing (Use Test Keys)**
- Stripe provides test keys in test mode
- Use test card numbers: `4242 4242 4242 4242` (Visa)
- Any future expiration date and any 3-digit CVC

### Frontend (.env file)

Add this to your `client/.env` file:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key_here
VITE_API_BASE_URL=http://localhost:5000/api
```

## Step 3: Install Dependencies

### Backend
```bash
cd server
npm install stripe
```

### Frontend
```bash
cd client
npm install @stripe/react-stripe-js @stripe/js
```

## Step 4: Database Setup

The Payment model has been updated with Stripe-specific fields:
- `stripePaymentIntentId`: Stripe payment intent ID
- `stripeSessionId`: Stripe checkout session ID
- `stripeCustomerId`: Stripe customer ID
- `receipt_url`: Stripe receipt URL

No migration needed - MongoDB will add fields on first use.

## Step 5: Webhook Setup (Important for Production)

### Create a Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add Endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)

# Login to your Stripe account
stripe login

# Forward webhook events to your local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Use the webhook secret from the CLI output
```

## Step 6: API Endpoints

### Create Checkout Session
```
POST /api/stripe/payment/checkout-session
Headers: Authorization: Bearer {token}
Body: {
  userId: "user_id",
  amount: 99.99,
  description: "Gym membership",
  membershipType: "premium"
}
Response: {
  success: true,
  sessionId: "cs_...",
  clientSecret: "pi_..."
}
```

### Create Payment Intent
```
POST /api/stripe/payment/intent
Headers: Authorization: Bearer {token}
Body: {
  userId: "user_id",
  amount: 99.99,
  description: "Gym membership"
}
Response: {
  success: true,
  clientSecret: "pi_secret_...",
  paymentIntentId: "pi_..."
}
```

### Verify Payment
```
POST /api/stripe/payment/verify
Headers: Authorization: Bearer {token}
Body: {
  sessionId: "cs_...",  // OR paymentIntentId
  userId: "user_id",
  amount: 99.99,
  description: "Gym membership"
}
Response: {
  success: true,
  payment: { payment object }
}
```

### Get User Payments
```
GET /api/stripe/user/{userId}/payments
Headers: Authorization: Bearer {token}
Response: {
  payments: [...]
}
```

## Step 7: Usage in Frontend

### Admin Dashboard Payment Form
- Navigate to Admin → Payments tab
- Click "Add Payment"
- Select payment method: "Stripe"
- Enter amount and description
- Click "Pay with Stripe" button
- Redirected to Stripe Checkout
- Payment automatically saved on success

### Member Dashboard Payment
- Navigate to Member → Payments tab
- Select payment method: "Stripe"
- Enter amount
- Click "Pay with Stripe" button
- Redirected to Stripe Checkout
- Payment history updated on success

## Step 8: Testing Payments

### Test Cards
| Card Number | Name | Expiry | CVC |
|------------|------|--------|-----|
| 4242 4242 4242 4242 | VISA (Success) | Any future date | Any 3-digit |
| 4000 0000 0000 9995 | VISA (Decline) | Any future date | Any 3-digit |
| 5555 5555 5555 4444 | Mastercard (Success) | Any future date | Any 3-digit |

### Successful Test Payment
1. Use test card `4242 4242 4242 4242`
2. Any future expiration date
3. Any 3-digit CVC
4. Click "Pay" → Success

### Failed Test Payment
1. Use test card `4000 0000 0000 9995`
2. Click "Pay" → Shows decline message

## Step 9: Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Replace test keys with live keys in `.env`
   - Update `VITE_STRIPE_PUBLIC_KEY` with live key

2. **Configure Webhook**
   - Set up webhook endpoint with live URL
   - Use live webhook secret

3. **Test Full Flow**
   - Create test transaction
   - Verify payment appears in database
   - Check Stripe dashboard

4. **Set SSL/HTTPS**
   - Stripe requires HTTPS in production
   - Update `FRONTEND_URL` to HTTPS

## Troubleshooting

### "Invalid API Key"
- Check key format (should start with `pk_` or `sk_`)
- Verify you're using correct mode (test/live)
- Restart server after updating .env

### "Session not found"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook is properly configured
- Verify session ID in database

### Payment not saving
- Check database connection
- Verify userId exists
- Check server logs for errors

### Frontend not loading Stripe
- Verify `VITE_STRIPE_PUBLIC_KEY` is set
- Check Stripe.js wrapper in component tree
- No console errors about missing Stripe

## File Locations

```
server/
  src/
    api/
      controllers/
        stripeController.js      ← Payment logic
      routes/
        stripeRoutes.js          ← API endpoints
    config/
      stripe.js                  ← Stripe configuration
    models/
      Payment.js                 ← Updated with Stripe fields

client/
  src/
    components/
      StripePayment.jsx          ← Stripe UI components
    pages/
      AdminDashboardPage.jsx     ← Admin integration
      MemberDashboardPage.jsx    ← Member integration
```

## Security Best Practices

1. **Never commit .env files** with real keys
2. **Use test keys for development**
3. **Enable webhook signature verification** (done in code)
4. **Never expose secret key** in frontend
5. **Validate amounts** on backend before charging
6. **Use HTTPS** in production
7. **Regularly rotate webhook secrets**
8. **Monitor Stripe dashboard** for suspicious activity

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Test Data: https://stripe.com/docs/testing
- React Integration: https://stripe.com/docs/stripe-js/react

## Next Steps

1. Create Stripe account and get API keys
2. Update `.env` files with keys
3. Install dependencies
4. Test payment flow with test cards
5. Deploy to production with live keys
6. Monitor payments in Stripe dashboard
