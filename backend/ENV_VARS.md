# Backend environment variables

- Create a `.env` file in `backend/` with the following keys.
- Do NOT commit your real `.env` file.

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly
STRIPE_PRICE_PRO_YEARLY=price_pro_yearly

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Retell
RETELL_API_KEY=rtll_...
RETELL_AGENT_ID=agent_...

# Vapi
VAPI_PRIVATE_API_KEY=your_vapi_private_key
```
