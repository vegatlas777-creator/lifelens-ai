import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const WIX_API_KEY = Deno.env.get("WIX_PAYMENTS_API_KEY");
const WIX_SITE_ID = Deno.env.get("WIX_PAYMENTS_SITE_ID");

const PLANS = {
  monthly: {
    name: "3 in 1 Healthy Choice — Premium Monthly",
    price: "5.00",
    frequency: "MONTH",
    interval: 1,
    title: "Premium Monthly",
    description: "Full access to personalized plans, daily AI coaching, and advanced insights. Billed monthly with a 7-day free trial.",
  },
  annual: {
    name: "3 in 1 Healthy Choice — Premium Annual",
    price: "50.00",
    frequency: "YEAR",
    interval: 1,
    title: "Premium Annual",
    description: "Full access to personalized plans, daily AI coaching, and advanced insights. Billed yearly with a 7-day free trial — save 17%.",
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const planKey = body.plan; // "monthly" | "annual"
    const plan = PLANS[planKey];
    if (!plan) return Response.json({ error: "Invalid plan. Choose 'monthly' or 'annual'." }, { status: 400 });

    // Origin for callback URLs — Deno req.url contains wrong value
    const origin = req.headers.get("Origin") || "https://3in1healthychoice.app";

    const items = [{
      name: plan.name,
      quantity: 1,
      price: plan.price,
      subscriptionInfo: {
        subscriptionSettings: {
          frequency: plan.frequency,
          interval: plan.interval,
          freeTrialPeriod: {
            frequency: "DAY",
            interval: 7,
          },
        },
        title: plan.title,
        description: plan.description,
      },
    }];

    const checkoutBody = {
      cart: {
        items,
        customerInfo: {
          email: user.email,
        },
      },
      callbackUrls: {
        postFlowUrl: origin + "/",
        thankYouPageUrl: origin + "/thank-you",
      },
    };

    const response = await fetch(
      "https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": WIX_API_KEY,
          "wix-site-id": WIX_SITE_ID,
        },
        body: JSON.stringify(checkoutBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Wix checkout error:", JSON.stringify(data));
      return Response.json({ error: "Failed to create checkout session. Please try again." }, { status: 500 });
    }

    const checkoutSession = data.checkoutSession;

    // Persist a pending subscription record — webhook will match by wix_checkout_id
    await base44.asServiceRole.entities.Subscription.create({
      plan: "premium",
      status: "pending",
      billing_cycle: planKey,
      wix_subscription_id: null,
      wix_checkout_id: checkoutSession.id,
      trial_end_date: null,
      current_period_end: null,
      created_by_id: user.id,
    });

    return Response.json({
      redirectUrl: checkoutSession.redirectUrl,
      checkoutId: checkoutSession.id,
    });
  } catch (error) {
    console.error("create-checkout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});