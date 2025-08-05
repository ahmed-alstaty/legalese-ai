// Centralized subscription configuration
// This ensures consistency across the entire application

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    monthlyAnalyses: 5,
    features: [
      'Up to 5 document analyses per month',
      'Basic AI analysis',
      'Standard processing time',
      'Email support'
    ]
  },
  basic: {
    name: 'Basic',
    price: 19,
    monthlyAnalyses: 25,
    features: [
      'Up to 25 document analyses per month',
      'Advanced AI analysis',
      'Priority processing',
      'Email & chat support',
      'Export to PDF'
    ]
  },
  pro: {
    name: 'Pro',
    price: 49,
    monthlyAnalyses: 100,
    features: [
      'Up to 100 document analyses per month',
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
    monthlyAnalyses: 1000,
    features: [
      'Up to 1000 document analyses per month',
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
  return tierConfig?.monthlyAnalyses || SUBSCRIPTION_TIERS.free.monthlyAnalyses
}

export function getTierPrice(tier: string): number {
  const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier]
  return tierConfig?.price || 0
}

export function getTierName(tier: string): string {
  const tierConfig = SUBSCRIPTION_TIERS[tier as SubscriptionTier]
  return tierConfig?.name || 'Free'
}

export function getUsagePercentage(used: number, tier: string): number {
  const limit = getTierLimit(tier)
  return Math.min((used / limit) * 100, 100)
}

export function getRemainingAnalyses(used: number, tier: string): number {
  const limit = getTierLimit(tier)
  return Math.max(limit - used, 0)
}

export function getDaysRemainingInMonth(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function shouldResetMonthlyUsage(lastResetDate: Date | string): boolean {
  const last = new Date(lastResetDate)
  const now = new Date()
  
  // Reset if we're in a different month
  return (
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  )
}