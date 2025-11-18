// Centralized subscription configuration
// This ensures consistency across the entire application

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Trial',
    price: 0,
    lifetimeAnalyses: 3,
    features: [
      'Up to 3 documents total (lifetime limit)',
      'Basic AI analysis',
      'Standard processing time',
      'Email support'
    ]
  },
  basic: {
    name: 'Basic',
    price: 19,
    lifetimeAnalyses: 999999, // Unlimited for paid tiers
    features: [
      'Unlimited document analyses',
      'Advanced AI analysis',
      'Priority processing',
      'Email & chat support',
      'Export to PDF'
    ]
  },
  pro: {
    name: 'Pro',
    price: 49,
    lifetimeAnalyses: 999999, // Unlimited for paid tiers
    features: [
      'Unlimited document analyses',
      'Premium AI analysis with GPT-4',
      'Instant processing',
      'Priority support',
      'Export to PDF & Word',
      'API access',
      'Custom templates'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    lifetimeAnalyses: 999999, // Unlimited for paid tiers
    features: [
      'Unlimited document analyses',
      'Premium AI analysis with GPT-4',
      'Instant processing',
      'Dedicated support',
      'All export formats',
      'API access',
      'Custom integrations',
      'White-label options'
    ]
  }
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Helper functions
export function getTierLimit(tier: string): number {
  const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier]
  return tierConfig?.lifetimeAnalyses || SUBSCRIPTION_TIERS.free.lifetimeAnalyses
}

export function getTierPrice(tier: string): number {
  const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier]
  return tierConfig?.price || 0
}

export function getTierName(tier: string): string {
  const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier]
  return tierConfig?.name || 'Free Trial'
}

export function getUsagePercentage(used: number, tier: string): number {
  const limit = getTierLimit(tier)
  // For paid tiers with unlimited, show 0%
  if (limit > 1000) return 0
  return Math.min((used / limit) * 100, 100)
}

export function getRemainingAnalyses(used: number, tier: string): number {
  const limit = getTierLimit(tier)
  // For paid tiers with unlimited
  if (limit > 1000) return 999999
  return Math.max(limit - used, 0)
}

export function isUnlimited(tier: string): boolean {
  const limit = getTierLimit(tier)
  return limit > 1000
}