'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  Upload, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Crown,
  User
} from 'lucide-react'
import type { UserProfile } from '@/types/database'
import { getTierName } from '@/lib/subscription-config'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            setUserProfile(profile)
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getTierColor = (tier: string) => {
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

  const getTierIcon = (tier: string) => {
    if (tier !== 'free') {
      return <Crown className="h-3 w-3" />
    }
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0 lg:static lg:z-auto
        ${isCollapsed ? 'lg:w-16' : 'w-64 lg:w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">Legalese</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ) : userProfile ? (
              <div className={`${isCollapsed ? 'hidden lg:block' : ''}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile.full_name || 'User'}
                      </p>
                      {userProfile.company_name && (
                        <p className="text-xs text-gray-500 truncate">
                          {userProfile.company_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getTierColor(userProfile.subscription_tier)}`}
                  >
                    {getTierIcon(userProfile.subscription_tier)}
                    <span className="ml-1">{getTierName(userProfile.subscription_tier)}</span>
                  </Badge>
                )}
              </div>
            ) : null}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
              onClick={() => router.push('/dashboard')}
            >
              <FileText className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Documents</span>}
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
              onClick={() => router.push('/dashboard?tab=upload')}
            >
              <Upload className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Upload</span>}
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'px-2' : ''}`}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={onToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  )
}