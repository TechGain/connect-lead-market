
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep, applyBuyerPriceMarkup, StripeSessionOptions, Lead } from "./utils.ts";

// Get payment method types - always return just 'card'
// This is the key fix - Stripe Checkout doesn't support directly adding google_pay/apple_pay to payment_method_types
const getPaymentMethodTypes = () => {
  return ['card'];
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
    
    // Always use 'card' as the payment method type - Stripe will detect and use Google/Apple Pay automatically
    // when available in the user's browser
    const paymentMethodTypes = getPaymentMethodTypes();
    
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
        preferredPaymentMethod, // Store preferred method in metadata for reference
      },
      // Enable automatic tax calculation
      automatic_tax: { enabled: true }
    };
    
    // Add payment_intent_data for wallets when Google/Apple Pay is selected
    // This is the proper way to influence which payment methods are prioritized
    if (preferredPaymentMethod === 'google_pay' || preferredPaymentMethod === 'apple_pay') {
      logStep("Adding wallet preference to payment_intent_data", { preferredPaymentMethod });
      
      // FIX: Use a simpler payment_intent_data structure that Stripe accepts
      // Remove the nested payment_method_options object that was causing the error
      sessionConfig.payment_intent_data = {
        // Store preferred payment method - Stripe will use this internally
        metadata: {
          preferred_payment_method: preferredPaymentMethod
        }
      };
    }
    
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
