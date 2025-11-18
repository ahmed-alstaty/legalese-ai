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
  getRemainingAnalyses,
  isUnlimited
} from '@/lib/subscription-config'

interface UsageData {
  total_documents_used: number
  limit: number
  percentage: number
  remaining: number
  subscription_tier: string
  is_unlimited: boolean
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
        
        // Use lifetime_documents_created field for accurate tracking
        const documentsUsed = profile.lifetime_documents_created || 0
        const limit = getTierLimit(profile.subscription_tier)
        const percentage = getUsagePercentage(documentsUsed, profile.subscription_tier)
        const remaining = getRemainingAnalyses(documentsUsed, profile.subscription_tier)
        const unlimited = isUnlimited(profile.subscription_tier)

        setUsageData({
          total_documents_used: documentsUsed,
          limit,
          percentage,
          remaining,
          subscription_tier: profile.subscription_tier,
          is_unlimited: unlimited
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
              <span>Document Usage</span>
            </CardTitle>
            <Badge variant="outline" className={getTierBadgeStyle(usageData.subscription_tier)}>
              {usageData.subscription_tier !== 'free' ? (
                <Crown className="h-3 w-3 mr-1" />
              ) : null}
              <span>{getTierName(usageData.subscription_tier)}</span>
            </Badge>
          </div>
          <CardDescription>
            {usageData.is_unlimited 
              ? 'You have unlimited document analyses'
              : `Free trial: ${usageData.remaining} of 3 documents remaining (lifetime limit)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Progress */}
          {!usageData.is_unlimited && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {usageData.total_documents_used} of {usageData.limit} documents used
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
                <span>{Math.round(usageData.percentage)}% of lifetime limit used</span>
                <span className="text-red-600 font-medium">No reset - lifetime limit</span>
              </div>
            </div>
          )}
          
          {usageData.is_unlimited && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Unlimited Document Analyses
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Your {getTierName(usageData.subscription_tier)} plan includes unlimited document analyses
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats */}
          {!usageData.is_unlimited && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {usageData.total_documents_used}
                </div>
                <div className="text-xs text-gray-500">Documents Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {usageData.remaining}
                </div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
            </div>
          )}
          
          {usageData.subscription_tier === 'free' && usageData.remaining === 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-900">
                    Free trial limit reached
                  </h4>
                  <p className="text-xs text-red-700 mt-1">
                    You've used all 3 free documents. Upgrade to continue analyzing documents.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}