
import Stripe from "https://esm.sh/stripe@14.21.0";
import { logStep, applyBuyerPriceMarkup, StripeSessionOptions, Lead } from "./utils.ts";

// Get payment method types - always return just 'card'
// This is the key fix - Stripe Checkout doesn't support directly adding google_pay/apple_pay to payment_method_types
// but will automatically show them when available in the user's browser
const getPaymentMethodTypes = () => {
  return ['card'];
};

// Create Stripe checkout session
export const createStripeCheckoutSession = async (lead: Lead, user: any, req: Request) => {
  logStep("Creating Stripe checkout session");
  
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Apply 20% markup to the price for buyers and round to nearest dollar
    const originalPrice = lead.price;
    const markedUpPrice = applyBuyerPriceMarkup(originalPrice);
    
    logStep("Applying price markup and rounding", { originalPrice, markedUpPrice });
    
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
            unit_amount: Math.round(Number(markedUpPrice) * 100), // Convert dollars to cents, with markup applied and rounded
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
      },
      // Enable automatic tax calculation
      automatic_tax: { enabled: true }
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
