# Frontend environment variables

Create a `.env` file in `frontend/` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BACKEND_URL=http://localhost:3000
VITE_STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly
VITE_STRIPE_PRICE_PRO_YEARLY=price_pro_yearly
VITE_VAPI_PUBLIC_API_KEY=your_vapi_public_key
```

Never commit real `.env` values.
