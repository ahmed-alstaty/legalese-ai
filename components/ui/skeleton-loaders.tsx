import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Document List Skeleton - matches exact structure
export function DocumentListSkeleton() {
  return (
    <Card className="animate-in fade-in-50 duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" /> {/* "Your Documents" */}
          <Skeleton className="h-4 w-44" /> {/* "3 documents uploaded" */}
        </div>
        <Skeleton className="h-10 w-32 rounded-md" /> {/* Upload New button */}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center space-x-4 p-4 border rounded-lg animate-in fade-in-50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* File icon */}
              <div className="flex-shrink-0">
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              
              {/* File details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Skeleton className="h-4 w-48" /> {/* Filename */}
                  <Skeleton className="h-5 w-16 rounded-full" /> {/* Status badge */}
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <Skeleton className="h-3 w-28" /> {/* Date */}
                  <Skeleton className="h-3 w-16" /> {/* Size */}
                  <Skeleton className="h-3 w-12" /> {/* Type */}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20 rounded-md" /> {/* Analyze button */}
                <Skeleton className="h-8 w-8 rounded-md" /> {/* Menu button */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard Stats Skeleton - with staggered animation
export function DashboardStatsSkeleton() {
  const stats = [
    { label: 'Total Documents', value: '0' },
    { label: 'Pending Analysis', value: '0' },
    { label: 'Completed', value: '0' },
    { label: 'This Month', value: '0' }
  ]
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((_, i) => (
        <Card 
          key={i} 
          className="animate-in fade-in-50 slide-in-from-bottom-2"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-7 w-12 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Usage Tracker Skeleton
export function UsageTrackerSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

// Analysis Page Skeleton
export function AnalysisPageSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <div>
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-3 mt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat Skeleton */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          <div className="flex-1 p-4">
            <div className="flex flex-col items-center justify-center h-full">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Middle Panel - Document Skeleton */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="p-4 bg-blue-50 border-b">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </div>
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Feedback Skeleton */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-3 w-3 mt-0.5" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-12 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat Message Skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 ml-4 p-3 rounded-lg">
        <Skeleton className="h-3 w-12 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
      <div className="bg-gray-50 mr-4 p-3 rounded-lg">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </div>
    </div>
  )
}

// Document Upload Skeleton
export function DocumentUploadSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded mb-4" />
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-36 mb-4" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="border rounded-lg">
        {/* Header */}
        <div className="border-b bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="border-b p-4 last:border-b-0">
            <div className="flex items-center justify-between">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}