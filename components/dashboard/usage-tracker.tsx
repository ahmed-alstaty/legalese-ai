'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UsageTrackerSkeleton } from '@/components/ui/skeleton-loaders'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { UserProfile } from '@/types/database'
import { 
  SUBSCRIPTION_TIERS,
  getTierLimit,
  getTierName,
  getUsagePercentage,
  getDaysRemainingInMonth
} from '@/lib/subscription-config'

interface UsageData {
  current_month_analyses: number
  limit: number
  percentage: number
  days_remaining: number
  subscription_tier: string
}

export function UsageTracker() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        
        const limit = getTierLimit(profile.subscription_tier)
        const percentage = getUsagePercentage(profile.analyses_used_this_month, profile.subscription_tier)
        const daysRemaining = getDaysRemainingInMonth()

        setUsageData({
          current_month_analyses: profile.analyses_used_this_month,
          limit,
          percentage,
          days_remaining: daysRemaining,
          subscription_tier: profile.subscription_tier
        })
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 100) return { icon: AlertTriangle, text: 'Limit reached', color: 'text-red-600' }
    if (percentage >= 90) return { icon: AlertTriangle, text: 'Nearly full', color: 'text-yellow-600' }
    return { icon: CheckCircle, text: 'Good usage', color: 'text-green-600' }
  }

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pro':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return <UsageTrackerSkeleton />
  }

  if (!usageData || !userProfile) {
    return null
  }

  const status = getUsageStatus(usageData.percentage)
  const StatusIcon = status.icon

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Usage This Month</span>
            </CardTitle>
            <Badge variant="outline" className={getTierBadgeStyle(usageData.subscription_tier)}>
              {usageData.subscription_tier !== 'free' ? (
                <Crown className="h-3 w-3 mr-1" />
              ) : null}
              <span>{getTierName(usageData.subscription_tier)}</span>
            </Badge>
          </div>
          <CardDescription>
            Track your document analyses and subscription limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {usageData.current_month_analyses} of {usageData.limit} analyses used
              </span>
              <div className="flex items-center space-x-1">
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
                <span className={`text-sm ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
            
            <Progress 
              value={usageData.percentage} 
              className="h-3"
            />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{Math.round(usageData.percentage)}% of limit used</span>
              <span>Resets in {usageData.days_remaining} days</span>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {usageData.current_month_analyses}
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {usageData.limit - usageData.current_month_analyses}
              </div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {usageData.days_remaining}
              </div>
              <div className="text-xs text-gray-500">Days Left</div>
            </div>
          </div>

          {/* Upgrade prompt for free users or near limit */}
          {(usageData.subscription_tier === 'free' || usageData.percentage >= 80) && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-indigo-900">
                    {usageData.subscription_tier === 'free' 
                      ? 'Ready to analyze more documents?' 
                      : 'Running low on analyses?'
                    }
                  </h4>
                  <p className="text-xs text-indigo-700 mt-1">
                    {usageData.subscription_tier === 'free'
                      ? `Upgrade to Basic for ${SUBSCRIPTION_TIERS.basic.monthlyAnalyses} analyses per month`
                      : 'Upgrade your plan to get more monthly analyses'
                    }
                  </p>
                  <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => (
              <div 
                key={tier}
                className={`p-3 rounded-lg border-2 ${
                  tier === usageData.subscription_tier 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    {tier !== 'free' && (
                      <Crown className="h-3 w-3 text-yellow-500 mr-1" />
                    )}
                    <span className="text-sm font-medium">{config.name}</span>
                  </div>
                  <div className="text-lg font-bold">
                    ${config.price}
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                  <div className="text-sm text-gray-700 mt-1">
                    {config.monthlyAnalyses} analyses
                  </div>
                  {tier === usageData.subscription_tier && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}