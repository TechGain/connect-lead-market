
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep, applyBuyerPriceMarkup, StripeSessionOptions, Lead } from "./utils.ts";

// Configure payment method options based on preference
const getPaymentMethodOptions = (preferredMethod: string) => {
  // Base payment method options
  const options: any = {
    card: {
      setup_future_usage: 'off_session'
    }
  };
  
  // Add Google Pay and Apple Pay specific options if needed
  if (preferredMethod === 'google_pay') {
    options.google_pay = {
      setup_future_usage: 'off_session'
    };
  }
  
  if (preferredMethod === 'apple_pay') {
    options.apple_pay = {
      setup_future_usage: 'off_session'
    };
  }
  
  return options;
};

// Configure payment method types based on preference
const getPaymentMethodTypes = (preferredMethod: string) => {
  // Start with the preferred method
  const paymentMethodTypes = [preferredMethod];
  
  // Always include card as a fallback payment method
  if (preferredMethod !== 'card' && !paymentMethodTypes.includes('card')) {
    paymentMethodTypes.push('card');
  }
  
  return paymentMethodTypes;
};

// Create Stripe checkout session
export const createStripeCheckoutSession = async (lead: Lead, user: any, preferredPaymentMethod: string, req: Request) => {
  logStep("Creating Stripe checkout session", { preferredPaymentMethod });
  
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Apply 10% markup to the price for buyers
    const originalPrice = lead.price;
    const markedUpPrice = applyBuyerPriceMarkup(originalPrice);
    
    logStep("Applying price markup", { originalPrice, markedUpPrice });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const origin = req.headers.get("origin") || "https://lead-marketplace-platform.com";
    
    // Get payment method types based on preference
    const paymentMethodTypes = getPaymentMethodTypes(preferredPaymentMethod);
    
    logStep("Using payment methods", { paymentMethodTypes });
    
    // Configure the session options
    const sessionConfig: any = {
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${lead.type} Lead in ${lead.location}`,
              description: `Purchase access to contact information for this ${lead.type} lead`,
            },
            unit_amount: Math.round(Number(markedUpPrice) * 100), // Convert dollars to cents, with markup applied
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/purchases?success=true&lead_id=${lead.id}`,
      cancel_url: `${origin}/marketplace?canceled=true`,
      client_reference_id: lead.id, // Store lead ID for reference
      metadata: {
        leadId: lead.id,
        buyerId: user.id,
        originalPrice: originalPrice.toString(),
        markedUpPrice: markedUpPrice.toString(),
        preferredPaymentMethod,
      },
      // Enable automatic tax calculation
      automatic_tax: { enabled: true },
      // Add payment method options
      payment_method_options: getPaymentMethodOptions(preferredPaymentMethod)
    };
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    return session;
  } catch (e) {
    const error = "Failed to create Stripe checkout session: " + e.message;
    logStep("ERROR: " + error);
    throw new Error(error);
  }
};
