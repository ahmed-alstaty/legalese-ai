import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_TIERS, getSubscriptionTier } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // Get user's subscription from database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user profile for current usage
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

    let subscriptionData = null

    if (subscription && subscription.stripe_subscription_id) {
      try {
        // Get latest subscription data from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        )

        const tier = getSubscriptionTier(subscription.price_id)
        const tierConfig = SUBSCRIPTION_TIERS[tier]

        subscriptionData = {
          id: subscription.id,
          tier,
          status: stripeSubscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: (subscription as any).current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          price: tierConfig.price,
          price_id: subscription.price_id,
          stripe_subscription_id: subscription.stripe_subscription_id,
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error)
        // If Stripe subscription doesn't exist, treat as free tier
      }
    }

    // If no subscription, user is on free tier
    if (!subscriptionData) {
      subscriptionData = {
        id: null,
        tier: 'free' as const,
        status: 'active',
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        price: 0,
        price_id: null,
        stripe_subscription_id: null,
      }
    }

    const tierConfig = SUBSCRIPTION_TIERS[subscriptionData.tier]

    return NextResponse.json({
      subscription: subscriptionData,
      usage: {
        current: profile.analyses_used_this_month,
        limit: tierConfig.analysisLimit,
        unlimited: tierConfig.analysisLimit === -1,
      },
      tier_config: tierConfig,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    
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

export async function DELETE(request: NextRequest) {
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

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError || !subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    )

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        current_period_end: new Date((canceledSubscription as any).current_period_end * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    
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

export async function PATCH(request: NextRequest) {
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

    const { action } = await request.json()

    if (action !== 'reactivate') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get user's subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subscriptionError || !subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Reactivate subscription
    const reactivatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    )

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: reactivatedSubscription.status,
        cancel_at_period_end: reactivatedSubscription.cancel_at_period_end,
        current_period_end: new Date((reactivatedSubscription as any).current_period_end * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    
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