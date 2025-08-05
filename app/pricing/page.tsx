import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PricingCards } from '@/components/pricing/pricing-cards'
import { Skeleton } from '@/components/ui/skeleton'

async function getCurrentTier() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 'free'
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  return profile?.subscription_tier || 'free'
}

function PricingCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

async function PricingContent() {
  const currentTier = await getCurrentTier()
  
  return <PricingCards currentTier={currentTier} />
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the legal analysis power you need with transparent, straightforward pricing.
            No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <Suspense fallback={<PricingCardsSkeleton />}>
          <PricingContent />
        </Suspense>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Can I change my plan at any time?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated 
                and take effect immediately.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                What happens when I reach my analysis limit?
              </h3>
              <p className="text-muted-foreground">
                On the Free plan, you'll need to wait until the next month or upgrade to continue 
                analyzing documents. Paid plans reset monthly, and Professional includes unlimited analyses.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Is my data secure?
              </h3>
              <p className="text-muted-foreground">
                Absolutely. We use enterprise-grade encryption and security measures to protect your 
                documents and analyses. Your data is never shared with third parties.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Can I cancel my subscription?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue to have access 
                to your paid features until the end of your billing period.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Do you offer refunds?
              </h3>
              <p className="text-muted-foreground">
                We offer a 14-day money-back guarantee for new subscriptions. If you're not 
                satisfied within the first 14 days, we'll provide a full refund.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                What types of documents can I analyze?
              </h3>
              <p className="text-muted-foreground">
                Our AI can analyze contracts, agreements, terms of service, privacy policies, 
                and other legal documents in PDF, Word, and text formats.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals who trust Legalese for their legal document analysis.
          </p>
        </div>
      </div>
    </div>
  )
}