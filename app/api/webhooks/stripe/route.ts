import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, WEBHOOK_EVENTS, getSubscriptionTier } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Disable body parsing, need raw body for webhook signature verification
export const runtime = 'nodejs'

async function constructEvent(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    throw new Error('Missing stripe-signature header')
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET')
  }

  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const supabase = await createClient()
  
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  // Get customer to find user
  const customer = await stripe.customers.retrieve(customerId)
  
  if (!customer || customer.deleted) {
    console.error('Customer not found or deleted:', customerId)
    return
  }

  const customerData = customer as Stripe.Customer
  const userId = customerData.metadata?.userId

  if (!userId) {
    console.error('No userId in customer metadata:', customerId)
    return
  }

  // Determine subscription status and tier
  let status = subscription.status
  let currentPeriodStart: string | null = null
  let currentPeriodEnd: string | null = null
  let priceId: string | null = null

  if (subscription.status === 'active' && subscription.items.data.length > 0) {
    const item = subscription.items.data[0]
    priceId = item.price.id
    currentPeriodStart = new Date((subscription as any).current_period_start * 1000).toISOString()
    currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString()
  }

  // Handle cancellation
  if (eventType === WEBHOOK_EVENTS.SUBSCRIPTION_DELETED) {
    status = 'canceled'
    priceId = null
  }

  // Update subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status,
      price_id: priceId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })

  if (subscriptionError) {
    console.error('Error updating subscription:', subscriptionError)
    throw subscriptionError
  }

  // Update user profile with new tier
  const tier = getSubscriptionTier(priceId)
  const subscriptionStatus = status === 'active' ? 'active' : 'inactive'

  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: tier,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating user profile:', profileError)
    throw profileError
  }

  console.log(`Successfully updated subscription for user ${userId}: ${tier} (${status})`)
}

async function handleInvoicePayment(
  invoice: Stripe.Invoice,
  succeeded: boolean
) {
  const supabase = await createClient()
  
  const customerId = invoice.customer as string
  
  // Get customer to find user
  const customer = await stripe.customers.retrieve(customerId)
  
  if (!customer || customer.deleted) {
    console.error('Customer not found or deleted:', customerId)
    return
  }

  const customerData = customer as Stripe.Customer
  const userId = customerData.metadata?.userId

  if (!userId) {
    console.error('No userId in customer metadata:', customerId)
    return
  }

  if (succeeded) {
    // Reset monthly usage on successful payment
    const { error } = await supabase
      .from('user_profiles')
      .update({
        analyses_used_this_month: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error resetting monthly usage:', error)
      throw error
    }

    console.log(`Reset monthly usage for user ${userId} after successful payment`)
  } else {
    // Handle failed payment - could suspend access or send notification
    console.log(`Payment failed for user ${userId}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await constructEvent(request)

    console.log(`Received webhook: ${event.type}`)

    switch (event.type) {
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription,
          event.type
        )
        break

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePayment(
          event.data.object as Stripe.Invoice,
          true
        )
        break

      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePayment(
          event.data.object as Stripe.Invoice,
          false
        )
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}