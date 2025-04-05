-- Table: public.subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,              -- Name of the subscription plan (e.g., "Starter", "Pro")
    price_cents INTEGER NOT NULL,         -- Price in cents for precise billing (USD cents)
    currency TEXT NOT NULL DEFAULT 'usd', -- Currency, defaulting to USD for simplicity
    interval TEXT NOT NULL DEFAULT 'monthly', -- Billing interval ('monthly', 'annual', etc.)
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
    trial_ends_at TIMESTAMP WITH TIME ZONE, -- Optional: when trial ends
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(), -- Billing period start
    current_period_end TIMESTAMP WITH TIME ZONE, -- Billing period end
    stripe_subscription_id TEXT,          -- Optional: Future Stripe integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);

alter table public.subscriptions enable row level security;

create policy "Tenant can manage their subscriptions"
on public.subscriptions
for all
to authenticated
using (tenant_id = (select tenant_id from public.users where id = auth.uid()))
with check (tenant_id = (select tenant_id from public.users where id = auth.uid()));

create policy "Service can manage subscriptions"
on public.subscriptions
for all
to service_role
using (true)
with check (true);

