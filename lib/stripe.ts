import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Subscription tier configurations
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: [
      '1 document analysis per month',
      'Basic risk assessment',
      'Email support',
    ],
    analysisLimit: 1,
  },
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 29,
    features: [
      '10 document analyses per month',
      'Advanced risk assessment',
      'AI-powered chat support',
      'Priority email support',
      'Export to PDF',
    ],
    analysisLimit: 10,
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    price: 99,
    features: [
      'Unlimited document analyses',
      'Advanced risk assessment',
      'AI-powered chat support',
      'Priority support',
      'Export to PDF',
      'Team collaboration',
      'API access',
    ],
    analysisLimit: -1, // -1 means unlimited
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

export function getSubscriptionTier(priceId: string | null): SubscriptionTier {
  if (!priceId) return 'free'
  
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.priceId === priceId) {
      return tier as SubscriptionTier
    }
  }
  
  return 'free'
}

export function canUserAnalyze(
  tier: SubscriptionTier,
  currentUsage: number
): boolean {
  const config = SUBSCRIPTION_TIERS[tier]
  return config.analysisLimit === -1 || currentUsage < config.analysisLimit
}

// Helper function to create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // First, try to find existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })

  return customer.id
}

// Helper function to format currency
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Webhook event types we care about
export const WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS