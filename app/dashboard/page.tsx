'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DocumentList } from '@/components/dashboard/document-list'
import { DocumentUpload } from '@/components/dashboard/document-upload'
import { UsageTracker } from '@/components/dashboard/usage-tracker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardStatsSkeleton, DocumentListSkeleton, UsageTrackerSkeleton } from '@/components/ui/skeleton-loaders'
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import type { UserProfile } from '@/types/database'

interface DashboardStats {
  total_documents: number
  pending_analyses: number
  completed_analyses: number
  analyses_this_month: number
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const supabase = createClient()

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'upload', 'usage'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Store user email
      setUserEmail(user.email || '')

      // Fetch user profile
      let { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist, create one
      if (!profile) {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            subscription_tier: 'free',
            subscription_status: 'active',
            analyses_used_this_month: 0
          })
          .select()
          .single()
        
        profile = newProfile
      }

      if (profile) {
        setUserProfile(profile)
      }

      // Fetch document stats
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)

      // Fetch analysis stats
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)

      if (documents && analyses) {
        const pendingDocs = documents.filter(doc => doc.status === 'uploaded' || doc.status === 'processing')
        const completedAnalyses = analyses.length

        setStats({
          total_documents: documents.length,
          pending_analyses: pendingDocs.length,
          completed_analyses: completedAnalyses,
          analyses_this_month: profile?.analyses_used_this_month || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats Cards */}
        <DashboardStatsSkeleton />
        
        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DocumentListSkeleton />
          </div>
          <div className="space-y-6">
            <UsageTrackerSkeleton />
            {/* Quick Actions Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Users - Moved to Top */}
      {stats && stats.total_documents === 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">
                  Welcome to Legalese!
                </h3>
                <p className="text-indigo-700 mt-1">
                  Upload your first legal document to get started with AI-powered analysis.
                  <br />
                  <span className="font-semibold">Free trial: 3 documents lifetime limit</span>
                </p>
              </div>
              <Button 
                onClick={() => setActiveTab('upload')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Upload Your First Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600">
          {stats && userProfile?.subscription_tier === 'free' 
            ? `Free trial: You can analyze up to 3 documents total. ${3 - (stats.total_documents || 0)} remaining.`
            : 'Welcome to your legal document analysis dashboard. Upload documents to get started.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_documents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-gray-600">Pending Analysis</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending_analyses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-gray-600">Completed</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completed_analyses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-gray-600">Total Used</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_documents}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Usage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DocumentList />
            </div>
            <div className="space-y-6">
              <UsageTracker />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const subject = encodeURIComponent('Help Request - Legalese App')
                      const body = encodeURIComponent(
                        `Hello Legalese Support Team,\n\n` +
                        `I need help with:\n\n` +
                        `[Please describe your issue or question here]\n\n` +
                        `User Details:\n` +
                        `- Name: ${userProfile?.full_name || 'Not provided'}\n` +
                        `- Email: ${userEmail || 'Not provided'}\n` +
                        `- Subscription: ${userProfile?.subscription_tier || 'free'}\n\n` +
                        `Best regards`
                      )
                      window.location.href = `mailto:contact@getlegalese.app?subject=${subject}&body=${body}`
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Need Help?
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="max-w-2xl">
            <UsageTracker />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}