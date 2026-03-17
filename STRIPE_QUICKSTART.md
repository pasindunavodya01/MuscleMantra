# Stripe Integration - Quick Start Checklist ✅

## Pre-Setup (5 minutes)
- [ ] Create Stripe account at https://stripe.com
- [ ] Verify your email
- [ ] Complete identity verification

## API Keys Setup (2 minutes)
- [ ] Go to Stripe Dashboard → Developers → API Keys
- [ ] Find your test Publishable Key (pk_test_...)
- [ ] Find your test Secret Key (sk_test_...)
- [ ] Save these keys somewhere safe

## Environment Configuration (3 minutes)

### Server Setup
```bash
cd server
```
- [ ] Open or create `.env` file
- [ ] Add: `STRIPE_PUBLIC_KEY=pk_test_yourkeyhere`
- [ ] Add: `STRIPE_SECRET_KEY=sk_test_yourkeyhere`
- [ ] Add: `STRIPE_WEBHOOK_SECRET=whsec_yourkeyhere` (leave blank for now)
- [ ] Ensure `FRONTEND_URL=http://localhost:5173` exists

### Client Setup
```bash
cd ../client
```
- [ ] Open or create `.env` file
- [ ] Add: `VITE_STRIPE_PUBLIC_KEY=pk_test_yourkeyhere`
- [ ] Ensure API URL is correct: `VITE_API_BASE_URL=http://localhost:5000/api`

## Dependencies Installation (5 minutes)

```bash
# In server directory
cd server
npm install stripe

# In client directory  
cd ../client
npm install @stripe/react-stripe-js @stripe/js

# Verify installations
npm list stripe
npm list @stripe/react-stripe-js
```

- [ ] Server: stripe installed ✓
- [ ] Client: @stripe/react-stripe-js installed ✓
- [ ] Client: @stripe/js installed ✓

## Start Servers (2 minutes)

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend  
cd ../client
npm run dev
```

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] No console errors

## Test Payment Flow (10 minutes)

### Test as Admin
1. [ ] Navigate to http://localhost:5173/admin
2. [ ] Click "Payments" tab
3. [ ] Click "Add Payment" button
4. [ ] Select a member user
5. [ ] Enter amount: **10.00**
6. [ ] Select payment method: **Stripe**
7. [ ] Click "Pay with Stripe" button
8. [ ] Should redirect to Stripe Checkout page
9. [ ] Card details to use:
    - Number: `4242 4242 4242 4242`
    - Expiry: Any future date (e.g., 12/25)
    - CVC: Any 3 digits (e.g., 123)
    - Name: Test
10. [ ] Click "Pay" button
11. [ ] Should redirect back to dashboard
12. [ ] Success message appears
13. [ ] Payment appears in history

### Test as Member
1. [ ] Navigate to http://localhost:5173/member
2. [ ] Click "Payments" tab
3. [ ] Enter amount: **10.00**
4. [ ] Select payment method: **Stripe**
5. [ ] Click "Pay with Stripe" button
6. [ ] Follow Stripe Checkout with test card
7. [ ] Payment should appear in history

## Database Verification (2 minutes)

Check that payment was saved:

```bash
# Using MongoDB CLI or Compass
# In 'gym-management' database
# Check 'payments' collection
# Should see new payment with:
# - amount: 10
# - paymentMethod: "stripe"
# - status: "completed"
# - stripeSessionId: populated
```

- [ ] Payment found in database
- [ ] Stripe fields populated
- [ ] Status is "completed"

## Stripe Dashboard Check (2 minutes)

1. [ ] Go to https://dashboard.stripe.com
2. [ ] Click "Payments" in left menu
3. [ ] Should see your test payment
4. [ ] Status should be "Successful"
5. [ ] Amount should be $10.00 USD

## Documentation Review (5 minutes)

- [ ] Read [STRIPE_SETUP.md](STRIPE_SETUP.md) - Comprehensive guide
- [ ] Read [STRIPE_IMPLEMENTATION.md](STRIPE_IMPLEMENTATION.md) - Technical details
- [ ] Review API endpoints section
- [ ] Bookmark Stripe docs link

## Issues Troubleshooting

### Payment button not appearing?
- [ ] Check browser console for errors
- [ ] Verify `VITE_STRIPE_PUBLIC_KEY` is set
- [ ] Restart frontend: `npm run dev`
- [ ] Check Network tab in Dev Tools

### Stripe checkout not loading?
- [ ] Verify API keys are correct
- [ ] Check server is running on port 5000
- [ ] Look for errors in server console
- [ ] Check `.env` file has no typos

### Payment not saving to database?
- [ ] Verify MongoDB is running
- [ ] Check server logs for errors
- [ ] Verify user ID is correct
- [ ] Check database connection string

### "Invalid API Key" error?
- [ ] Verify key format (pk_test_ or sk_test_)
- [ ] Check for spaces/typos in keys
- [ ] Restart server after updating .env
- [ ] Use correct key in correct place (pub key in frontend, secret in backend)

## Optional: Webhook Testing (10 minutes)

For production-like testing:

```bash
# Install Stripe CLI from: https://stripe.com/docs/stripe-cli

# Login to your account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Copy webhook secret and add to .env:
STRIPE_WEBHOOK_SECRET=whsec_...

# Make a test payment and check webhook events
```

- [ ] Stripe CLI installed
- [ ] Webhook forwarding working
- [ ] Webhook secret in .env

## Production Preparation (Future)

When ready to go live:

- [ ] Create new Stripe account or use production mode
- [ ] Get live API keys (pk_live_ and sk_live_)
- [ ] Update `.env` files with live keys
- [ ] Configure webhook with production URL
- [ ] Enable HTTPS
- [ ] Test with real payment method
- [ ] Monitor Stripe dashboard
- [ ] Set up email receipts if desired

## Quick Reference

### Test Card Numbers
```
Visa:               4242 4242 4242 4242
Visa Decline:       4000 0000 0000 9995
Mastercard:         5555 5555 5555 4444
American Express:   3782 822463 10005
```

### Important URLs
```
Stripe Dashboard:   https://dashboard.stripe.com
API Keys:           https://dashboard.stripe.com/developers/api/keys
Documentation:      https://stripe.com/docs
```

### Key Commands
```bash
# Restart frontend
npm run dev

# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Check .env file
cat .env  # Linux/Mac
type .env # Windows
```

## Completion Status

- [ ] All environment variables set
- [ ] All dependencies installed
- [ ] Both servers running
- [ ] Test payment successful
- [ ] Payment saved in database
- [ ] Payment appears in Stripe dashboard
- [ ] Ready for development

---

**Estimated Total Time: 30-45 minutes**

Once all checks are marked, you're ready to start using Stripe payments!

### Next Steps:
1. Review the payment flows in both dashboards
2. Customize payment descriptions and amounts as needed
3. Set up webhook for production
4. Configure email notifications
5. Deploy to production when ready

📚 **For detailed documentation, see:**
- [STRIPE_SETUP.md](STRIPE_SETUP.md) - Complete setup guide
- [STRIPE_IMPLEMENTATION.md](STRIPE_IMPLEMENTATION.md) - Implementation details

🎉 **Happy Payment Processing!**
