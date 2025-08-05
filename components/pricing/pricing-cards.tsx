'use client'

import { useState } from 'react'
import { Check, Loader2, Zap, Star, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_TIERS, formatPrice } from '@/lib/stripe'
import { useToast } from '@/hooks/use-toast'

interface PricingCardsProps {
  currentTier?: string
  className?: string
}

const tierIcons = {
  free: Zap,
  starter: Star,
  professional: Crown,
}

const tierColors = {
  free: 'text-gray-500',
  starter: 'text-blue-500',
  professional: 'text-purple-500',
}

export function PricingCards({ currentTier = 'free', className }: PricingCardsProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return
    
    setLoadingTier(tier)
    
    try {
      const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]
      
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: tierConfig.priceId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start subscription process',
        variant: 'destructive',
      })
    } finally {
      setLoadingTier(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoadingTier('manage')
    
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to access billing portal',
        variant: 'destructive',
      })
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
      {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => {
        const Icon = tierIcons[tier as keyof typeof tierIcons]
        const isCurrentTier = currentTier === tier
        const isPopular = tier === 'starter'
        const isProfessional = tier === 'professional'
        const isLoading = loadingTier === tier || (isCurrentTier && loadingTier === 'manage')

        return (
          <Card
            key={tier}
            className={`relative ${
              isPopular ? 'border-blue-500 shadow-lg scale-105' : ''
            } ${isProfessional ? 'border-purple-500 shadow-lg' : ''}`}
          >
            {isPopular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            {isProfessional && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                Best Value
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4">
                <Icon className={`h-8 w-8 ${tierColors[tier as keyof typeof tierColors]}`} />
              </div>
              <CardTitle className="text-xl">{config.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(config.price)}
                </span>
                {config.price > 0 && <span className="text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {isCurrentTier ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              ) : tier === 'free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className={`w-full ${
                    isPopular
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : isProfessional
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : ''
                  }`}
                  onClick={() => handleSubscribe(tier)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe to ${config.name}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}