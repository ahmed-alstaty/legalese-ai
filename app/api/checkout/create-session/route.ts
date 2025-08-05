import { NextRequest, NextResponse } from 'next/server'
import { stripe, getOrCreateStripeCustomer, SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { priceId, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Validate price ID
    const validPriceIds = [
      SUBSCRIPTION_TIERS.starter.priceId,
      SUBSCRIPTION_TIERS.professional.priceId,
    ].filter(Boolean)

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      profile.full_name || undefined
    )

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    let sessionConfig: any = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${request.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.headers.get('origin')}/pricing`,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    }

    // If user has existing subscription, modify it instead of creating new one
    if (existingSubscription && existingSubscription.stripe_subscription_id) {
      // For subscription changes, redirect to customer portal instead
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${request.headers.get('origin')}/dashboard`,
      })

      return NextResponse.json({
        url: portalSession.url,
        type: 'billing_portal',
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({
      url: session.url,
      type: 'checkout',
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}